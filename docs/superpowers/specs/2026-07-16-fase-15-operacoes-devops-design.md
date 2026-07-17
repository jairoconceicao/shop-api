# Fase 15 — Operações & DevOps — Design

**Data:** 2026-07-16
**Status:** PLANNED
**Dependências:** Nenhuma (infraestrutura operacional)

## 1. Contexto

O deploy atual é manual (build Docker local + push ACR + az containerapp update). Não há pipeline CI/CD, backup automatizado, nem testes de carga. Esta fase prepara a operação para produção sustentada.

## 2. Objetivo

Pipeline CI/CD, backups, disaster recovery, load testing, alertas e documentação operacional.

## 3. CI/CD Pipeline (GitHub Actions)

### Workflow: `ci.yml` (Pull Request)

```yaml
name: CI
on:
  pull_request:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with: { dotnet-version: '10.0.x' }
      - run: dotnet restore aspnet-api/
      - run: dotnet build --no-restore aspnet-api/
      - run: dotnet test --no-build --verbosity normal aspnet-api/

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
        working-directory: frontend/
      - run: npm run lint
        working-directory: frontend/
      - run: npm run typecheck
        working-directory: frontend/
      - run: npm run test
        working-directory: frontend/
```

### Workflow: `deploy.yml` (Push/merge na main)

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: azure/docker-login@v2
        with:
          login-server: crshopapiprod001.azurecr.io
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}
      - run: |
          docker build -t crshopapiprod001.azurecr.io/shop-api:${{ github.sha }} .
          docker push crshopapiprod001.azurecr.io/shop-api:${{ github.sha }}
      - uses: azure/container-apps-deploy-action@v2
        with:
          containerAppName: ca-shopapi-prod-001
          resourceGroup: rg-shopapi-prod-001
          imageToDeploy: crshopapiprod001.azurecr.io/shop-api:${{ github.sha }}

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: build-and-deploy
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
        working-directory: frontend/
      - uses: azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.SWA_DEPLOY_TOKEN }}
          app_location: frontend/dist
```

### Secrets no GitHub:
- `ACR_USERNAME`, `ACR_PASSWORD`
- `SWA_DEPLOY_TOKEN`
- `AZURE_CREDENTIALS` (service principal)

## 4. Backup

### Script de Backup Automatizado

Azure Automation ou GitHub Actions scheduled:

```bash
# backup.sh
TIMESTAMP=$(date -u +"%Y%m%d%H%M%S")
BACKUP_FILE="shopapi-backup-${TIMESTAMP}.dump"

pg_dump \
  -h psql-shopapi-prod-001.postgres.database.azure.com \
  -U shopapi \
  -d shopapi \
  -Fc \
  --no-owner \
  --no-acl \
  -f "${BACKUP_FILE}"

az storage blob upload \
  --account-name stshopapiprod001 \
  --container-name backups \
  --name "${BACKUP_FILE}" \
  --file "${BACKUP_FILE}"

# Cleanup: remover backups > 30 dias
az storage blob delete-batch \
  --account-name stshopapiprod001 \
  --source backups \
  --if-modified-before "$(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%SZ)"
```

Configurar como GitHub Actions scheduled (`cron: '0 3 * * *'` — diário às 3h UTC).

## 5. Disaster Recovery

### Script de Restore

```bash
# restore.sh
# 1. Recriar infra via Bicep
az deployment group create \
  --resource-group rg-shopapi-prod-001 \
  --template-file infra/main.bicep \
  --parameters infra/main.bicepparam

# 2. Restaurar banco
pg_restore \
  -h psql-shopapi-prod-001.postgres.database.azure.com \
  -U shopapi \
  -d shopapi \
  --clean \
  --if-exists \
  "${BACKUP_FILE}"

# 3. Deploy API
az containerapp update \
  --name ca-shopapi-prod-001 \
  --resource-group rg-shopapi-prod-001 \
  --image crshopapiprod001.azurecr.io/shop-api:latest
```

### RTO/RPO Targets
- **RTO (Recovery Time Objective):** 30 minutos
- **RPO (Recovery Point Objective):** 24 horas (backup diário)

## 6. Load Testing (k6)

### Cenários

```javascript
// k6/catalog-load.js
import { check } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // ramp up
    { duration: '1m',  target: 100 }, // carga plena
    { duration: '30s', target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% das reqs < 500ms
    http_req_failed: ['rate<0.01'],     // < 1% de erros
  },
};

export default function () {
  const res = http.get(`${__ENV.BASE_URL}/api/v1/produto?page=1&size=20`);
  check(res, { 'status 200': (r) => r.status === 200 });
}
```

### Cenários:
1. **Catálogo:** 100 VUs, listar produtos com scroll (páginas 1-5)
2. **Carrinho:** 50 VUs, adicionar/remover itens
3. **Checkout:** 25 VUs, fluxo completo (login → carrinho → pedido)
4. **Login:** 100 VUs, spike de autenticação

## 7. Alertas (Azure Monitor)

| Alerta | Condição | Severidade |
|--------|----------|------------|
| Erro 5xx > 5% | `requests/failed > 5%` em janela de 5 min | Alta |
| Latência p95 > 1s | `requests/duration p95 > 1000ms` em 5 min | Média |
| DB connection failures | `health/db status != Healthy` | Crítica |
| Container restart loop | `container restarts > 3` em 1h | Alta |
| Certificado expirando | TLS cert < 30 dias | Média |

## 8. Runbook Operacional

Documento em `docs/runbook.md` com:

1. **Arquitetura:** diagrama de recursos Azure e dependências
2. **Acesso:** como obter credenciais, conectar no banco, ver logs
3. **Deploy:** passo a passo para deploy manual (fallback se CI/CD falhar)
4. **Rollback:** como reverter para versão anterior (`az containerapp revision list` + `activate`)
5. **Escala:** como ajustar CPU/memória/replicas do Container App
6. **Incidentes comuns:**
   - API lenta → verificar DTU do PostgreSQL, logs de query lenta
   - 503 Service Unavailable → verificar status do Container App
   - Erro de conexão DB → verificar firewall, IP allowlist, senha expirada
7. **Contatos:** quem acionar em cada tipo de incidente

## 9. Testes

- CI pipeline: validação de build + testes em PR
- Deploy pipeline: validação de smoke test (GET /health) após deploy
- DR script: executar em ambiente de staging para validar restore
- Load test: executar contra ambiente de staging antes de cada release major
