# TASK-126 Private Data Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provar e reforçar que somente a sessão contratada e IDs de carrinho são persistidos, e que logout, `401` e cancelamento removem todo estado privado sem restauração por respostas tardias ou logs sensíveis.

**Architecture:** Manter `clearPrivateSession(queryClient, customerId)` como única fronteira idempotente de limpeza. Cada fluxo captura a identidade antes de limpar e delega à fronteira; callbacks assíncronos só podem persistir se a identidade completa que iniciou a operação (`clienteId + token`) ainda for a sessão ativa. Uma auditoria estática reproduzível valida chaves/payloads e mensagens de produção.

**Tech Stack:** React 19, TypeScript, Zustand persist, TanStack React Query, Vitest, Testing Library, Node.js.

## Global Constraints

- Base obrigatória: `05c79cd039c918ce70b831ad17e0d9e0025bae4f`.
- TDD estrito: escrever cada teste, observar o RED pela lacuna esperada, implementar o mínimo, observar GREEN.
- As únicas chaves persistidas da aplicação são `shop-api:auth` e `shop-api:cart-session`.
- Auth pode existir em exatamente um storage por vez; toda limpeza remove cópias de ambos.
- Carrinho persiste somente `cartIdsByCustomer`; CPF, endereço, perfil, itens, pedidos e respostas nunca entram em Web Storage.
- `tipo` permanece no contrato/runtime e na sessão persistida versionada; sua remoção exige decisão e migração fora desta task.
- Guard de resposta tardia usa obrigatoriamente `clienteId + token`; abort é opcional e nunca substitui o guard.
- Queries e mutations públicas devem sobreviver a toda limpeza.
- Não ampliar o escopo para backend, criptografia de storage ou refatoração geral.

---

## File map

- Modify `frontend/src/features/auth/mutations/useLogoutMutation.ts`: capturar cliente e reutilizar limpeza central.
- Modify `frontend/src/features/auth/context/UnauthorizedHandlerProvider.tsx`: capturar cliente antes do `401` e reutilizar limpeza central.
- Modify `frontend/src/features/customer/mutations/useDeleteCustomerMutation.ts`: manter guard concorrente existente e delegar limpeza.
- Modify `frontend/src/features/cart/mutations/useCreateCartMutation.ts`: impedir persistência/reconciliação de resposta obsoleta.
- Modify corresponding `*.test.tsx`: RED/GREEN das fronteiras e concorrência.
- Modify `frontend/src/features/auth/session/clearPrivateSession.test.ts`: matriz de storage/cache/snapshot e preservação pública.
- Modify store tests: snapshots literais dos dois payloads persistidos.
- Modify `frontend/src/bootstrap.tsx` and test: fallback sem causa sensível.
- Create `frontend/scripts/audit-private-data.mjs`: auditoria estática determinística.
- Modify `frontend/package.json`: script `audit:private-data`.
- Create `docs/frontend-quality/task-126-private-data-audit.md`: inventário e evidência reproduzível.

### Task 1: Fixar o contrato persistido com snapshots

**Files:**
- Modify: `frontend/src/features/auth/store/authStore.test.ts`
- Modify: `frontend/src/features/cart/store/cartSessionStore.test.ts`
- Modify: `frontend/src/features/auth/session/clearPrivateSession.test.ts`

**Interfaces:**
- Consumes: `AUTH_STORE_KEY`, `CART_SESSION_STORE_KEY`, Zustand persist v1.
- Produces: prova literal das únicas chaves/payloads e da limpeza privada seletiva.

- [ ] **Step 1: Escrever snapshots literais dos payloads**

No teste do auth, persistir a sessão em cada modalidade e comparar o JSON:

```ts
expect(JSON.parse(sessionStorage.getItem(AUTH_STORE_KEY)!)).toEqual({
  state: {
    session: {
      token: 'access-token',
      tipo: 'Bearer',
      expiraEm: '2099-01-01T00:00:00Z',
      usuarioId: 6,
      clienteId: 7,
      email: 'cliente@example.com',
    },
    persistence: 'session',
  },
  version: 1,
})
expect(localStorage.getItem(AUTH_STORE_KEY)).toBeNull()
```

Repetir para `local`, invertendo storages e `persistence`. No teste do carrinho:

```ts
expect(JSON.parse(localStorage.getItem(CART_SESSION_STORE_KEY)!)).toEqual({
  state: { cartIdsByCustomer: { '7': 70, '8': 80 } },
  version: 1,
})
```

Adicionar chaves sentinela `public-preference` em ambos os storages e, após
`clearPrivateSession`, provar que as duas chaves da aplicação foram limpas ou
sanitizadas, enquanto as sentinelas permanecem. O teste deve manter query e
mutation públicas e remover as privadas.

