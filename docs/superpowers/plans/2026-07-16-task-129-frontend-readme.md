# TASK-129 Frontend README Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar um `frontend/README.md` factual, copiável e validado em checkout limpo, cobrindo instalação, configuração, scripts, execução integrada e política de dados locais.

**Architecture:** Manter a documentação autocontida no frontend e derivada dos arquivos versionados. Executar PostgreSQL e API com imagens oficiais, rede e containers nomeados, aplicar migrations explicitamente e manter o servidor Vite no host; validar o texto em worktree detached temporário antes de concluir.

**Tech Stack:** Markdown, Node.js 20.19+, npm, Vite 6, Vitest, Playwright Chromium, .NET SDK 10, EF Core 10, PostgreSQL 17 e Docker.

## Global Constraints

- `BASE_COMMIT`: `754a4530f20c9ac6d68ec1a6318559b26dbbbaf0`.
- Criar somente `frontend/README.md` e evidências documentais da TASK-129.
- Não criar Dockerfile, Compose, scripts auxiliares, endpoints ou mudanças de produto.
- Usar exatamente `shop-api-db` para PostgreSQL e `shop-api-app` para a API .NET.
- Banco integrado: database, username e password `shopapi`.
- MSW é opt-in: somente `VITE_ENABLE_MSW=true` em desenvolvimento.
- Validar em worktree detached temporário sob `.worktrees`; daemon Docker indisponível bloqueia `DONE`.
- Cleanup remove somente containers/rede explicitamente nomeados pelo procedimento.

---

## File Map

- Create: `frontend/README.md` — guia operacional completo do frontend.
- Read: `frontend/package.json` — fonte de todos os scripts e versões.
- Read: `frontend/src/shared/config/environment.ts` — contrato de `VITE_API_BASE_URL`.
- Read: `frontend/src/shared/testing/enableMocking.ts` — regra opt-in do MSW.
- Read: `frontend/playwright.config.ts` — comportamento do E2E.
- Read: `aspnet-api/aspnet-api.csproj` e migrations — runtime e preparação do banco.
- Read: `docs/frontend-quality/task-126-private-data-audit.md` — política aprovada.
- Modify after approval only: `docs/frontend-tasks-v2.md` — status, evidência e commits.

### Task 1: Escrever o guia local e o catálogo de scripts

**Files:**
- Create: `frontend/README.md`

**Interfaces:**
- Consumes: scripts de `frontend/package.json`, schema de ambiente e regra do MSW.
- Produces: comandos locais copiáveis e catálogo completo dos scripts.

- [ ] **Step 1: Criar cabeçalho, requisitos e instalação**

Escrever requisitos com pisos verificáveis:

```markdown
# Shop API Frontend

SPA de e-commerce em React, TypeScript, Vite e Tailwind CSS.

## Requisitos

- Node.js 20.19.0 ou superior
- npm compatível com a versão instalada do Node.js
- Chromium do Playwright para os testes E2E
- Para integração real: Docker Desktop/Engine e .NET SDK 10 dentro do container oficial

## Instalação

```sh
cd frontend
npm ci
npx playwright install chromium
```
```

Explicar que `npm ci` usa `package-lock.json`, substitui `node_modules` e deve
ser executado na pasta `frontend`.

- [ ] **Step 2: Documentar ambiente e MSW**

Incluir `.env.local` cross-platform:

```dotenv
VITE_API_BASE_URL=http://localhost:5228
VITE_ENABLE_MSW=false
```

Incluir alternativa PowerShell para a sessão atual:

```powershell
$env:VITE_API_BASE_URL='http://localhost:5228'
$env:VITE_ENABLE_MSW='false'
npm run dev
```

Registrar literalmente:

- `VITE_API_BASE_URL` é obrigatória e aceita somente HTTP(S);
- `VITE_ENABLE_MSW=true` habilita mocks somente em `DEV`;
- MSW é desativado por padrão e não é ativado em build de produção;
- usar `VITE_ENABLE_MSW=true npm run dev` em shells POSIX ou o equivalente
  PowerShell, sem adicionar `cross-env` a novos scripts.

- [ ] **Step 3: Documentar todos os scripts**

Criar tabela com os 12 scripts, sem omissões:

```markdown
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
```

Esclarecer que o E2E usa backend simulado pelas fixtures Playwright e não
substitui o smoke integrado real.

- [ ] **Step 4: Documentar gates sequenciais**

Fornecer bloco copiável na ordem:

```sh
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
npm run verify:production-graph
npm run audit:private-data
```

Resultado esperado: todos os comandos encerram com exit code zero. Não combinar
com `&&` no README, para que o mesmo bloco seja copiável linha a linha em
PowerShell e shells POSIX.

