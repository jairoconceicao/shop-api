# Fase 8 — Lote 1: Cobertura Determinística Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** fechar, com cobertura determinística e evidência rastreável, as lacunas de contratos, formatação, stores e componentes base das `TASK-106` a `TASK-110`.

**Architecture:** cada task preserva sua fronteira: contratos/adapters, funções puras, store de autenticação, store de carrinho e primitives de UI. O ciclo é TDD quando há lacuna; `TASK-109` conclui por verificação somente se todos os comandos e a revisão confirmarem a cobertura existente.

**Tech Stack:** React 19, TypeScript 5.7, Zod 4, Zustand 5, Vitest 4, Testing Library 16, jsdom, ESLint 10.

## Global Constraints

- Executar somente em branch diferente de `main`; o agente principal atua somente como orquestrador.
- Writers são sequenciais no checkout compartilhado; produto muda somente após RED reproduzível.
- Todo comando npm usa `npm --prefix frontend`; todos os resultados exigidos têm exit code `0`, salvo o RED intencional.
- Cada task recebe commit próprio no formato `test(TASK-ID)`, `fix(TASK-ID)` ou `feat(TASK-ID)`.
- Não alterar `docs/frontend-tasks-v2.md` até implementação e revisão aprovadas; não alterar `docs/frontend-backlog.md`.
- Lote 2 permanece bloqueado até `TASK-106`–`TASK-110` estarem `DONE`.

## Mapa de arquivos

- `frontend/src/shared/adapters/numbers.test.ts`: números transportados, finitude e IDs seguros.
- `frontend/src/shared/contracts/apiEnvelopes.test.ts`: envelopes estritos e nulabilidade.
- `frontend/src/features/auth/contracts/login.test.ts`, `frontend/src/features/catalog/contracts/catalog.test.ts`, `frontend/src/features/cart/contracts/cart.test.ts`, `frontend/src/features/checkout/contracts/checkout.test.ts`, `frontend/src/features/checkout/contracts/order.test.ts`, `frontend/src/features/customer/contracts/registration.test.ts`, `frontend/src/features/customer/contracts/customerProfile.test.ts` e `frontend/src/features/orders/contracts/orders.test.ts`: schemas/adapters verticais e enums canônicos.
- `frontend/src/shared/formatting/personalData.test.ts` e novo `frontend/src/shared/dates/localCivilDate.test.ts`: dados pessoais e data civil.
- Novo `frontend/src/shared/formatting/currency.ts` e teste: única função de moeda, caso a exploração confirme ausência.
- `frontend/src/features/auth/store/authStore.test.ts`: storage, reidratação, expiração, corrupção e versão.
- `frontend/src/features/cart/store/cartSessionStore.test.ts`: prova integral existente da sessão do carrinho.
- Testes em `frontend/src/shared/ui/**`: semântica, teclado, foco e estados.
- Evidências em `docs/frontend-quality/task-106-contract-matrix.md`, `task-107-formatting-matrix.md`, `task-109-cart-session-evidence.md` e `task-110-component-matrix.md`.

## Workflow obrigatório, repetido para cada task

- [ ] Confirmar no `docs/frontend-tasks-v2.md` que a task está `READY`, todas as dependências listadas estão `DONE`, critérios existem e não há writer concorrente.
- [ ] Registrar `BASE_COMMIT=$(git rev-parse HEAD)` no relatório do orquestrador e mover a task para execução sem editar backlog.
- [ ] Delegar a um explorador read-only a comparação critério↔teste↔produto; aguardar relatório antes de delegar escrita.
- [ ] Delegar a um único implementador a task e os passos abaixo; aguardar RED, implementação mínima, GREEN e commits.
- [ ] Gerar `git diff --check $BASE_COMMIT..HEAD` e `git diff --stat $BASE_COMMIT..HEAD`, depois entregar `git diff $BASE_COMMIT..HEAD` a um revisor.
- [ ] Se houver finding `CRITICAL` ou `IMPORTANT`, devolver ao mesmo implementador, repetir testes/gates e reenviar o novo diff ao revisor.
- [ ] Somente após testes e revisão aprovados, atualizar a task para `DONE`, registrar comandos/contagens/commits no backlog e criar commit final se houver mudança pendente.

---

### Task 106: TASK-106 — schemas e adapters