- [ ] **Step 2: Executar o RED**

Run:

```powershell
npx vitest run src/features/auth/store/authStore.test.ts src/features/cart/store/cartSessionStore.test.ts src/features/auth/session/clearPrivateSession.test.ts
```

Expected: os snapshots existentes podem passar; o novo teste com uma cópia
stale do carrinho em `sessionStorage` deve falhar, porque a fronteira ainda não
remove essa cópia defensiva.

- [ ] **Step 3: Fazer a limpeza defensiva mínima**

Em `clearPrivateSession`, após remover o ID pelo store, remover também
`CART_SESSION_STORE_KEY` do `sessionStorage` dentro de `try/catch`. Não apagar
toda a chave local: ela pode conter IDs de outros clientes. Não criar nova
abstração de storage.

- [ ] **Step 4: Executar o GREEN**

Executar o mesmo comando. Expected: todos PASS, com payloads literais e dados
públicos preservados.

- [ ] **Step 5: Commit**

```powershell
git add frontend/src/features/auth/store/authStore.test.ts frontend/src/features/cart/store/cartSessionStore.test.ts frontend/src/features/auth/session/clearPrivateSession.ts frontend/src/features/auth/session/clearPrivateSession.test.ts
git commit -m "test(TASK-126): Fixar contrato de persistência privada"
```

### Task 2: Centralizar logout, 401 e cancelamento

**Files:**
- Modify: `frontend/src/features/auth/mutations/useLogoutMutation.test.tsx`
- Modify: `frontend/src/features/auth/mutations/useLogoutMutation.ts`
- Modify: `frontend/src/features/auth/context/UnauthorizedHandlerProvider.test.tsx`
- Modify: `frontend/src/features/auth/context/UnauthorizedHandlerProvider.tsx`
- Modify: `frontend/src/features/customer/mutations/useDeleteCustomerMutation.test.tsx`
- Modify: `frontend/src/features/customer/mutations/useDeleteCustomerMutation.ts`

**Interfaces:**
- Consumes: `clearPrivateSession(queryClient, customerId)`.
- Produces: três fronteiras com captura da identidade antes da limpeza.

- [ ] **Step 1: Escrever RED do logout**

Monte sessão, IDs de clientes 7 e 8, query/mutation privada e pública, snapshot
do cliente 7 e cópia auth no storage oposto. Resolva ou rejeite `logout` e
espere:

```ts
expect(useCartSessionStore.getState().getCartId(7)).toBeUndefined()
expect(useCartSessionStore.getState().getCartId(8)).toBe(80)
expect(clearSnapshot7).toHaveBeenCalledOnce()
expect(queryClient.getQueryData(['public', 'catalog'])).toEqual(['public'])
expect(queryClient.getMutationCache().find({
  mutationKey: ['public', 'newsletter'],
})).toBeDefined()
```

Expected RED: carrinho e snapshot do cliente 7 permanecem.

- [ ] **Step 2: Implementar logout com identidade capturada**

Antes de iniciar a mutation, a variável já contém `token`; em `onSettled`,
capture a sessão corrente antes de qualquer clear e só limpe se o token ainda
corresponder:

```ts
onSettled: (_data, _error, token) => {
  const session = useAuthStore.getState().session
  if (session?.token === token) {
    clearPrivateSession(queryClient, session.clienteId)
  }
  navigate('/entrar', { replace: true })
},
```

Isso impede um logout tardio da sessão A de apagar uma sessão B.

- [ ] **Step 3: Escrever RED do `401`**

Atualize as dependências da factory para expor uma única ação:

```ts
type UnauthorizedHandlerDependencies = {
  getReturnTo: () => string
  clearPrivateSession: () => void
  navigate: (...)
}
```

No provider real, monte sessão, carrinho, caches e snapshot; dispare o callback
subscrito e prove a mesma matriz do logout. Expected RED: carrinho/snapshot
permanecem.

- [ ] **Step 4: Implementar `401` capturando antes de limpar**

No callback real:

```ts
clearPrivateSession: () => {
  const customerId = useAuthStore.getState().session?.clienteId
  if (customerId !== undefined) clearPrivateSession(queryClient, customerId)
},
```

Preservar latch, `returnTo` e `replace: true`. A factory chama a ação uma vez.

- [ ] **Step 5: Escrever RED do cancelamento concorrente**

Além dos testes existentes para `clienteId` e token, prove que:

- uma resposta válida chama a fronteira e preserva estado público;
- resposta da conta A depois de login B não limpa B;
- duas conclusões/settlements não recriam dados nem executam limpeza duplicada.