### Task 2: Documentar a execução integrada com containers nomeados

**Files:**
- Modify: `frontend/README.md`

**Interfaces:**
- Consumes: migrations EF Core, CORS local e contrato de conexão PostgreSQL.
- Produces: PostgreSQL `shop-api-db`, API `shop-api-app` e frontend no host.

- [ ] **Step 1: Documentar preflight e cleanup idempotente em PowerShell**

O README deve orientar a partir da raiz do repositório e definir:

```powershell
$ErrorActionPreference = 'Stop'
$repo = (Get-Location).Path
docker info | Out-Null

docker rm -f shop-api-app 2>$null
docker rm -f shop-api-db 2>$null
docker network rm shop-api-network 2>$null
docker network create shop-api-network
```

Após cada remoção tolerada, restaurar comportamento estrito quando necessário;
alternativamente usar inspeção condicional:

```powershell
if (docker container inspect shop-api-app 2>$null) { docker rm -f shop-api-app }
if (docker container inspect shop-api-db 2>$null) { docker rm -f shop-api-db }
if (docker network inspect shop-api-network 2>$null) { docker network rm shop-api-network }
```

Preferir a variante condicional no texto final. Nunca usar `docker system
prune`, `docker volume prune` ou remoção por filtro amplo.

- [ ] **Step 2: Documentar PostgreSQL e readiness**

Adicionar:

```powershell
docker run --name shop-api-db --network shop-api-network `
  -e POSTGRES_USER=shopapi `
  -e POSTGRES_PASSWORD=shopapi `
  -e POSTGRES_DB=shopapi `
  -p 5432:5432 `
  --health-cmd='pg_isready -U shopapi -d shopapi' `
  --health-interval=2s --health-timeout=3s --health-retries=30 `
  -d postgres:17

do {
  Start-Sleep -Seconds 2
  $dbHealth = docker inspect --format='{{.State.Health.Status}}' shop-api-db
} until ($dbHealth -eq 'healthy')
```

Declarar que o banco é efêmero porque nenhum volume nomeado é criado.

- [ ] **Step 3: Documentar migrations com o override correto**

Adicionar um container one-shot:

```powershell
docker run --rm --network shop-api-network `
  -v "${repo}:/workspace" `
  -w /workspace/aspnet-api `
  -e 'ConnectionStrings__ShopDb=Host=shop-api-db;Port=5432;Database=shopapi;Username=shopapi;Password=shopapi' `
  mcr.microsoft.com/dotnet/sdk:10.0 `
  sh -lc 'dotnet tool install --global dotnet-ef --version 10.* && export PATH="$PATH:/root/.dotnet/tools" && dotnet ef database update'
```

Resultado esperado: exit code zero e migrations aplicadas a `shopapi`.

- [ ] **Step 4: Documentar a API no container `shop-api-app`**

Adicionar:

```powershell
docker run --name shop-api-app --network shop-api-network `
  -v "${repo}:/workspace" `
  -w /workspace/aspnet-api `
  -e ASPNETCORE_ENVIRONMENT=Development `
  -e ASPNETCORE_URLS=http://+:8080 `
  -e 'ConnectionStrings__ShopDb=Host=shop-api-db;Port=5432;Database=shopapi;Username=shopapi;Password=shopapi' `
  -p 5228:8080 `
  -d mcr.microsoft.com/dotnet/sdk:10.0 `
  dotnet run --no-launch-profile --urls http://+:8080

do {
  Start-Sleep -Seconds 2
  try {
    $response = Invoke-WebRequest -UseBasicParsing http://localhost:5228/api/v1/categoria
  } catch {
    $response = $null
  }
} until ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300)
```

Não chamar a rota de “health”; explicar que é um readiness por endpoint público
porque o backend não expõe healthcheck.

- [ ] **Step 5: Documentar frontend host e smoke**

Em outro terminal:

```powershell
Set-Location "$repo/frontend"
$env:VITE_API_BASE_URL='http://localhost:5228'
$env:VITE_ENABLE_MSW='false'
npm run dev -- --host 127.0.0.1
```

Abrir `http://127.0.0.1:5173` e confirmar que a Home consulta categorias/API
real sem erro CORS. O README deve distinguir essa execução dos testes E2E.

- [ ] **Step 6: Documentar cleanup exato**

```powershell
docker rm -f shop-api-app
docker rm -f shop-api-db
docker network rm shop-api-network
```

Explicar que somente esses três recursos são removidos e que parar o processo
Vite continua sendo responsabilidade do terminal que o iniciou.

### Task 3: Documentar privacidade e troubleshooting

**Files:**
- Modify: `frontend/README.md`

