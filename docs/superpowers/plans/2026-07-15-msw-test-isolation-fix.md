# MSW Test Isolation Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar as seis rejeições não tratadas dos testes de aplicação e contagem confirmada do carrinho sem esconder requests inesperados.

**Architecture:** A correção permanece exclusivamente nos testes. `useConfirmedCartCount.test.tsx` desmontará observers entre cenários combinados e usará um `QueryClient` sem refetch automático de montagem; `App.test.tsx` criará um client sem retries por teste, encerrará seu lifecycle e registrará handlers MSW contratuais com método e URL exatos para cada rota que inicia requests.

**Tech Stack:** React 19, TypeScript 5.7, TanStack Query 5, Testing Library 16, MSW 2, Vitest 4 e Vite 6.

## Global Constraints

- Escopo exclusivo de testes frontend da TASK-133; nenhum arquivo de produção pode ser alterado.
- Corrigir três rejections de `useConfirmedCartCount.test.tsx` causadas por observers vivos e refetch no teste combinado.
- Corrigir três rejections de `App.test.tsx` causadas por handlers ausentes, `QueryClient` compartilhado e retries que sobrevivem aos testes.
- Manter `server.listen({ onUnhandledRequest: 'error' })` em `frontend/src/shared/testing/setup.ts` sem alterações.
- Proibir handlers wildcard como `http.get('*')` ou `http.all('*')`, bypass, passthrough, supressão de `console.error`/`stderr` e captura global que transforme rejeições em sucesso.
- Cada handler deve declarar método, URL completa e resposta compatível com o contrato do endpoint exercitado.
- Cada teste deve terminar sem observers, queries, retries, promises ou requests ativos.
- GREEN focado e global deve reportar zero `Error`, zero unhandled rejections e nenhuma saída inesperada em `stderr`.
- O gate global esperado é 747/747 testes passando com exit code 0, seguido de typecheck, lint e build com exit code 0.
- Não marcar TASK-133 como `DONE` com teste falhando ou finding `CRITICAL` ou `IMPORTANT` pendente.

---

## Estrutura de arquivos

- Modificar `frontend/src/features/cart/hooks/useConfirmedCartCount.test.tsx`: impedir refetch de montagem no client test-only e desmontar cada observer criado no cenário combinado.
- Modificar `frontend/src/App.test.tsx`: criar e limpar um `QueryClient` por teste e registrar handlers exatos para catálogo, perfil e pedidos nos cenários que disparam esses endpoints.
- Verificar sem modificar `frontend/src/shared/testing/setup.ts`: preservar `onUnhandledRequest: 'error'` e o reset global de handlers.
- Modificar `docs/frontend-tasks-v2.md` somente após gates e revisão: concluir TASK-133 com evidências reais.

### Task 1: Isolar observers, QueryClient e requests dos testes

**Files:**
- Modify: `frontend/src/features/cart/hooks/useConfirmedCartCount.test.tsx:1-63`
- Modify: `frontend/src/App.test.tsx:1-205`
- Verify only: `frontend/src/shared/testing/setup.ts:1-11`
- Modify after approval: `docs/frontend-tasks-v2.md:646-655`

**Interfaces:**
- Consumes: `renderHook(...).unmount(): void`, `QueryClient.cancelQueries(): Promise<void>`, `QueryClient.clear(): void`, `server.use(...handlers)` e `http.get(exactUrl, resolver)`.
- Produces: testes com clients e observers confinados ao próprio ciclo e handlers MSW explícitos para `GET /api/v1/categoria`, `GET /api/v1/produto`, `GET /api/v1/cliente/20` e `GET /api/v1/pedido`.

- [ ] **Step 1: Reproduzir separadamente os três erros do hook**

Run:

```bash
cd frontend
npm test -- src/features/cart/hooks/useConfirmedCartCount.test.tsx
```