Expected RED: o caso funcional passa, mas o spy em
`clearPrivateSession` falha porque o hook duplica a implementação.

- [ ] **Step 6: Delegar cancelamento à fronteira**

Manter sem alterações o guard:

```ts
if (result.customerId !== attempt.customerId
  || current?.clienteId !== attempt.customerId
  || current.token !== attempt.token) return
```

Substituir as quatro operações manuais por:

```ts
clearPrivateSession(queryClient, attempt.customerId)
```

- [ ] **Step 7: Rodar o gate focado**

Run:

```powershell
npx vitest run src/features/auth/mutations/useLogoutMutation.test.tsx src/features/auth/context/UnauthorizedHandlerProvider.test.tsx src/features/customer/mutations/useDeleteCustomerMutation.test.tsx src/features/auth/session/clearPrivateSession.test.ts
```

Expected: PASS; públicas preservadas; nenhum fluxo limpa sessão sucessora.

- [ ] **Step 8: Commit**

```powershell
git add frontend/src/features/auth frontend/src/features/customer/mutations
git commit -m "fix(TASK-126): Centralizar limpeza de sessão privada"
```

### Task 3: Bloquear resposta tardia da criação de carrinho

**Files:**
- Modify: `frontend/src/features/cart/mutations/useCreateCartMutation.test.tsx`
- Modify: `frontend/src/features/cart/mutations/useCreateCartMutation.ts`

**Interfaces:**
- Consumes: `useAuthStore.getState().session`.
- Produces: persistência/reconciliação autorizada somente por identidade completa.

- [ ] **Step 1: Escrever a matriz RED**

Use uma promise controlada para `createCart`. Inicie com:

```ts
const attempt = {
  token: 'token-a',
  customerId: 10,
}
const pending = result.current.mutateAsync(attempt)
```

Antes de resolver, execute separadamente:

1. `clearPrivateSession(queryClient, 10)` (logout/`401`);
2. sessão `clienteId: 10`, `token: 'token-b'`;
3. sessão `clienteId: 20`, `token: 'token-b'`;
4. exclusão simulada limpando a sessão e o ID.

Após resolver `{ id: 101, createdAt: ... }`, em todos os casos:

```ts
expect(useCartSessionStore.getState().getCartId(10)).toBeUndefined()
expect(localStorage.getItem(CART_SESSION_STORE_KEY)).not.toContain('101')
expect(queryClient.getQueryData(cartCache.detail(10, 101))).toBeUndefined()
```

Adicionar controle positivo com a mesma sessão `clienteId: 10`,
`token: 'token-a'`, que deve persistir e reconciliar uma vez.

- [ ] **Step 2: Executar o RED**

Run:

```powershell
npx vitest run src/features/cart/mutations/useCreateCartMutation.test.tsx
```

Expected: quatro casos tardios FAIL porque `onSuccess` sempre chama `setCartId`.

- [ ] **Step 3: Implementar o guard mínimo**

Importar o auth store e iniciar `onSuccess` com:

```ts
const session = useAuthStore.getState().session
if (session?.clienteId !== customerId || session.token !== token) return
```

Para isso, preservar `token` na desestruturação das variables do callback:

```ts
onSuccess: async (cart, { customerId, token, reconcile = true }) => {
```

Só depois executar `setCartId` e `reconcileActiveCart`. Não adicionar abort
controller: o guard cobre a propriedade de segurança exigida com menor escopo.

- [ ] **Step 4: Executar GREEN e regressões do carrinho**

Run:

```powershell
npx vitest run src/features/cart/mutations/useCreateCartMutation.test.tsx src/features/cart/hooks/useAddProductToCart.test.tsx src/features/cart/cart.integration.test.tsx
```

Expected: PASS; criação normal e serialização existentes preservadas.

- [ ] **Step 5: Commit**

```powershell
git add frontend/src/features/cart/mutations/useCreateCartMutation.ts frontend/src/features/cart/mutations/useCreateCartMutation.test.tsx
git commit -m "fix(TASK-126): Rejeitar resposta tardia de carrinho"
```

### Task 4: Remover o reporter de console padrão

**Files:**
- Modify: `frontend/src/bootstrap.test.tsx`
- Modify: `frontend/src/bootstrap.tsx`

**Interfaces:**
- Consumes: `BootstrapOptions.reportMockingFailure` para hosts/testes.
- Produces: bootstrap sem logging implícito; reporter explícito ainda recebe causa.

- [ ] **Step 1: Escrever RED do fallback**

Espione `console.error`, rejeite mocking com erro contendo token e CPF e não
injete reporter:

```ts
const sensitive = new Error('token=secret cpf=12345678909')
await bootstrap({
  enableMocking: () => Promise.reject(sensitive),
  getRootElement: () => document.createElement('div'),
  render: vi.fn(),
})
expect(consoleError).not.toHaveBeenCalled()
```