**Files:**
- Modify: `frontend/src/shared/adapters/numbers.test.ts`
- Modify: `frontend/src/shared/contracts/apiEnvelopes.test.ts`
- Modify: `frontend/src/features/auth/contracts/login.test.ts`
- Modify: `frontend/src/features/catalog/contracts/catalog.test.ts`
- Modify: `frontend/src/features/cart/contracts/cart.test.ts`
- Modify: `frontend/src/features/checkout/contracts/checkout.test.ts`
- Modify: `frontend/src/features/checkout/contracts/order.test.ts`
- Modify: `frontend/src/features/customer/contracts/registration.test.ts`
- Modify: `frontend/src/features/customer/contracts/customerProfile.test.ts`
- Modify: `frontend/src/features/orders/contracts/orders.test.ts`
- Create: `docs/frontend-quality/task-106-contract-matrix.md`
- Modify only after RED: the matching `.ts` beside the failing test above.

**Interfaces:**
- Consumes: `normalizeNumber(value: number | string): number`, `normalizeId(value: number | string): number`, `createApiResponseSchema<T extends z.ZodType>(dataSchema: T)`, `createPagedResponseSchema<T extends z.ZodType>(itemSchema: T)`, `adaptLoginResponse(response: unknown): AuthSession`, `paymentMethodSchema`, `adaptCreateOrderRequest(input: unknown): CreateOrderRequest`, `adaptCreatedOrderResponse(response: unknown): CreatedOrder`, `adaptOrdersPage(response: unknown): OrdersPage`, `adaptOrderResponse(response: unknown): Order`, `adaptCancelledOrderResponse(response: unknown): CancelledOrder`.
- Produces: testes que provam coerção `number|string`, nulabilidade declarada, `Pix|Cartao|Boleto`, todos os valores de `orderStatuses`, objetos estritos e rejeição de `NaN`, infinito e inteiros inseguros.

- [ ] **Step 1: inventariar sem editar produto**

Execute `rg -n "normalize(Id|Number)|transport(Id|Number)|z.enum|nullable|strict" frontend/src/shared frontend/src/features --glob "*.ts"` e registre em `docs/frontend-quality/task-106-contract-matrix.md` uma linha por schema/adaptador com colunas `arquivo`, `interface`, `number`, `string numérica`, `null`, `enum`, `extra`, `envelope inválido`, `teste`.

- [ ] **Step 2: escrever os testes RED faltantes**

Use estes blocos completos nos arquivos proprietários, importando os exports já citados:

```ts
it.each([Number.NaN, Infinity, -Infinity])('rejects non-finite transport number %s', (value) => {
  expect(() => normalizeNumber(value)).toThrow(TypeError)
})

it.each([Number.MAX_SAFE_INTEGER + 1, '9007199254740992', 1.5, '1.5'])(
  'rejects unsafe transport id %s',
  (value) => expect(() => normalizeId(value)).toThrow(TypeError),
)
```

```ts
it.each(['Pix', 'Cartao', 'Boleto'])('accepts canonical payment method %s', (value) => {
  expect(paymentMethodSchema.parse(value)).toBe(value)
})

it.each(['PIX', 'Cartão', 'Dinheiro', null])('rejects non-canonical payment method %s', (value) => {
  expect(paymentMethodSchema.safeParse(value).success).toBe(false)
})
```

No `orders.test.ts`, use o export real para evitar uma lista duplicada:

```ts
it.each(orderStatuses)('accepts canonical order status %s', (status) => {
  expect(orderStatusSchema.parse(status)).toBe(status)
})

it.each(['Unknown', 'cancelado', '', null])('rejects unknown order status %s', (status) => {
  expect(orderStatusSchema.safeParse(status).success).toBe(false)
})
```

Para cada envelope já presente no arquivo proprietário, derive do fixture válido existente e aplique exatamente estas assertions:

```ts
expect(() => adapter({ ...validResponse, extra: true })).toThrow()
expect(() => adapter({ sucesso: true, dados: null })).toThrow()
expect(() => adapter({ sucesso: false, dados: validResponse.dados })).toThrow()
```

- [ ] **Step 3: confirmar RED focado**

Run: `npm --prefix frontend test -- src/shared/adapters/numbers.test.ts src/shared/contracts/apiEnvelopes.test.ts src/features/auth/contracts/login.test.ts src/features/catalog/contracts/catalog.test.ts src/features/cart/contracts/cart.test.ts src/features/checkout/contracts/checkout.test.ts src/features/checkout/contracts/order.test.ts src/features/customer/contracts/registration.test.ts src/features/customer/contracts/customerProfile.test.ts src/features/orders/contracts/orders.test.ts`