**Interfaces:**
- Consumes: relatório aprovado `docs/frontend-quality/task-126-private-data-audit.md`.
- Produces: política operacional fiel e diagnósticos acionáveis.

- [ ] **Step 1: Registrar a política de dados locais**

Adicionar tabela:

```markdown
| Chave | Local | Conteúdo permitido |
| --- | --- | --- |
| `shop-api:auth` | exatamente um entre `sessionStorage` e `localStorage` | sessão (`token`, `tipo`, `expiraEm`, `usuarioId`, `clienteId`, `email`) e modalidade |
| `shop-api:cart-session` | `localStorage` | somente `cartIdsByCustomer` |
```

Registrar que CPF, endereço, perfil, itens, pedidos, respostas HTTP e caches do
React Query não são persistidos; logout, `401` e cancelamento limpam estado
privado; respostas tardias não restauram dados. Referenciar
`npm run audit:private-data` como prova reproduzível.

- [ ] **Step 2: Escrever troubleshooting factual**

Criar tabela problema/ação para:

- erro de ambiente: configurar URL HTTP(S);
- MSW não inicia: confirmar DEV e string literal `true`;
- porta ocupada: identificar/liberar 5173, 5228 ou 5432, sem trocar porta da API
  sem também ajustar ambiente e CORS;
- daemon parado: abrir/iniciar Docker Desktop e aguardar `docker info`;
- banco não saudável: `docker logs shop-api-db`;
- migration/API falha: `docker logs shop-api-app`, conferir override
  `shopapi/shopapi` e repetir o one-shot;
- CORS: usar exatamente localhost/127.0.0.1:5173 permitido;
- Chromium ausente: `npx playwright install chromium`;
- dependências inconsistentes: repetir `npm ci`;
- banco reiniciado vazio: comportamento esperado do procedimento efêmero.

- [ ] **Step 3: Auto-revisar o README**

Executar:

```powershell
rg -n 'TBD|TODO|docker/docker|docker compose|Dockerfile|health endpoint|system prune|volume prune' frontend/README.md
npm pkg get scripts
```

Esperado: nenhuma pendência/placeholders, nenhuma credencial recomendada
`docker/docker`, nenhum artefato fora de escopo e todos os scripts presentes.
Ocorrências explicativas legítimas devem ser revisadas manualmente.

- [ ] **Step 4: Commitar o README**

```powershell
git add frontend/README.md
git commit -m "docs(TASK-129): Documentar execução do frontend"
```

### Task 4: Validar em worktree detached limpo

**Files:**
- Test: checkout temporário em `.worktrees/task-129-readme-validation`
- Evidence: `.superpowers/task-129-implementation-report.md`

**Interfaces:**
- Consumes: commit do README e seus blocos copiáveis.
- Produces: prova de instalação, gates e integração reais.

- [ ] **Step 1: Criar o worktree com caminho verificado**

Na raiz do worktree principal:

```powershell
$root = (git rev-parse --show-toplevel).Trim()
$validation = [IO.Path]::GetFullPath((Join-Path $root '.worktrees/task-129-readme-validation'))
$allowed = [IO.Path]::GetFullPath((Join-Path $root '.worktrees')) + [IO.Path]::DirectorySeparatorChar
if (-not $validation.StartsWith($allowed, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Caminho de validação fora de .worktrees: $validation"
}
git worktree add --detach $validation HEAD
git worktree list
git -C $validation status --short
```

Esperado: checkout detached no commit do README e status vazio.

- [ ] **Step 2: Executar instalação e gates exatamente como documentados**

```powershell
Set-Location "$validation/frontend"
npm ci
npx playwright install chromium
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
npm run verify:production-graph
npm run audit:private-data
```

Esperado: todos exit code zero. Registrar versões, contagens e duração no
relatório.

- [ ] **Step 3: Tentar iniciar o Docker Desktop quando o daemon estiver parado**

Primeiro:

```powershell
$dockerReady = $false
try { docker info | Out-Null; $dockerReady = $true } catch {}
if (-not $dockerReady) {
  $desktop = @(
    "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
    "$env:LOCALAPPDATA\Docker\Docker Desktop.exe"
  ) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
  if (-not $desktop) { throw 'Docker Desktop não encontrado.' }
  Start-Process -FilePath $desktop -WindowStyle Hidden
  $deadline = (Get-Date).AddMinutes(3)
  do {
    Start-Sleep -Seconds 5
    try { docker info | Out-Null; $dockerReady = $true } catch {}
  } until ($dockerReady -or (Get-Date) -ge $deadline)
}
if (-not $dockerReady) { throw 'Docker daemon indisponível; TASK-129 bloqueada.' }
```

Não instalar Docker, não encerrar processos e não alterar contextos Docker
globais.