Expected RED: as asserções podem passar, mas Vitest encerra com exit code 1 e reporta três unhandled rejections associadas ao teste `retorna zero para visitante, cliente sem vínculo e consulta com erro`; observers das duas primeiras chamadas de `setup()` permanecem vivos quando sessão e vínculo mudam, e a terceira montagem tenta refetch.

- [ ] **Step 2: Reproduzir separadamente os três erros de App**

Run:

```bash
cd frontend
npm test -- src/App.test.tsx
```

Expected RED: as asserções podem passar, mas Vitest encerra com exit code 1 e reporta três unhandled rejections ou requests MSW sem handler; o client compartilhado conserva trabalho entre testes e aplica retries enquanto as rotas iniciam requests sem respostas intencionais.

- [ ] **Step 3: Reproduzir os seis erros no mesmo processo**

Run:

```bash
cd frontend
npm test -- src/features/cart/hooks/useConfirmedCartCount.test.tsx src/App.test.tsx
```

Expected RED: exit code 1 com seis erros não tratados no resumo do Vitest. Guardar as URLs exatas impressas pelo MSW para conferir que cada uma corresponde aos handlers contratuais descritos nos Steps 6 e 7.

- [ ] **Step 4: Tornar o QueryClient do hook estritamente test-only**

Em `frontend/src/features/cart/hooks/useConfirmedCartCount.test.tsx`, substituir `createClient` por:

```tsx
function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        refetchOnMount: false,
      },
    },
  })
}
```

`refetchOnMount: false` é deliberadamente local ao teste: estes cenários validam projeções do cache confirmado e não o transporte de `useCartQuery`. Não alterar `useConfirmedCartCount.ts`, `useCartQuery.ts` ou defaults de produção.

- [ ] **Step 5: Desmontar cada observer no teste combinado do hook**

Substituir o corpo de `retorna zero para visitante, cliente sem vínculo e consulta com erro` por:

```tsx
it('retorna zero para visitante, cliente sem vínculo e consulta com erro', () => {
  const visitor = setup()
  expect(visitor.result.current).toBe(0)
  visitor.unmount()
  visitor.client.clear()

  useAuthStore.setState({ session })
  const withoutCart = setup()
  expect(withoutCart.result.current).toBe(0)
  withoutCart.unmount()
  withoutCart.client.clear()

  useCartSessionStore.setState({ cartIdsByCustomer: { '10': 100 } })
  const client = createClient()
  client.setQueryData(
    cartQueryKeys.detail(10, 100),
    cart([{ id: 1, quantity: 2 }]),
  )
  client.getQueryCache().find({
    queryKey: cartQueryKeys.detail(10, 100),
  })?.setState({
    status: 'error',
    error: new Error('falha'),
    data: undefined,
  })
  const failed = setup(client)
  expect(failed.result.current).toBe(0)
  failed.unmount()
  client.clear()
})
```

A desmontagem ocorre antes de cada mudança global de sessão ou vínculo. Como não existe request ativo com `refetchOnMount: false`, `clear()` encerra o cache sem esconder falhas de rede.

- [ ] **Step 6: Criar um QueryClient novo e sem retries por teste de App**

Em `frontend/src/App.test.tsx`, substituir `const queryClient = new QueryClient()` por uma declaração mutável no escopo do `describe`:

```tsx
let queryClient: QueryClient
```

No início do `beforeEach`, criar o client test-only:

```tsx
queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})
```

Substituir o `afterEach` atual por lifecycle assíncrono completo:

```tsx
afterEach(async () => {
  await queryClient.cancelQueries()
  queryClient.clear()
  vi.unstubAllEnvs()
})
```

Manter `renderApp` recebendo o `queryClient` corrente pelo `QueryClientProvider`. Não criar ou exportar helper de produção.

- [ ] **Step 7: Adicionar factories de handlers contratuais com URLs exatas**

Em `frontend/src/App.test.tsx`, depois do mock de `fetchProductDetail`, adicionar:

