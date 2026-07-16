# TASK-129 — Exploração do README do frontend

## Base e escopo

- `BASE_COMMIT`: `754a4530f20c9ac6d68ec1a6318559b26dbbbaf0`
- Status da task: `READY`; todas as dependências listadas estão `DONE`.
- Escopo autorizado: criar `frontend/README.md` e registrar evidência documental.
- Esta exploração e o plano não implementam o README.
- Não há `Dockerfile`, Compose ou script de bootstrap integrado no repositório.
  A TASK-129 não deve inventar esses artefatos: a execução integrada deve usar
  imagens oficiais e comandos `docker run`.

## Requisitos e versões observados

| Ferramenta | Piso factual | Ambiente explorado |
| --- | --- | --- |
| Node.js | 20.19.0 ou superior, piso comum das dependências atuais (ESLint 10 é a restrição mais alta) | 26.3.1 |
| npm | acompanha o Node suportado; usar `npm ci` com o lockfile | 11.16.0 |
| .NET SDK | 10.0, conforme `TargetFramework net10.0` | 10.0.302 |
| Docker Desktop/Engine | daemon Linux capaz de executar PostgreSQL 17 e SDK .NET 10 | cliente 29.6.1; daemon parado |
| Chromium do Playwright | instalado por `npx playwright install chromium` | dependência `@playwright/test` 1.61.1 |

O `package-lock.json` é a fonte das versões JavaScript exatas. O README não
deve prometer suporte a Node inferior a 20.19.0 nem fixar uma versão de npm que
o projeto não declara em `engines`.

## Configuração do frontend

- `VITE_API_BASE_URL` é obrigatória e validada como URL HTTP(S).
- Desenvolvimento integrado usa `http://localhost:5228`.
- `VITE_ENABLE_MSW=true` só ativa o browser worker quando `import.meta.env.DEV`
  também é verdadeiro. O default é desativado; produção nunca habilita o MSW.
- O comando PowerShell pode definir variáveis apenas para o processo:

```powershell
$env:VITE_API_BASE_URL='http://localhost:5228'
$env:VITE_ENABLE_MSW='false'
npm run dev
```

- A forma cross-platform deve usar arquivos locais não versionados:
  `frontend/.env.local` com as mesmas duas chaves. Não é necessário adicionar
  biblioteca ou script.

## Scripts existentes

Todos os scripts de `frontend/package.json` precisam aparecer no README:

| Script | Responsabilidade |
| --- | --- |
| `npm run dev` | servidor Vite de desenvolvimento |
| `npm run build` | build de produção |
| `npm run verify:production-graph` | valida chunks iniciais e rotas lazy |
| `npm run audit:performance` | build seguido da auditoria do grafo |
| `npm run audit:private-data` | auditoria e self-test da política da TASK-126 |
| `npm run typecheck` | TypeScript project references |
| `npm run lint` | ESLint |
| `npm test` | Vitest em modo run |
| `npm run test:watch` | Vitest interativo |
| `npm run test:e2e` | Playwright Chromium com servidor próprio |
| `npm run dev:e2e` | servidor determinístico usado pelo Playwright |
| `npm run preview` | preview do build |

`npm run test:e2e` usa `VITE_API_BASE_URL=http://localhost:5228`, mas as
jornadas interceptam a API com fixtures próprias. Ele não é o smoke integrado
contra PostgreSQL/API reais.

## Topologia integrada factual

O procedimento deve criar a rede `shop-api-network` e exatamente estes
containers:

- `shop-api-db`: `postgres:17`, porta host `5432`, usuário, senha e banco
  `shopapi`, healthcheck via `pg_isready`;
- `shop-api-app`: `mcr.microsoft.com/dotnet/sdk:10.0`, porta host `5228`,
  checkout montado em `/workspace`, workdir `/workspace/aspnet-api`,
  `ASPNETCORE_URLS=http://+:8080` e
  `ConnectionStrings__ShopDb=Host=shop-api-db;Port=5432;Database=shopapi;Username=shopapi;Password=shopapi`.

A configuração versionada usa credenciais `docker/docker`, portanto o override
é obrigatório para honrar o contrato local `shopapi/shopapi`.

As migrations EF Core existem em
`aspnet-api/src/Infrastructure/Persistence/Migrations`. A aplicação não chama
`Database.Migrate()` no startup. Antes de iniciar `shop-api-app`, um container
one-shot do SDK, na mesma rede e com o mesmo mount/override, deve instalar
`dotnet-ef` 10 no próprio container e executar:

```sh
dotnet tool install --global dotnet-ef --version 10.* &&
export PATH="$PATH:/root/.dotnet/tools" &&
dotnet ef database update
```

Depois o container `shop-api-app` executa
`dotnet run --no-launch-profile --urls http://+:8080`. O readiness não deve
depender de um endpoint de health inexistente: consultar uma rota pública real,
`GET http://localhost:5228/api/v1/categoria`, aceitando resposta HTTP 2xx.

O frontend permanece no host, em `frontend`, com `npm run dev -- --host
127.0.0.1`; a política CORS já permite `http://localhost:5173` e
`http://127.0.0.1:5173`.

## Cleanup seguro

O README deve remover apenas recursos nomeados por este procedimento:

```powershell
docker rm -f shop-api-app shop-api-db
docker network rm shop-api-network
```

Cada remoção deve ser condicional ou tolerar “não encontrado”, sem usar prune,
sem apagar volumes alheios e sem montar volume persistente por padrão. O banco
é efêmero; isso precisa ser explícito.

## Política local da TASK-126

O README deve reproduzir, sem ampliar, o inventário aprovado:

- `shop-api:auth`: exatamente um entre `sessionStorage` e `localStorage`;
  sessão (`token`, `tipo`, `expiraEm`, `usuarioId`, `clienteId`, `email`) e
  modalidade;
- `shop-api:cart-session`: `localStorage`, somente `cartIdsByCustomer`;
- CPF, endereço, perfil, itens, pedidos, respostas HTTP e caches React Query
  não são persistidos;
- logout, `401` e cancelamento limpam estado privado; respostas tardias não
  podem restaurá-lo;
- `npm run audit:private-data` reproduz a auditoria e rejeita logs sensíveis.

## Validação exigida

Após o commit do README, o implementador deve criar um worktree destacado
temporário dentro de `.worktrees`, apontado ao commit sob revisão. Nesse
checkout:

1. executar `npm ci`;
2. instalar Chromium com `npx playwright install chromium`;
3. copiar e executar, na ordem documentada:
   `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e`,
   `npm run build`, `npm run verify:production-graph`,
   `npm run audit:private-data`;
4. executar a topologia Docker, migrations e readiness da API;
5. iniciar o frontend host com MSW ausente/desativado e executar um smoke
   Chromium sem fixtures: abrir a Home, observar o `GET /api/v1/categoria`
   respondido pela API real e rejeitar CORS, console ou page errors;
6. executar o cleanup nomeado;
7. remover o worktree temporário somente depois de confirmar o caminho absoluto
   sob `.worktrees` e `git worktree list`.

O daemon está parado na exploração. Todo `docker info` deve verificar
`$LASTEXITCODE`, pois comandos nativos não lançam exceção PowerShell por
default. A implementação deve tentar, no Windows, iniciar com segurança o
Docker Desktop existente via `Start-Process` com janela oculta, registrar o
processo/status e aguardar até um deadline explícito. Se o executável não
existir, o processo sair, ou o daemon não ficar saudável, a validação integrada
permanece pendente e a TASK-129 não pode receber `DONE`.

Readiness do banco e API deve ter deadline e detectar container `exited` antes
do prazo, emitindo `docker logs` no erro. Todo o lote integrado deve estar sob
`try/finally`, com cleanup condicional apenas de `shop-api-app`,
`shop-api-db` e `shop-api-network`.

O worktree de validação não pode ser aninhado no worktree corrente. O diretório
administrativo deve ser derivado de `git worktree list --porcelain` e
`git rev-parse --git-common-dir`; o checkout temporário será irmão dos demais
worktrees no diretório administrativo compartilhado.

## Troubleshooting obrigatório

O README deve cobrir pelo menos:

- variável obrigatória ausente ou URL inválida;
- porta 5173, 5228 ou 5432 ocupada;
- Docker daemon parado;
- `shop-api-db` não saudável;
- falha de migration ou credenciais divergentes;
- CORS por host/porta diferentes;
- Chromium ausente para Playwright;
- MSW aparentemente inativo por estar fora de DEV ou com valor diferente de
  `true`;
- limpeza de `node_modules` não substitui `npm ci`;
- dados do banco são efêmeros no procedimento documentado.

## Fora de escopo

- criar Dockerfile, Compose, volume persistente ou endpoint de health;
- alterar scripts, dependências, CORS, migrations ou código de produto;
- documentar credenciais `docker/docker` como fluxo recomendado;
- marcar a task como concluída sem validação integrada real.
