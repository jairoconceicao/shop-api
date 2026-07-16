# Exploração da TASK-117 — E2E de autenticação

## Contexto e prontidão

- `BASE_COMMIT` efetivo da implementação: `be8ef3ec1855d3b1aa38a58ff97eb70643039fa9`.
- Branch/worktree: `codex/phase-8-hardening` em `.worktrees/phase-8-hardening`.
- Backlog: `TASK-117` está `READY`; `TASK-010` e `TASK-111` a `TASK-116` estão registradas como `DONE`.
- Escopo aprovado: os sete arquivos de configuração e E2E enumerados no plano; produto, backend e backlog ficam fora do escopo até aprovação.
- Plano lido integralmente: `docs/superpowers/plans/2026-07-16-task-117-auth-e2e.md`.

## Estado atual reproduzido

Comando:

```text
npm --prefix frontend run test:e2e -- smoke.spec.ts --project=chromium
```

Resultado no `BASE_COMMIT`: `1 passed` em 4,8 s.

O Chromium do Playwright está instalado em:

```text
C:\Users\jairo\AppData\Local\ms-playwright\chromium_headless_shell-1228
C:\Users\jairo\AppData\Local\ms-playwright\chromium-1228
```

O smoke atual usa a home, importa diretamente `@playwright/test` e não possui isolamento nem controle de rede. `playwright-report/` e `test-results/` já estão ignorados pelo Git.

## Contratos, rotas e seletores verificados

O plano está alinhado com a aplicação nestes pontos:

- Origem configurada no checkout principal: `VITE_API_BASE_URL=http://localhost:5228`.
- Endpoints reais:
  - `POST /api/v1/cliente`;
  - `POST /api/v1/auth/login`;
  - `GET /api/v1/categoria`;
  - `GET /api/v1/cliente/:clienteId`;
  - `POST /api/v1/auth/logout`.
- Envelopes e campos propostos para cadastro, login, categorias e perfil são aceitos pelos adapters Zod existentes.
- O login com `Manter conectado` grava `shop-api:auth` em `localStorage` e remove a cópia de `sessionStorage`.
- `ProtectedRoute` preserva `/minha-conta/dados` como `returnTo`; após autenticar, a página deve navegar para essa rota.
- `StoreLayout` carrega categorias; `CustomerDataPage` carrega o perfil. A entrada autenticada e o refresh justificam, em princípio, duas chamadas de categoria e duas de perfil.
- Cópias/seletores semânticos existem:
  - headings `Cadastro de cliente`, `Entrar na sua conta` e `Meus dados`;
  - labels `Nome completo`, `CPF`, `Data de nascimento`, `E-mail`, `Senha`, `CEP`, `Logradouro`, `Número`, `Bairro`, `Cidade`, `UF`, `Celular`;
  - checkboxes `Este celular também é WhatsApp` e `Manter conectado`;
  - botão `Área do cliente`, menuitem `Sair`, botão `Criar conta` e botão `Entrar`;
  - status `Cadastro concluído` com a mensagem planejada.

## REDs e divergências do plano

### CRITICAL — o `addInitScript` planejado apaga a sessão no refresh

O plano instala:

```ts
await context.addInitScript(() => {
  window.localStorage.clear()
  window.sessionStorage.clear()
})
```

Scripts adicionados ao contexto são executados antes de cada novo documento, não apenas antes da primeira navegação do teste. Logo, `page.reload()` executará novamente essa limpeza, apagará `shop-api:auth` e invalidará exatamente a persistência local que a jornada deve provar. O fluxo esperado de segunda chamada a categorias/perfil também não ocorrerá: a aplicação tende a voltar para `/entrar`.

Correção requerida no plano/implementação: limpar storage uma única vez antes da jornada, por exemplo navegando primeiro para a origem e executando `page.evaluate`, ou usando uma fixture de `page`/contexto que faça limpeza inicial sem registrar um init script permanente. Se for necessário limpar antes do primeiro carregamento da SPA, o script deve possuir uma guarda que o torne estritamente one-shot e preserve a sessão criada durante o teste nos documentos seguintes.