- [ ] **Step 4: Copiar e executar o procedimento integrado**

Executar, a partir do checkout de validação, os blocos de rede, PostgreSQL,
migration, API e readiness documentados no README. Iniciar o Vite como processo
temporário:

```powershell
$env:VITE_API_BASE_URL='http://localhost:5228'
$env:VITE_ENABLE_MSW='false'
$frontend = Start-Process -FilePath npm.cmd `
  -ArgumentList 'run','dev','--','--host','127.0.0.1' `
  -WorkingDirectory "$validation/frontend" `
  -WindowStyle Hidden -PassThru
try {
  $deadline = (Get-Date).AddMinutes(2)
  do {
    Start-Sleep -Seconds 2
    try { $home = Invoke-WebRequest -UseBasicParsing http://127.0.0.1:5173 } catch { $home = $null }
  } until (($home.StatusCode -eq 200) -or (Get-Date) -ge $deadline)
  if ($home.StatusCode -ne 200) { throw 'Frontend não ficou pronto.' }
  $categories = Invoke-WebRequest -UseBasicParsing http://localhost:5228/api/v1/categoria
  if ($categories.StatusCode -lt 200 -or $categories.StatusCode -ge 300) {
    throw 'API integrada não respondeu com sucesso.'
  }
} finally {
  if ($frontend -and -not $frontend.HasExited) { Stop-Process -Id $frontend.Id }
}
```

Esperado: frontend HTTP 200 e endpoint real de categorias 2xx. A API integrada
deve estar com MSW desativado.

- [ ] **Step 5: Executar cleanup e remover o worktree com segurança**

```powershell
if (docker container inspect shop-api-app 2>$null) { docker rm -f shop-api-app }
if (docker container inspect shop-api-db 2>$null) { docker rm -f shop-api-db }
if (docker network inspect shop-api-network 2>$null) { docker network rm shop-api-network }

Set-Location $root
$resolvedValidation = [IO.Path]::GetFullPath($validation)
if (-not $resolvedValidation.StartsWith($allowed, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Recusa de remoção fora de .worktrees: $resolvedValidation"
}
git worktree list
git worktree remove $resolvedValidation
git worktree prune
```

Se qualquer gate ou integração falhar, preservar logs e não marcar a task como
concluída. Não usar `Remove-Item -Recurse` para o checkout.

- [ ] **Step 6: Registrar evidência**

Criar `.superpowers/task-129-implementation-report.md` com:

- commit validado e caminho temporário;
- Node/npm/.NET/Docker/PostgreSQL/Chromium;
- exit code, contagem e duração de cada gate;
- comandos integrados executados, status das migrations e readiness;
- confirmação de `shop-api-db`, `shop-api-app`, override `shopapi` e MSW off;
- cleanup e `git status --short`;
- bloqueio explícito se o daemon não pôde ser iniciado.

Commitar:

```powershell
git add .superpowers/task-129-implementation-report.md
git commit -m "docs(TASK-129): Registrar validação do README"
```

### Task 5: Revisar e finalizar o backlog

**Files:**
- Modify: `docs/frontend-tasks-v2.md`

**Interfaces:**
- Consumes: diff desde `754a453`, relatório e revisão independente.
- Produces: TASK-129 `DONE` somente após aprovação e validação real.

- [ ] **Step 1: Gerar o pacote para revisão**

```powershell
git diff --check 754a453..HEAD
git diff --stat 754a453..HEAD
git diff 754a453..HEAD -- frontend/README.md .superpowers/task-129-implementation-report.md
git status --short
```

O revisor deve confrontar cada comando com os arquivos versionados, procurar
remoções inseguras, credenciais divergentes, scripts omitidos e alegações não
validadas.

- [ ] **Step 2: Corrigir findings obrigatórios**

Findings `CRITICAL` ou `IMPORTANT` voltam ao implementador. Repetir todos os
gates afetados e a revisão. Daemon Docker indisponível ou integração não
executada é blocker, não finding adiável.

- [ ] **Step 3: Atualizar o backlog após aprovação**

Alterar TASK-129 para `DONE` e registrar:

- commits de plano, README, validação e correções;
- versões e gates;
- integração real com containers exatos;
- migrations, readiness e cleanup;
- revisão sem findings pendentes.

Commit:

```powershell
git add docs/frontend-tasks-v2.md
git commit -m "docs(TASK-129): Concluir README do frontend"
```

- [ ] **Step 4: Gate final da task**

```powershell
git diff --check 754a453..HEAD
git status --short
git log --oneline 754a453..HEAD
```

Esperado: diff-check sem saída, worktree limpo e commits da TASK-129
identificados. Somente então a TASK-130 pode receber `READY`.