Expected: FAIL somente nas células marcadas ausentes na matriz; se tudo passar, não alterar produto e registrar `PASS preexistente` por célula.

- [ ] **Step 4: implementar o mínimo após RED**

No schema proprietário que aceitou propriedade extra, acrescente `.strict()` ao `z.object({...})`. Para número/ID, reutilize transformação já existente; não crie coerção paralela. Para envelope divergente, componha `createApiResponseSchema(...)`/`createPagedResponseSchema(...)` e valide o discriminante existente. Não altere campos cuja OpenAPI permite `null`; faça o teste esperar `null` somente nesses campos.

- [ ] **Step 5: GREEN, gates e commits**

Run: comando focado do Step 3; depois `npm --prefix frontend run typecheck` e `npm --prefix frontend run lint`. Expected: todos exit `0`.

```powershell
git add frontend/src/shared/adapters/numbers.test.ts frontend/src/shared/contracts/apiEnvelopes.test.ts frontend/src/features/auth/contracts/login.test.ts frontend/src/features/catalog/contracts/catalog.test.ts frontend/src/features/cart/contracts/cart.test.ts frontend/src/features/checkout/contracts/checkout.test.ts frontend/src/features/checkout/contracts/order.test.ts frontend/src/features/customer/contracts/registration.test.ts frontend/src/features/customer/contracts/customerProfile.test.ts frontend/src/features/orders/contracts/orders.test.ts docs/frontend-quality/task-106-contract-matrix.md
git commit -m "test(TASK-106): ampliar matriz de contratos"
```

Se produto mudou, faça commit separado com os arquivos `.ts` exatos do RED: `git commit -m "fix(TASK-106): rejeitar contratos de transporte inválidos"`.

---

### Task 107: TASK-107 — formatadores e normalizadores

**Files:**
- Modify: `frontend/src/shared/formatting/personalData.test.ts`
- Create: `frontend/src/shared/formatting/currency.ts`
- Create: `frontend/src/shared/formatting/currency.test.ts`
- Create: `frontend/src/shared/dates/localCivilDate.test.ts`
- Create: `docs/frontend-quality/task-107-formatting-matrix.md`
- Modify only after RED: `frontend/src/shared/formatting/personalData.ts`, `frontend/src/shared/dates/localCivilDate.ts`.

**Interfaces:**
- Consumes: `normalizeCpf(string): string`, `formatCpf(string): string`, `normalizePostalCode(string): string`, `formatPostalCode(string): string`, `normalizeCellPhone(string): string`, `formatCellPhone(string): string`, `splitCellPhone(string): { ddd: string; numero: string }`, `localCivilDate(date?: Date): string`.
- Produces: `formatCurrency(value: number): string`, formatado por `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.

- [ ] **Step 1: escrever moeda e seu RED**

```ts
// frontend/src/shared/formatting/currency.test.ts
import { describe, expect, it } from 'vitest'
import { formatCurrency } from './currency'

describe('formatCurrency', () => {
  it.each([[0, 'R$ 0,00'], [-12.5, '-R$ 12,50'], [1234.56, 'R$ 1.234,56']] as const)(
    'formats %s in pt-BR',
    (value, expected) => expect(formatCurrency(value)).toBe(expected),
  )
})
```

Run: `npm --prefix frontend test -- src/shared/formatting/currency.test.ts`. Expected: FAIL com módulo `./currency` ausente.

- [ ] **Step 2: implementar moeda mínima e confirmar GREEN**

```ts
// frontend/src/shared/formatting/currency.ts
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}
```

Run: comando do Step 1. Expected: PASS.

- [ ] **Step 3: completar dados pessoais e data civil**

Acrescente a `personalData.test.ts`:

```ts
it.each([
  ['abc123.456.789-01xyz', '12345678901'],
  ['1234567890199', '12345678901'],
])('normalizes strange and overlong CPF input %s', (input, expected) => {
  expect(normalizeCpf(input)).toBe(expected)
  expect(normalizeCpf(formatCpf(input))).toBe(expected)
})

it.each([
  ['CEP 12345-678 xx99', '12345678'],
  ['123456789', '12345678'],
])('normalizes strange and overlong postal code %s', (input, expected) => {
  expect(normalizePostalCode(input)).toBe(expected)
  expect(normalizePostalCode(formatPostalCode(input))).toBe(expected)
})