```tsx
const apiBaseUrl = 'https://api.example.com/api/v1'

function emptyCatalogHandlers() {
  return [
    http.get(`${apiBaseUrl}/categoria`, () => HttpResponse.json({
      status: true,
      data: [],
    })),
    http.get(`${apiBaseUrl}/produto`, ({ request }) => {
      const url = new URL(request.url)
      expect(url.searchParams.get('page')).toBe('1')
      expect(url.searchParams.get('size')).toBe('20')

      return HttpResponse.json({
        status: true,
        pagination: { pages: 0, size: 20, totalItems: 0, data: [] },
      })
    }),
  ]
}

function customerProfileHandler() {
  return http.get(`${apiBaseUrl}/cliente/20`, ({ request }) => {
    expect(request.headers.get('Authorization')).toBe(
      'Bearer header.payload.signature',
    )

    return HttpResponse.json({
      status: true,
      data: {
        clienteId: 20,
        cpf: '12345678901',
        nome: 'Cliente',
        dataNascimento: '1990-01-01',
        email: 'cliente@exemplo.com',
        endereco: {
          logradouro: 'Rua A', numero: '10', complemento: null,
          cep: '12345678', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP',
        },
        celular: { ddd: '11', numero: '999999999', whatsApp: true },
      },
    })
  })
}

function emptyOrdersHandler() {
  return http.get(`${apiBaseUrl}/pedido`, ({ request }) => {
    const url = new URL(request.url)
    expect(url.searchParams.get('cpf')).toBe('12345678901')
    expect(url.searchParams.get('page')).toBe('1')
    expect(url.searchParams.get('size')).toBe('20')

    return HttpResponse.json({
      status: true,
      pagination: { pages: 0, size: 20, totalItems: 0, data: [] },
    })
  })
}
```

Essas factories retornam handlers somente para requests que o cenário declara. Não movê-las para `shared/testing/handlers.ts`, pois isso faria requests acidentais parecerem atendidos em toda a suíte.
O tamanho 20 corresponde ao contrato observado em `HomePage.tsx` e à request atual da rota raiz.

- [ ] **Step 8: Associar handlers apenas aos cenários que iniciam cada request**

Separar o `it.each` de rotas da loja em três testes para que cada cenário declare suas dependências:

```tsx
it('renders the home store route', async () => {
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
  server.use(...emptyCatalogHandlers())

  const { container } = renderApp('/')

  expect(await screen.findByRole('heading', {
    level: 1,
    name: 'Encontre produtos para o seu dia a dia',
  })).toBeInTheDocument()
  expect(container.querySelector('[data-shell="store"]')).toBeInTheDocument()
})

it('renders the order confirmation store route', async () => {
  const { container } = renderApp('/pedido-confirmado/7')

  expect(await screen.findByRole('heading', {
    level: 1,
    name: 'Confirmação do pedido',
  })).toBeInTheDocument()
  expect(container.querySelector('[data-shell="store"]')).toBeInTheDocument()
})

it('renders the orders store route', async () => {
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')
  server.use(customerProfileHandler(), emptyOrdersHandler())

  const { container } = renderApp('/pedidos')

  expect(await screen.findByRole('heading', {
    level: 1,
    name: 'Meus pedidos',
  })).toBeInTheDocument()
  expect(container.querySelector('[data-shell="store"]')).toBeInTheDocument()
})
```

Nos dois casos do `it.each` de rotas da conta, chamar `vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')` e `server.use(customerProfileHandler())` antes de `renderApp(route)`, pois ambas carregam o perfil real. Manter o handler específico já existente do checkout no próprio teste; ele possui a mesma URL e asserção de autorização e não deve ser substituído por wildcard.

- [ ] **Step 9: Confirmar GREEN isolado e conjunto sem ruído**

Run:

```bash
cd frontend
npm test -- src/features/cart/hooks/useConfirmedCartCount.test.tsx
npm test -- src/App.test.tsx
npm test -- src/features/cart/hooks/useConfirmedCartCount.test.tsx src/App.test.tsx
```

Expected: os três comandos encerram com exit code 0; todos os testes passam, e o resumo do Vitest contém zero `Errors`, zero unhandled rejections, zero warning de request sem handler e nenhuma saída inesperada em `stderr`.

- [ ] **Step 10: Provar que a política estrita do MSW permaneceu ativa**

Run:

```bash
git diff -- frontend/src/shared/testing/setup.ts frontend/src/shared/testing/handlers.ts
rg -n "onUnhandledRequest: 'error'|http\.(all|get|post|put|patch|delete)\('\*'|bypass|passthrough|console\.error" frontend/src/shared/testing frontend/src/App.test.tsx frontend/src/features/cart/hooks/useConfirmedCartCount.test.tsx
```

Expected: o diff dos arquivos compartilhados está vazio; `setup.ts` continua exibindo `onUnhandledRequest: 'error'`; não existe handler wildcard, bypass, passthrough ou mock/supressão de `console.error` nos arquivos alterados.

- [ ] **Step 11: Executar gates globais**

Run:

```bash
cd frontend
npm test
npm run typecheck
npm run lint
npm run build
```

Expected: Vitest encerra com exit code 0 e `747 passed (747)` sem seção `Errors` e sem `stderr` inesperado; typecheck, lint e build encerram com exit code 0.

- [ ] **Step 12: Revisar o diff e criar o commit atômico**

Run:

```bash
git diff --check
git diff -- frontend/src/App.test.tsx frontend/src/features/cart/hooks/useConfirmedCartCount.test.tsx
```

Expected: `git diff --check` sem saída e diff limitado aos dois testes, com lifecycle explícito e handlers exatos; nenhum arquivo sob código de produção foi alterado.

Commit:

```bash
git add frontend/src/App.test.tsx frontend/src/features/cart/hooks/useConfirmedCartCount.test.tsx
git commit -m "fix(TASK-133): Isolar testes com QueryClient e MSW"
```

Expected: commit contendo somente os dois arquivos de teste.

- [ ] **Step 13: Submeter à revisão obrigatória**

Run:

```bash
git show --stat --oneline HEAD
git show --format= HEAD -- frontend/src/App.test.tsx frontend/src/features/cart/hooks/useConfirmedCartCount.test.tsx
```

Expected: o revisor confirma zero mudança de produção, clients encerrados, handlers contratuais por cenário e manutenção de `onUnhandledRequest: 'error'`. Findings `CRITICAL` ou `IMPORTANT` retornam ao implementador; após correção, repetir Steps 9–11 e solicitar nova revisão.

- [ ] **Step 14: Fechar a TASK-133 no backlog somente após aprovação**

Em `docs/frontend-tasks-v2.md`, alterar `[ ] TASK-133` para `[x] TASK-133` e `Status: READY` para `Status: DONE`. Acrescentar uma linha `Evidência` com o SHA curto de `git log -1 --format=%h`, os três resultados RED isolado/conjunto, as contagens GREEN focadas, o resultado global exato `747/747`, os gates typecheck/lint/build/diff-check e a aprovação final do revisor. Usar somente valores observados nos Steps 1–3 e 9–13.

Validar e commitar somente o backlog:

```bash
git diff --check
git diff -- docs/frontend-tasks-v2.md
git add docs/frontend-tasks-v2.md
git commit -m "fix(TASK-133): Concluir isolamento dos testes"
```

Expected: commit contendo somente o status `DONE` e as evidências reais da TASK-133; nenhuma outra task muda de status.

- [ ] **Step 15: Confirmar estado final rastreável**

Run:

```bash
git status --short
git log --oneline -3
```

Expected: worktree sem mudanças pendentes da TASK-133 e log contendo o commit dos testes seguido pelo commit de fechamento do backlog.
