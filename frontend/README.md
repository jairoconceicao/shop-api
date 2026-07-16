# Shop API Frontend

SPA de e-commerce em React, TypeScript, Vite e Tailwind CSS.

## Requisitos

- Node.js 20.19.0 ou superior
- npm compatível com a versão instalada do Node.js
- Chromium do Playwright para os testes E2E
- Para integração real: Docker Desktop ou Docker Engine; o .NET SDK 10 é
  executado pelo container oficial

## Instalação

Execute na pasta `frontend`:

```sh
cd frontend
npm ci
npx playwright install chromium
```

`npm ci` usa o `package-lock.json`, remove uma instalação existente em
`node_modules` e instala exatamente as dependências travadas.

## Ambiente

Crie `frontend/.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:5228
VITE_ENABLE_MSW=false
```

`VITE_API_BASE_URL` é obrigatória e aceita somente URLs HTTP ou HTTPS.
`VITE_ENABLE_MSW=true` habilita os mocks apenas em modo `DEV`; o MSW fica
desativado por padrão e não é iniciado no build de produção.

Em PowerShell, também é possível configurar somente a sessão atual:

```powershell
$env:VITE_API_BASE_URL='http://localhost:5228'
$env:VITE_ENABLE_MSW='false'
npm run dev
```

Em shells POSIX, use `VITE_ENABLE_MSW=true npm run dev` para iniciar o
desenvolvimento com mocks. Em PowerShell, atribua `'true'` à variável antes de
executar `npm run dev`.

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run dev` | Inicia o Vite em desenvolvimento. |
| `npm run build` | Gera o build de produção em `dist`. |
| `npm run verify:production-graph` | Audita chunks iniciais e rotas lazy. |
| `npm run audit:performance` | Executa build e auditoria do grafo. |
| `npm run audit:private-data` | Audita persistência e logs sensíveis, incluindo self-test. |
| `npm run typecheck` | Valida os projetos TypeScript. |
| `npm run lint` | Executa ESLint. |
| `npm test` | Executa Vitest uma vez. |
| `npm run test:watch` | Executa Vitest em modo interativo. |
| `npm run test:e2e` | Executa as jornadas Playwright no Chromium. |
| `npm run dev:e2e` | Inicia o servidor determinístico usado pelo Playwright. |
| `npm run preview` | Serve localmente o conteúdo de `dist`. |

Os testes E2E usam um backend simulado pelas fixtures do Playwright. Eles não
substituem o smoke integrado contra a API e o PostgreSQL reais.

## Gates de qualidade

Execute sequencialmente:

```sh
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
npm run verify:production-graph
npm run audit:private-data
```

Todos os comandos devem encerrar com exit code zero.

## Execução integrada

O procedimento abaixo usa banco efêmero, sem volume nomeado. Execute o bloco
PowerShell a partir da raiz do repositório. Ele cria somente a rede
`shop-api-network` e os containers `shop-api-db` e `shop-api-app`, aplica as
migrations e aguarda a API por um endpoint público. Esse endpoint é usado para
readiness porque o backend não expõe um healthcheck.

```powershell
$ErrorActionPreference = 'Stop'
$repo = (Get-Location).Path
$frontendInstructions = @'
Em outro terminal PowerShell, execute:

Set-Location "<REPO>/frontend"
$env:VITE_API_BASE_URL='http://localhost:5228'
$env:VITE_ENABLE_MSW='false'
npm run dev -- --host 127.0.0.1

Abra http://127.0.0.1:5173 e confirme que a Home carrega categorias da API.
'@

docker info *> $null
if ($LASTEXITCODE -ne 0) { throw 'Docker daemon indisponível.' }

if (docker container inspect shop-api-app 2>$null) { docker rm -f shop-api-app }
if (docker container inspect shop-api-db 2>$null) { docker rm -f shop-api-db }
if (docker network inspect shop-api-network 2>$null) { docker network rm shop-api-network }