it.each([
  ['tel:+55 (11) 91234-5678', '55119123456'],
  ['1191234567899', '11912345678'],
])('normalizes strange and overlong phone %s', (input, expected) => {
  expect(normalizeCellPhone(input)).toBe(expected)
  expect(normalizeCellPhone(formatCellPhone(input))).toBe(expected)
})
```

Crie `localCivilDate.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { localCivilDate } from './localCivilDate'

describe('localCivilDate', () => {
  it.each([
    [new Date(2026, 0, 1, 0, 0), '2026-01-01'],
    [new Date(2026, 11, 31, 23, 59), '2026-12-31'],
  ])('keeps the local civil day for %s', (date, expected) => {
    expect(localCivilDate(date)).toBe(expected)
  })

  it('does not derive the civil day from UTC', () => {
    const local = new Date(2026, 6, 15, 23, 30)
    expect(localCivilDate(local)).toBe('2026-07-15')
  })
})
```

- [ ] **Step 4: RED/GREEN, matriz e gates**

Run: `npm --prefix frontend test -- src/shared/formatting/personalData.test.ts src/shared/formatting/currency.test.ts src/shared/dates/localCivilDate.test.ts src/features/orders/routing/ordersUrl.test.ts src/features/customer/contracts/customerProfile.test.ts`. Expected: RED somente se uma assertion nova expuser lacuna; após correção mínima, PASS.

Registre em `docs/frontend-quality/task-107-formatting-matrix.md` as entradas e saídas literais acima, o round-trip e os cinco arquivos executados. Depois rode `npm --prefix frontend run typecheck` e `npm --prefix frontend run lint`; expected exit `0`.

Commit testes/implementação pura: `git add frontend/src/shared/formatting frontend/src/shared/dates docs/frontend-quality/task-107-formatting-matrix.md && git commit -m "test(TASK-107): cobrir formatadores e datas civis"`. Se corrigir comportamento existente, isole em `fix(TASK-107): corrigir normalização de dados locais`.

---

### Task 108: TASK-108 — authStore

**Files:**
- Modify: `frontend/src/features/auth/store/authStore.test.ts`
- Modify only after RED: `frontend/src/features/auth/store/authStore.ts`
- Modify only after RED de timer: `frontend/src/features/auth/store/AuthSessionInitializer.tsx`

**Interfaces:** consumes `AUTH_STORE_KEY`, `AUTH_STORE_VERSION`, `AuthSession`, `isAuthSessionExpired(session: AuthSession, now?: number): boolean`, `useAuthStore`; persistence aceita `'session'|'local'`.

- [ ] **Step 1: adicionar casos de corrupção, versão e falha de storage**

```ts
it.each([
  { state: { session: { ...session, expiraEm: '' }, persistence: 'local' }, version: AUTH_STORE_VERSION },
  { state: { session: { ...session, expiraEm: 'invalid' }, persistence: 'local' }, version: AUTH_STORE_VERSION },
  { state: { session: { ...session, extra: 'remote' }, persistence: 'local' }, version: 0 },
])('discards unsafe persisted auth payload %#', async (payload) => {
  window.localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(payload))
  await useAuthStore.persist.rehydrate()
  expect(useAuthStore.getState().session).toBeNull()
  expect(window.localStorage.getItem(AUTH_STORE_KEY)).toBeNull()
  expect(window.sessionStorage.getItem(AUTH_STORE_KEY)).toBeNull()
})

it('keeps the in-memory session usable when browser storage throws', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
  expect(() => useAuthStore.getState().setSession(session, 'local')).not.toThrow()
  expect(useAuthStore.getState().session).toEqual(session)
})
```

- [ ] **Step 2: confirmar RED**

Run: `npm --prefix frontend test -- src/features/auth/store/authStore.test.ts`. Expected: FAIL no payload versão `0`/campo extra, demonstrando ausência de migração/sanitização; testes de storage/timer existentes continuam PASS.

- [ ] **Step 3: implementação mínima**

Adicione um schema estrito de sessão e `migrate` à configuração `persist`; o retorno completo é:

```ts
const persistedAuthSchema = z.object({
  session: z.object({
    token: z.string().min(1), tipo: z.string().min(1), expiraEm: z.iso.datetime(),
    usuarioId: z.number().int().safe(), clienteId: z.number().int().safe(), email: z.email(),
  }).strict(),
  persistence: z.enum(['session', 'local']),
}).strict()

