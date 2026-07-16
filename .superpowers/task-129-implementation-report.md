# TASK-129 — Relatório de implementação

## Escopo e checkout validado

- Base: `754a4530f20c9ac6d68ec1a6318559b26dbbbaf0`.
- README inicial: `3f031c7db222a970138f7e381c45641c7cfc45e0`.
- Correção validada: `50caf9013c83c3dfa6322447f2ac080492d36ab4`.
- Checkout detached:
  `E:\CodeRepo\shop-api\.worktrees\task-129-readme-validation`.
- O checkout foi criado no commit exato, removido e recriado após a correção,
  depois removido com `git worktree remove --force` porque o postinstall do MSW
  normalizou `frontend/public/mockServiceWorker.js`.

## Versões

| Componente | Versão |
| --- | --- |
| Node.js | 26.3.1 |
| npm | 11.16.0 |
| Playwright | 1.61.1 |
| Chromium | 149.0.7827.55 |
| Docker client/server | 29.6.1 / 29.6.1 |
| .NET SDK do container | 10.0.302 |
| PostgreSQL | 17.10 |
| dotnet-ef instalado no one-shot | 10.0.10 |

O Docker Desktop estava parado. Foi iniciado com janela oculta, PID 24028, e o
daemon respondeu antes do prazo de três minutos.

## Gates no checkout limpo

Após a correção, `npm ci` partiu sem `node_modules` e instalou 315 pacotes, sem
vulnerabilidades. O Chromium já estava disponível após
`npx playwright install chromium`.

| Gate | Resultado | Duração |
| --- | --- | ---: |
| `npm ci` | exit 0, 315 pacotes, 0 vulnerabilidades | 7,45 s |
| `npx playwright install chromium` | exit 0 | 2,09 s |
| `npm run typecheck` | exit 0 | 7,32 s |
| `npm run lint` | exit 0 | 9,48 s |
| `npm test` | exit 0, 130 arquivos e 863 testes | 56,03 s |
| `npm run test:e2e` | exit 0, 20/20 Chromium | 25,25 s |
| `npm run build` | exit 0 | 4,42 s |
| `npm run verify:production-graph` | exit 0, inicial 465833 bytes e 6 rotas lazy | 0,55 s |
| `npm run audit:private-data` | exit 0, 153 arquivos e 19 testes negativos | 1,50 s |

O diretório `.task-129-smoke` não existia durante esses gates.

## Descoberta e correção do procedimento

A primeira execução real reproduziu um problema do comando planejado:
PostgreSQL ficou saudável, mas `dotnet ef database update` encerrou com
`NETSDK1004` porque um checkout limpo não contém
`aspnet-api/obj/project.assets.json`.

A causa era a ausência de restore no container one-shot. O README foi corrigido
para executar `dotnet restore` antes de instalar/invocar `dotnet-ef`. O
checkout detached foi então recriado no commit corrigido e todos os gates acima
foram repetidos.

## Integração real

- Rede criada: `shop-api-network`.
- Banco: `shop-api-db`, imagem `postgres:17`, usuário/senha/database `shopapi`,
  estado `healthy`.
- Migration one-shot: exit 0 em 56,79 s; restore, build e todas as migrations
  concluídos usando
  `ConnectionStrings__ShopDb=Host=shop-api-db;Port=5432;Database=shopapi;Username=shopapi;Password=shopapi`.
- API: `shop-api-app`, imagem `mcr.microsoft.com/dotnet/sdk:10.0`, readiness
  público `GET /api/v1/categoria` com status 200.
- Frontend: Vite em `127.0.0.1:5173`, API base
  `http://localhost:5228`, `VITE_ENABLE_MSW=false`.
- Smoke sem fixtures/interceptação: 1/1 Chromium em 6,13 s; resposta real de
  categorias 2xx, `fromServiceWorker() === false`, heading visível e zero erros
  de console ou página.
- Integração total: 103,73 s.

## Cleanup

O `finally` removeu `shop-api-app`, `shop-api-db`, `shop-api-network` e o
diretório `.task-129-smoke`. As inspeções posteriores confirmaram:

- nenhum dos dois containers existe;
- a rede não existe;
- a porta 5173 não possui listener;
- o diretório temporário de smoke não existe;
- o worktree detached foi removido e `git worktree prune` executado.

O checkout da feature não recebeu artefatos da validação. O backlog não foi
alterado; a TASK-129 aguarda revisão independente antes de receber `DONE`.

## Ajustes após revisão

O bloco do segundo terminal passou a declarar `$repo` a partir da raiz aberta
nesse próprio terminal, sem depender da variável criada no primeiro. O
troubleshooting também separa os estágios: falhas da migration são
diagnosticadas pela saída e pelo exit code do `docker run --rm` one-shot;
`docker logs shop-api-app` é indicado somente depois que o container da API
existe.