try {
  docker network create shop-api-network
  if ($LASTEXITCODE -ne 0) { throw 'Falha ao criar shop-api-network.' }

  docker run --name shop-api-db --network shop-api-network `
    -e POSTGRES_USER=shopapi `
    -e POSTGRES_PASSWORD=shopapi `
    -e POSTGRES_DB=shopapi `
    -p 5432:5432 `
    --health-cmd='pg_isready -U shopapi -d shopapi' `
    --health-interval=2s --health-timeout=3s --health-retries=30 `
    -d postgres:17
  if ($LASTEXITCODE -ne 0) { throw 'Falha ao iniciar shop-api-db.' }

  $dbDeadline = (Get-Date).AddMinutes(2)
  do {
    Start-Sleep -Seconds 2
    $dbHealth = docker inspect --format='{{.State.Health.Status}}' shop-api-db
    $dbState = docker inspect --format='{{.State.Status}}' shop-api-db
    if ($dbState -eq 'exited') {
      docker logs shop-api-db
      throw 'shop-api-db encerrou antes do readiness.'
    }
    if ((Get-Date) -ge $dbDeadline) {
      docker logs shop-api-db
      throw 'Timeout aguardando shop-api-db.'
    }
  } until ($dbHealth -eq 'healthy')

  docker run --rm --network shop-api-network `
    -v "${repo}:/workspace" `
    -w /workspace/aspnet-api `
    -e 'ConnectionStrings__ShopDb=Host=shop-api-db;Port=5432;Database=shopapi;Username=shopapi;Password=shopapi' `
    mcr.microsoft.com/dotnet/sdk:10.0 `
    sh -lc 'dotnet tool install --global dotnet-ef --version 10.* && export PATH="$PATH:/root/.dotnet/tools" && dotnet ef database update'
  if ($LASTEXITCODE -ne 0) { throw 'Migration EF Core falhou.' }

  docker run --name shop-api-app --network shop-api-network `
    -v "${repo}:/workspace" `
    -w /workspace/aspnet-api `
    -e ASPNETCORE_ENVIRONMENT=Development `
    -e ASPNETCORE_URLS=http://+:8080 `
    -e 'ConnectionStrings__ShopDb=Host=shop-api-db;Port=5432;Database=shopapi;Username=shopapi;Password=shopapi' `
    -p 5228:8080 `
    -d mcr.microsoft.com/dotnet/sdk:10.0 `
    dotnet run --no-launch-profile --urls http://+:8080
  if ($LASTEXITCODE -ne 0) { throw 'Falha ao iniciar shop-api-app.' }

  $apiDeadline = (Get-Date).AddMinutes(3)
  do {
    Start-Sleep -Seconds 2
    $apiState = docker inspect --format='{{.State.Status}}' shop-api-app
    if ($apiState -eq 'exited') {
      docker logs shop-api-app
      throw 'shop-api-app encerrou antes do readiness.'
    }
    try {
      $response = Invoke-WebRequest -UseBasicParsing http://localhost:5228/api/v1/categoria
    } catch {
      $response = $null
    }
    if ((Get-Date) -ge $apiDeadline) {
      docker logs shop-api-app
      throw 'Timeout aguardando shop-api-app.'
    }
  } until ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300)

  Write-Host ($frontendInstructions.Replace('<REPO>', $repo))
  Read-Host 'Pressione Enter depois de concluir o smoke no navegador'
} finally {
  if (docker container inspect shop-api-app 2>$null) { docker rm -f shop-api-app }
  if (docker container inspect shop-api-db 2>$null) { docker rm -f shop-api-db }
  if (docker network inspect shop-api-network 2>$null) { docker network rm shop-api-network }
}
```

No segundo terminal, o Vite permanece sob controle do usuário:

```powershell
Set-Location "$repo/frontend"
$env:VITE_API_BASE_URL='http://localhost:5228'
$env:VITE_ENABLE_MSW='false'
npm run dev -- --host 127.0.0.1
```

Abra `http://127.0.0.1:5173` e confirme que a Home consulta categorias na API
real sem erro CORS. A validação automatizada deste fluxo usa Chromium sem
fixtures, handlers ou interceptação de API.

Se precisar executar o cleanup manualmente, use somente:

```powershell
docker rm -f shop-api-app
docker rm -f shop-api-db
docker network rm shop-api-network
```

Esses comandos removem apenas os três recursos nomeados. Encerre o Vite no
terminal em que ele foi iniciado.

## Dados locais e privacidade

| Chave | Local | Conteúdo permitido |
| --- | --- | --- |
| `shop-api:auth` | exatamente um entre `sessionStorage` e `localStorage` | sessão (`token`, `tipo`, `expiraEm`, `usuarioId`, `clienteId`, `email`) e modalidade |
| `shop-api:cart-session` | `localStorage` | somente `cartIdsByCustomer` |

CPF, endereço, perfil, itens, pedidos, respostas HTTP e caches do React Query
não são persistidos. Logout, respostas `401` e cancelamento limpam o estado
privado; respostas tardias não restauram dados. Execute
`npm run audit:private-data` para reproduzir a auditoria.

## Solução de problemas

| Problema | Ação |
| --- | --- |
| Erro na configuração de ambiente | Configure `VITE_API_BASE_URL` com uma URL HTTP(S) válida. |
| MSW não inicia | Confirme que o Vite está em `DEV` e que `VITE_ENABLE_MSW` contém literalmente `true`. |
| Porta ocupada | Identifique e libere 5173, 5228 ou 5432. Não troque a porta da API sem ajustar também o ambiente e o CORS. |
| Docker daemon parado | Inicie o Docker Desktop ou Engine e aguarde `docker info` encerrar com sucesso. |
| Banco não fica saudável | Inspecione `docker logs shop-api-db`. |
| Migration ou API falha | Inspecione `docker logs shop-api-app`, confira o override `shopapi/shopapi` e repita o container one-shot de migration. |
| Erro CORS | Use exatamente `http://localhost:5173` ou `http://127.0.0.1:5173`, que são as origens permitidas. |
| Chromium ausente | Execute `npx playwright install chromium`. |
| Dependências inconsistentes | Execute novamente `npm ci`. |
| Banco vazio após reinício | É o comportamento esperado: o procedimento integrado não cria volume persistente. |