Expected RED: o fallback atual chama o console e vaza a causa.

- [ ] **Step 2: Implementar reporter seguro**

Manter a assinatura injetável e remover o default:

```ts
options.reportMockingFailure?.('Falha ao iniciar MSW.', error)
```

O reporter injetado continua recebendo o erro para observabilidade controlada.
Sem injeção, não há logging implícito.

- [ ] **Step 3: Executar GREEN**

Run:

```powershell
npx vitest run src/bootstrap.test.tsx
```

Expected: PASS, render único e sem unhandled rejection.

- [ ] **Step 4: Commit**

```powershell
git add frontend/src/bootstrap.tsx frontend/src/bootstrap.test.tsx
git commit -m "fix(TASK-126): Sanitizar falha do bootstrap"
```

### Task 5: Automatizar auditoria e registrar evidência

**Files:**
- Create: `frontend/scripts/audit-private-data.mjs`
- Modify: `frontend/package.json`
- Create: `docs/frontend-quality/task-126-private-data-audit.md`

**Interfaces:**
- Produces: `npm run audit:private-data`, saída determinística e relatório.

- [ ] **Step 1: Escrever o auditor com allowlist exata**

O script percorre somente `src`, ignora `*.test.*`, lê texto UTF-8 e:

1. encontra declarações `*_STORE_KEY`;
2. exige exatamente:

```js
new Map([
  ['AUTH_STORE_KEY', 'shop-api:auth'],
  ['CART_SESSION_STORE_KEY', 'shop-api:cart-session'],
])
```

3. falha em qualquer `console.(log|info|warn|error|debug)(`;
4. examina argumentos literais de `new Error`, `AppError` e reporters e falha
   em `token|cpf|documentoFiscal`, case-insensitive;
5. imprime arquivos examinados, duas chaves e `PASS`.

Não pesquisar o identificador `token` genericamente: ele é necessário ao
contrato e isso produziria falso positivo.

- [ ] **Step 2: Adicionar o script npm**

```json
"audit:private-data": "node scripts/audit-private-data.mjs"
```

- [ ] **Step 3: Verificar RED controlado**

Crie temporariamente um fixture dentro de diretório temporário aceito por uma
função exportada do script, contendo `console.error('token secreto')`, e teste a
função com Node `assert`. Se o script permanecer monolítico, execute uma cópia
temporária e remova-a antes do commit. Expected: exit code 1 citando arquivo e
regra, sem repetir o literal sensível na saída.

- [ ] **Step 4: Executar auditoria real**

Run:

```powershell
npm run audit:private-data
```

Expected: PASS, exatamente duas chaves e zero chamadas `console.*` em produção.

- [ ] **Step 5: Escrever o relatório**

Registrar em `docs/frontend-quality/task-126-private-data-audit.md`:

- commit base e ambiente (`node --version`, `npm --version`);
- tabela exata de chave, storage, envelope e campos;
- decisão explícita de preservar `tipo` por contrato;
- matriz logout/`401`/cancelamento/resposta tardia;
- queries/mutations públicas preservadas;
- snapshots dos dois payloads;
- comando e resultado da busca estática;
- testes, typecheck e lint com contagens/resultados.

- [ ] **Step 6: Rodar gates completos**

Run:

```powershell
npm run audit:private-data
npm run typecheck
npm run lint
npm test
npm run build
```

Expected: todos exit code 0; build mantém o gate de performance da TASK-125.

- [ ] **Step 7: Diff-check**

Run:

```powershell
git diff --check 05c79cd039c918ce70b831ad17e0d9e0025bae4f..HEAD
git status --short
```

Expected: diff-check sem saída. Antes do commit final, somente os arquivos do
relatório/auditor devem aparecer; nenhum artefato `dist`, coverage ou fixture.

- [ ] **Step 8: Commit**

```powershell
git add frontend/scripts/audit-private-data.mjs frontend/package.json docs/frontend-quality/task-126-private-data-audit.md
git commit -m "test(TASK-126): Registrar auditoria de dados privados"
```

## Self-review

- Cobertura: inventário, payloads, ambos storages, caches, snapshots, três
  fronteiras, concorrência tardia, estado público, logs, reporter, typecheck e
  lint possuem passos e gates explícitos.
- Escopo: `tipo` não é removido; a decisão contratual está documentada.
- Consistência: toda limpeza usa
  `clearPrivateSession(queryClient, customerId)`; todo guard tardio usa
  `clienteId + token`.
- Sem placeholders: cada alteração possui arquivo, teste RED, implementação
  mínima e comando GREEN.