function migrateAuthState(value: unknown) {
  const parsed = persistedAuthSchema.safeParse(value)
  return parsed.success && !isAuthSessionExpired(parsed.data.session)
    ? parsed.data
    : { session: null, persistence: 'session' as const }
}
```

Importe `z` de `zod`, configure `migrate: migrateAuthState` e `merge` usando o mesmo resultado sanitizado. Em descarte, `onRehydrateStorage` chama `clearSession()` para remover ambos os storages. Não altere a escolha já implementada por `authStateStorage`.

- [ ] **Step 4: GREEN e gates**

Run: teste focado; `npm --prefix frontend run typecheck`; `npm --prefix frontend run lint`. Expected: todos exit `0`, incluindo timer no instante exato e escolha/limpeza dos dois storages.

Commit: `git add frontend/src/features/auth/store/authStore.test.ts && git commit -m "test(TASK-108): cobrir persistência e corrupção da autenticação"`; se produto mudou: `git add frontend/src/features/auth/store/authStore.ts frontend/src/features/auth/store/AuthSessionInitializer.tsx && git commit -m "fix(TASK-108): sanitizar sessão persistida"`.

---

### Task 109: TASK-109 — cartSessionStore (verificação)

**Files:**
- Verify: `frontend/src/features/cart/store/cartSessionStore.ts`
- Verify: `frontend/src/features/cart/store/cartSessionStore.test.ts`
- Create: `docs/frontend-quality/task-109-cart-session-evidence.md`

**Interfaces:** consumes `CART_SESSION_STORE_KEY`, `CART_SESSION_STORE_VERSION`, `useCartSessionStore.getState().getCartId(customerId: number): number|undefined`, `.setCartId(customerId: number, cartId: number): void`, `.removeCartId(customerId: number): void`.

- [ ] **Step 1: prova exata, sem alterar produto**

Mapeie no relatório os dez testes existentes: persistência mínima/versionada; isolamento; atualização alvo; remoção alvo; reidratação; migração v0; shape inválido; versão atual corrompida/remote field; chave canônica; falha de `localStorage`. Inclua o nome literal de cada `it(...)` e o critério correspondente.

- [ ] **Step 2: executar evidência focada e repetida**

Run: `npm --prefix frontend test -- src/features/cart/store/cartSessionStore.test.ts --reporter=verbose`. Expected: `10` testes PASS, exit `0`.

Run: `npm --prefix frontend test -- src/features/cart/store/cartSessionStore.test.ts --reporter=verbose` novamente. Expected: mesmos `10` testes PASS, sem vazamento entre execuções.

Run: `npm --prefix frontend run typecheck`; `npm --prefix frontend run lint`. Expected: exit `0` em ambos.

- [ ] **Step 3: decisão fechada e commit**

Se qualquer um dos dez testes não existir ou falhar, a task deixa de ser verificação: escreva primeiro o teste literal do critério ausente, confirme RED, corrija somente `cartSessionStore.ts`, repita todos os comandos e use `test(TASK-109)`/`fix(TASK-109)`. Se os resultados forem os esperados, não modifique `frontend/src`; registre commit SHA, comandos, contagens e exit codes.

`git add docs/frontend-quality/task-109-cart-session-evidence.md && git commit -m "test(TASK-109): registrar robustez da sessão do carrinho"`.

---

### Task 110: TASK-110 — componentes base

**Files:**
- Modify: `frontend/src/shared/ui/buttons/buttons.test.tsx`
- Modify: `frontend/src/shared/ui/forms/forms.test.tsx`
- Modify: `frontend/src/shared/ui/forms/QuantityInput.test.tsx`
- Modify: `frontend/src/shared/ui/navigation/Pagination.test.tsx`
- Modify: `frontend/src/shared/ui/overlays/overlays.test.tsx`
- Modify: `frontend/src/shared/ui/feedback/feedback.test.tsx`
- Modify: `frontend/src/shared/ui/states/states.test.tsx`
- Modify: `frontend/src/shared/ui/indicators/indicators.test.tsx`
- Create: `docs/frontend-quality/task-110-component-matrix.md`
- Modify only after RED: component `.tsx` beside the failing test.

**Interfaces:** consumes `Button`, `IconButton`, `LinkButton`, `Input`, `Select`, `Checkbox`, `FormErrorSummary`, `QuantityInput`, `Pagination`, `Dialog`, `DropdownMenu`, `DropdownMenuItem`, `InlineAlert`, `Toast`, `EmptyState`, `ErrorState`, `Skeleton`, `Badge`, `Chip`.

- [ ] **Step 1: criar matriz literal**

No relatório, uma linha por export acima e colunas `nome/role`, `teclado`, `disabled/loading`, `foco`, `aria-current`, `live region`, `empty/error/skeleton`, `teste`. Marque `N/A` somente quando a semântica nativa não oferece o estado (por exemplo, foco em `Badge`).

- [ ] **Step 2: preencher somente células descobertas**

Use Testing Library por semântica. Os blocos para lacunas previstas são:

```tsx
it('does not activate a disabled button from keyboard', () => {
  const onClick = vi.fn()
  render(<Button disabled onClick={onClick}>Salvar</Button>)
  const button = screen.getByRole('button', { name: 'Salvar' })
  fireEvent.keyDown(button, { key: 'Enter' })
  fireEvent.keyDown(button, { key: ' ' })
  expect(button).toBeDisabled()
  expect(onClick).not.toHaveBeenCalled()
})
```

```tsx
it('keeps pagination at its limits for keyboard input', () => {
  const onPageChange = vi.fn()
  render(<Pagination page={1} totalPages={3} onPageChange={onPageChange} />)
  const navigation = screen.getByRole('navigation', { name: 'Paginação' })
  fireEvent.keyDown(navigation, { key: 'ArrowLeft' })
  expect(onPageChange).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Página 1', current: 'page' })).toBeInTheDocument()
})
```

```tsx
it('announces an error summary and links to the invalid field', () => {
  render(<><Input id="email" label="E-mail" error="E-mail inválido" /><FormErrorSummary errors={[{ field: 'email', message: 'E-mail inválido' }]} /></>)
  expect(screen.getByRole('alert')).toHaveTextContent('E-mail inválido')
  expect(screen.getByLabelText('E-mail')).toHaveAccessibleDescription('E-mail inválido')
})
```

Os testes existentes já cobrem `QuantityInput` (setas/Home/End/limites), `Pagination` (setas/Home/End/`aria-current`) e `Dialog` (foco inicial/trap/Escape/retorno). Não os duplique; cite seus nomes na matriz. Para feedback/states, afirme `getByRole('alert'|'status')` e nome visível; para skeleton, `aria-hidden` ou nome de carregamento conforme a interface real encontrada.

- [ ] **Step 3: RED, correção mínima e GREEN**

Run: `npm --prefix frontend test -- src/shared/ui/buttons/buttons.test.tsx src/shared/ui/forms/forms.test.tsx src/shared/ui/forms/QuantityInput.test.tsx src/shared/ui/navigation/Pagination.test.tsx src/shared/ui/overlays/overlays.test.tsx src/shared/ui/feedback/feedback.test.tsx src/shared/ui/states/states.test.tsx src/shared/ui/indicators/indicators.test.tsx`. Expected: FAIL apenas nas células novas descobertas; após corrigir semântica no componente proprietário, PASS.

Run: `npm --prefix frontend run typecheck`; `npm --prefix frontend run lint`; `npm --prefix frontend test`. Expected: todos exit `0`; a suíte global encerra o gate do lote.

- [ ] **Step 4: commits e gate do lote**

`git add frontend/src/shared/ui docs/frontend-quality/task-110-component-matrix.md && git commit -m "test(TASK-110): completar matriz dos componentes base"`. Se produto mudou, separe `git commit -m "fix(TASK-110): corrigir semântica dos componentes base"`.

Após revisão aprovada e backlog atualizado, confirme `TASK-106`–`TASK-110` `DONE`, `git status --short` sem mudanças pendentes e só então altere `TASK-111`–`TASK-116` para `READY` em uma operação de backlog própria.

## Self-review

- Spec coverage: `TASK-106` cobre transportes/envelopes/enums; `107` moeda/dados pessoais/data; `108` storage/expiração/versão/falha; `109` todos os dez critérios existentes; `110` teclado/foco/estado/semântica.
- Placeholder scan: nenhuma ocorrência de `TBD`, `TODO`, “similar”, glob em paths de edição ou decisão de implementação aberta; produto só muda sob RED indicado.
- Type consistency: todas as assinaturas foram conferidas nos fontes; `postalCode` corresponde às funções reais `normalizePostalCode`/`formatPostalCode`; stores usam as chaves e versões exportadas.
- Gates: cada task contém elegibilidade, BASE, explorer, implementer, diff-check, reviewer, fix loop, DONE/evidência, RED/GREEN e commits rastreáveis.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-15-fase-8-lote-1-cobertura-deterministica.md`. Execute com `superpowers:subagent-driven-development`, uma task por vez, preservando writers sequenciais e o workflow de `AGENTS.md`.