### IMPORTANT — `.env` não é versionado no worktree

`frontend/.env` é ignorado e não existe neste worktree. A aplicação exige `VITE_API_BASE_URL` válido em runtime. O checkout principal possui o valor correto, mas isso não acompanha worktrees, clones limpos nem CI.

O smoke passou apesar disso, porém esse resultado não prova que o servidor nasceu deste worktree: `reuseExistingServer: true` permite reutilizar qualquer processo já atendendo `127.0.0.1:4173`. Durante a inspeção posterior não havia processo Vite persistente visível, mas a configuração continua permitindo falso positivo por servidor de outro checkout.

Pré-requisito recomendado: fornecer `VITE_API_BASE_URL=http://localhost:5228` explicitamente ao comando `webServer`/ambiente Playwright ou criar um arquivo versionável apropriado para E2E. Em verificação determinística, usar `CI=1` ou outra configuração que desabilite `reuseExistingServer`, garantindo que a SPA servida pertença ao HEAD em revisão.

### IMPORTANT — a API pública da fixture não corresponde literalmente ao critério de `beforeEach`

O backlog exige contadores reiniciados no `beforeEach` e limpeza no `afterEach`. A fixture automática proposta oferece semântica equivalente por teste (`reset` antes de `use`, assertions/cleanup em `finally`), o que é tecnicamente melhor integrado ao Playwright, mas não implementa hooks nomeados. O implementador/revisor deve registrar que a equivalência é intencional ou ajustar o plano se o critério for literal.

### MINOR — validação de método do cadastro é implícita

Cadastro só entra no handler quando path e método já são `POST`; um método diferente cai como request inesperado. Isso rejeita corretamente, mas diverge do checklist que diz que cadastro “valida método” da mesma forma explícita que login/perfil/logout. Usar `requireMethod` após selecionar o path melhora a mensagem diagnóstica e deixa o checklist literal.

### MINOR — o teardown pode mascarar a falha original

`authApi.assertRequestCounts()` roda no `finally`. Se o corpo falhar antes de completar a jornada, a divergência de contagens pode ser anexada ou competir com a falha original. Isso é aceitável para provar contagens “inclusive após falha”, mas o revisor deve confirmar que o relatório preserva evidência suficiente da primeira causa.

## Pré-requisitos ambientais

- Node/npm e dependências de `frontend/node_modules` disponíveis.
- Chromium Playwright v1228 instalado — confirmado.
- Porta `127.0.0.1:4173` livre ou servidor existente deliberadamente desabilitado para a regressão final.
- `VITE_API_BASE_URL=http://localhost:5228` injetado no Vite iniciado pelo Playwright.
- Nenhuma API, PostgreSQL ou Docker é necessária; todos os requests sob `http://localhost:5228/api/v1/**` devem ser interceptados.

## Orientação ao implementador

1. Preserve endpoints, corpos, seletores e contagens propostos: estão compatíveis com o produto no `BASE_COMMIT`.
2. Não copie literalmente o `addInitScript` de limpeza sem torná-lo one-shot; esse é o principal RED conhecido.
3. Torne o ambiente Vite autocontido na configuração/comando E2E e prove que não reutilizou servidor de outro checkout.
4. Execute a spec isolada, duas repetições, toda a suíte Chromium, typecheck e lint.
5. Não altere arquivos de produto para acomodar o teste; nenhuma lacuna de produto foi encontrada nesta exploração.

## Resolução na implementação

- `storageState` vazio substituiu qualquer limpeza persistente via
  `addInitScript`, permitindo que a sessão sobreviva a `page.reload()`.
- `cross-env` injeta a origem da API e `NODE_ENV=production` no servidor E2E;
  `reuseExistingServer: false` e `--strictPort` impedem falso positivo com
  processo de outro checkout.
- Cada handler incrementa sua contagem diretamente. O modo production foi
  necessário porque o double-effect do React StrictMode em desenvolvimento
  abortava o primeiro fetch do perfil antes ou depois de ele alcançar a rota,
  variando a contagem bruta entre 3 e 4.
