# Conta do Cliente — Fase 6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar consulta e edição do perfil, troca de senha e cancelamento seguro da conta nas rotas protegidas da SPA.

**Architecture:** `features/customer` será a fonte canônica do perfil e publicará apenas contratos, query options e projeções necessárias ao checkout. TanStack Query mantém o estado confirmado do servidor; React Hook Form mantém valores em edição; Zustand permanece limitado à sessão e ao vínculo versionado do carrinho. Cada task segue, no mesmo checkout e sem escritores simultâneos, o ciclo explorador → implementador TDD → reviewer, repetindo correção e revisão para findings CRITICAL ou IMPORTANT.

**Tech Stack:** React 19, TypeScript 5.7, Vite 6, React Router 7, TanStack Query 5, React Hook Form 7, Zod 4, Zustand 5, Tailwind CSS v4, Vitest, Testing Library, MSW e Playwright.

## Global Constraints

- `openapi.yaml` é a autoridade para método, rota, autenticação, payload e envelope.
- Implementar somente frontend em `/frontend`; nenhuma mudança de backend integra estas tasks.
- Perfil confirmado fica apenas no TanStack Query; não copiar respostas completas para Zustand, `localStorage` ou `sessionStorage`.
- A chave canônica é `['private', 'customer', 'detail', customerId]` e toda query/mutation protegida usa `meta.private: true`.
- IDs externos aceitam `number | string`, mas o modelo exige inteiro positivo; token, CPF e senha nunca entram em query keys ou logs.
- Requests de perfil e senha são estritos; mutations usam `retry: false`, sem atualização otimista, e capturam `customerId`, token e payload por tentativa.
- Respostas tardias só produzem efeitos se a sessão corrente ainda representa o cliente capturado.
- Rotas `/minha-conta/dados` e `/minha-conta/senha` usam `React.lazy` + `Suspense` e chunks separados do entry bundle.
- UI atende WCAG 2.2 AA entre 320 px e 1920 px, com labels visíveis, foco amber, teclado, regiões vivas e alvos mínimos de 40 × 40 px; CTA primário mobile tem pelo menos 44 px.
- Animações são curtas e desativadas por `prefers-reduced-motion`; cor não é o único indicador.
- Cada task começa em RED, termina com teste focado, `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` e revisão sem findings CRITICAL ou IMPORTANT.
- Antes de cada task, registrar `BASE_COMMIT=$(git rev-parse HEAD)`; depois gerar `git diff --stat $BASE_COMMIT..HEAD` e `git diff $BASE_COMMIT..HEAD` para o reviewer.
- O implementador usa commit próprio `feat(TASK-ID): descrição`, `fix(TASK-ID): descrição` ou `test(TASK-ID): descrição`; somente o agente implementador escreve código durante o ciclo.

## File and Interface Map

- `frontend/src/features/customer/contracts/customerProfile.ts`: schemas de transporte, `CustomerProfile`, `CustomerProfileFormValues`, `UpdateCustomerRequest`, adapters de detalhe/update/resposta ID e projeção de checkout.
- `frontend/src/features/customer/contracts/customerPassword.ts`: `CustomerPasswordRequest`, regras e adapter estrito de senha.
- `frontend/src/features/customer/services/customerProfileService.ts`: GET e PUT do perfil.
- `frontend/src/features/customer/services/customerPasswordService.ts`: PUT de senha.
- `frontend/src/features/customer/services/deleteCustomerService.ts`: DELETE da conta.
- `frontend/src/features/customer/queries/useCustomerProfileQuery.ts`: `customerProfileQueryKeys`, `customerProfileQueryOptions` e hook de sessão.
- `frontend/src/features/customer/mutations/useUpdateCustomerMutation.ts`: PUT, field errors e reconciliação exata.
- `frontend/src/features/customer/mutations/useUpdateCustomerPasswordMutation.ts`: PUT de senha com guarda de sessão.
- `frontend/src/features/customer/mutations/useDeleteCustomerMutation.ts`: DELETE e efeitos atômicos ordenados.
- `frontend/src/features/customer/components/CustomerProfileForm.tsx`: formulário completo e snapshot sujo.
- `frontend/src/features/customer/components/CpfChangeDialog.tsx`: confirmação do CPF.
- `frontend/src/features/customer/components/PasswordRules.tsx`: quatro regras semânticas.
- `frontend/src/features/customer/components/DeleteAccountDangerZone.tsx`: área de perigo e dialog.
- `frontend/src/features/customer/pages/CustomerDataPage.tsx` e `CustomerPasswordPage.tsx`: coordenação de query/mutations.
- `frontend/src/features/customer/cache/customerPrivateSnapshots.ts`: registro transitório removível, sem persistência.
- `frontend/src/app/router/AppRouter.tsx`: dois imports lazy e fallback estável de conta.
- `frontend/src/features/checkout/contracts/customerProfile.ts`: removido; checkout passa a importar a projeção canônica.
- `frontend/src/features/checkout/services/getCheckoutProfileService.ts` e `queries/useCheckoutProfileQuery.ts`: removidos após migração para a query canônica.
- Todo arquivo de produção acima possui teste colocalizado `*.test.ts` ou `*.test.tsx`; integração de rota permanece em `frontend/src/app/router/AppRouter.lazy.test.tsx`.

---

### TASK-086: Contratos canônicos e migração do checkout

**Files:**
- Create: `frontend/src/features/customer/contracts/customerProfile.ts`
- Create: `frontend/src/features/customer/contracts/customerProfile.test.ts`
- Modify: `frontend/src/features/checkout/services/getCheckoutProfileService.ts`
- Modify: `frontend/src/features/checkout/services/getCheckoutProfileService.test.ts`
- Delete: `frontend/src/features/checkout/contracts/customerProfile.ts`
- Delete: `frontend/src/features/checkout/contracts/customerProfile.test.ts`

**Interfaces:**
- Consumes: `normalizeId(value: number | string): number`, `createApiResponseSchema<T>(dataSchema: T)` e formatadores de `shared`.
- Produces: `CustomerProfile`, `CustomerProfileFormValues`, `UpdateCustomerRequest`, `adaptCustomerProfileResponse(response: unknown): CustomerProfile`, `adaptUpdateCustomerRequest(values: CustomerProfileFormValues): UpdateCustomerRequest`, `adaptCustomerIdResponse(response: unknown, expectedCustomerId: number): { customerId: number }` e `toCheckoutProfile(profile: CustomerProfile): { customerId: number; address: DeliveryAddress }`.

- [ ] **Step 1: escrever testes RED do detalhe, update e resposta por ID**

```ts
expect(adaptCustomerProfileResponse(okEnvelope({ clienteId: '7', cpf: '12345678901' }))).toMatchObject({ customerId: 7, cpf: '12345678901' })
expect(() => adaptCustomerProfileResponse({ status: true, message: '', data: null })).toThrow()
expect(() => adaptCustomerIdResponse(okEnvelope({ clienteId: '8' }), 7)).toThrow()
expect(adaptUpdateCustomerRequest(formValues)).toEqual({ cpf: '12345678901', nome: 'Ana', dataNascimento: '1990-01-02', email: 'ana@example.com', endereco: { logradouro: 'Rua A', numero: '10', complemento: null, cep: '12345-678', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' }, celular: { ddd: '11', numero: '999999999', whatsApp: true } })
```

Run: `cd frontend; npm test -- src/features/customer/contracts/customerProfile.test.ts`
Expected: FAIL porque o módulo canônico não existe.

- [ ] **Step 2: implementar schemas e tipos estritos**

```ts
export type CustomerProfile = { customerId: number; cpf: string; nome: string; dataNascimento: string; email: string; endereco: { logradouro: string; numero: string; complemento: string | null; cep: string; bairro: string; cidade: string; uf: string }; celular: { ddd: string; numero: string; whatsApp: boolean } }
export type CustomerProfileFormValues = Omit<CustomerProfile, 'customerId' | 'endereco' | 'celular'> & { logradouro: string; numero: string; complemento: string; cep: string; bairro: string; cidade: string; uf: string; ddd: string; celularNumero: string; whatsApp: boolean }
export type UpdateCustomerRequest = Omit<CustomerProfile, 'customerId'>
```

Use `z.object(...).strict()`, `z.iso.date()` refinado contra hoje, CPF `^\d{11}$`, DDD `^\d{2}$`, limites aprovados e ID positivo. `adaptUpdateCustomerRequest` usa `normalizeCpf`, `trim`, UF maiúscula e complemento vazio `null`; não inclui `customerId`.

- [ ] **Step 3: migrar a projeção do checkout e eliminar contrato duplicado**

```ts
export function toCheckoutProfile(profile: CustomerProfile): CheckoutProfile {
  return { customerId: profile.customerId, address: deliveryAddressSchema.parse(profile.endereco) }
}
```

Atualize `getCheckoutProfileService.ts` para executar `toCheckoutProfile(adaptCustomerProfileResponse(response))`; remova o schema/adaptor antigo, sem adicionar PUT ao fluxo de pedido. A query e a página existentes continuam compiláveis até a migração integral da TASK-087.

- [ ] **Step 4: verificar GREEN e regressão**

Run: `cd frontend; npm test -- src/features/customer/contracts/customerProfile.test.ts src/features/checkout/services/getCheckoutProfileService.test.ts`
Expected: PASS com IDs inválidos/divergentes, data futura, limites, extras, normalização e projeção cobertos.

- [ ] **Step 5: gates, revisão e commit**

Run: `cd frontend; npm run typecheck; npm run lint; npm test; npm run build`
Expected: todos com exit code 0.

```bash
git add frontend/src/features/customer/contracts frontend/src/features/checkout
git commit -m "feat(TASK-086): Canonicalizar contrato de cliente"
```

### TASK-087: Serviço e query privada do perfil

**Files:**
- Create: `frontend/src/features/customer/services/customerProfileService.ts`
- Create: `frontend/src/features/customer/services/customerProfileService.test.ts`
- Create: `frontend/src/features/customer/queries/useCustomerProfileQuery.ts`
- Create: `frontend/src/features/customer/queries/useCustomerProfileQuery.test.tsx`
- Modify: `frontend/src/features/checkout/pages/CheckoutPage.tsx`
- Delete: `frontend/src/features/checkout/services/getCheckoutProfileService.ts`
- Delete: `frontend/src/features/checkout/services/getCheckoutProfileService.test.ts`
- Delete: `frontend/src/features/checkout/queries/useCheckoutProfileQuery.ts`
- Delete: `frontend/src/features/checkout/queries/useCheckoutProfileQuery.test.tsx`

**Interfaces:**
- Consumes: adapters da TASK-086 e `privateCacheMeta`.
- Produces: `getCustomerProfile(customerId: number, token: string, signal?: AbortSignal): Promise<CustomerProfile>`, `customerProfileQueryKeys.detail(customerId: number | null)`, `customerProfileQueryOptions(customerId?: number, token?: string, enabled?: boolean)` e `useCustomerProfileQuery(enabled?: boolean)`.

- [ ] **Step 1: escrever testes RED de transporte e query options**

```ts
expect(client.request).toHaveBeenCalledWith('/api/v1/cliente/7', { token: 'token', signal })
expect(customerProfileQueryKeys.detail(7)).toEqual(['private', 'customer', 'detail', 7])
expect(customerProfileQueryOptions(undefined, 'token').enabled).toBe(false)
expect(customerProfileQueryOptions(7, 'token').meta).toEqual({ private: true })
```

Run: `cd frontend; npm test -- src/features/customer/services/customerProfileService.test.ts src/features/customer/queries/useCustomerProfileQuery.test.tsx`
Expected: FAIL por módulos ausentes.

- [ ] **Step 2: implementar GET com AbortSignal e mapContractError**

```ts
export async function getCustomerProfile(customerId: number, token: string, signal?: AbortSignal, client = apiClient): Promise<CustomerProfile> {
  const response = await client.request<unknown>(`/api/v1/cliente/${customerId}`, { token, signal })
  try { return adaptCustomerProfileResponse(response) } catch (error) { throw mapContractError(error) }
}
```

- [ ] **Step 3: implementar options canônicas e migrar checkout**

```ts
export const customerProfileQueryKeys = { detail: (id: number | null) => ['private', 'customer', 'detail', id] as const }
```

`queryFn` usa os argumentos capturados, passa `signal`, `enabled` requer ID inteiro positivo/token não vazio e `meta: privateCacheMeta`. Checkout chama `useCustomerProfileQuery()` e `toCheckoutProfile(data)`.

- [ ] **Step 4: testar troca de sessão e resposta tardia**

Renderize com cliente 7, troque store para cliente 8 antes de resolver a primeira promise e confirme que apenas a chave 7 recebe a resposta antiga e a UI mostra cliente 8.

Run: `cd frontend; npm test -- src/features/customer/services/customerProfileService.test.ts src/features/customer/queries/useCustomerProfileQuery.test.tsx src/features/checkout/pages/CheckoutPage.test.tsx`
Expected: PASS, uma única GET canônica e nenhum token na chave.

- [ ] **Step 5: gates e commit**

Run: `cd frontend; npm run typecheck; npm run lint; npm test; npm run build`
Expected: exit code 0.

```bash
git add frontend/src/features/customer frontend/src/features/checkout
git commit -m "feat(TASK-087): Consultar perfil pela sessão"
```

### TASK-088: Página e formulário Meus Dados

**Files:**
- Create: `frontend/src/features/customer/components/CustomerProfileForm.tsx`
- Create: `frontend/src/features/customer/components/CustomerProfileForm.test.tsx`
- Create: `frontend/src/features/customer/pages/CustomerDataPage.tsx`
- Create: `frontend/src/features/customer/pages/CustomerDataPage.test.tsx`
- Modify: `frontend/src/app/router/AppRouter.tsx`
- Modify: `frontend/src/app/router/AppRouter.lazy.test.tsx`

**Interfaces:**
- Consumes: `CustomerProfile`, `CustomerProfileFormValues`, `adaptUpdateCustomerRequest` e `useCustomerProfileQuery`.
- Produces: `CustomerProfileForm({ profile, onValidRequest })` e `CustomerDataPage` lazy.

- [ ] **Step 1: escrever testes RED dos estados e campos completos**

```tsx
expect(screen.getByRole('status', { name: /carregando dados/i })).toBeInTheDocument()
expect(await screen.findByLabelText('CPF')).toHaveValue('123.456.789-01')
expect(screen.getByLabelText('Logradouro')).toBeInTheDocument()
expect(screen.getByLabelText('Número do celular')).toBeInTheDocument()
```

Cubra erro + botão “Tentar novamente”, todos os campos, máscara, validação anterior à rede, refetch que não substitui campo dirty e layout sem classes de largura rígida.

Run: `cd frontend; npm test -- src/features/customer/components/CustomerProfileForm.test.tsx src/features/customer/pages/CustomerDataPage.test.tsx src/app/router/AppRouter.lazy.test.tsx`
Expected: FAIL porque página/componentes não existem.

- [ ] **Step 2: implementar formulário local acessível**

Use `useForm<CustomerProfileFormValues>({ defaultValues: toFormValues(profile) })`, `reset(next, { keepDirtyValues: true })` no novo snapshot, `Input`, `Checkbox` e `FormErrorSummary`. Cada erro recebe ID `customer-data-<campo>`; se houver múltiplos erros, mova foco ao summary. Submit chama `adaptUpdateCustomerRequest(values)` antes de `onValidRequest`.

- [ ] **Step 3: implementar página com estados de query**

```tsx
if (query.isPending) return <div role="status" aria-label="Carregando dados" className="min-h-96"><Skeleton /></div>
if (query.isError) return <ErrorState title="Não foi possível carregar seus dados" actionLabel="Tentar novamente" onAction={() => void query.refetch()} />
return <CustomerProfileForm profile={query.data} onValidRequest={handleRequest} />
```

- [ ] **Step 4: trocar placeholder por lazy route**

```tsx
const CustomerDataPage = lazy(() => import('../../features/customer/pages/CustomerDataPage').then(({ CustomerDataPage: Page }) => ({ default: Page })))
```

Envolva em `Suspense` com fallback semântico de `min-h-96`; confirme build com chunk `CustomerDataPage-*.js` fora do entry.

- [ ] **Step 5: verificar e commit**

Run: `cd frontend; npm test -- src/features/customer/components/CustomerProfileForm.test.tsx src/features/customer/pages/CustomerDataPage.test.tsx src/app/router/AppRouter.lazy.test.tsx; npm run typecheck; npm run lint; npm test; npm run build`
Expected: PASS e chunk separado listado em `dist/assets`.

```bash
git add frontend/src/features/customer frontend/src/app/router
git commit -m "feat(TASK-088): Criar formulário de dados do cliente"
```

### TASK-089: Confirmação de alteração do CPF

**Files:**
- Create: `frontend/src/features/customer/components/CpfChangeDialog.tsx`
- Create: `frontend/src/features/customer/components/CpfChangeDialog.test.tsx`
- Modify: `frontend/src/features/customer/components/CustomerProfileForm.tsx`
- Modify: `frontend/src/features/customer/components/CustomerProfileForm.test.tsx`

**Interfaces:**
- Consumes: `UpdateCustomerRequest`, `formatCpf` e `Dialog`.
- Produces: `CpfChangeDialog({ open, previousCpf, nextCpf, pending, onCancel, onConfirm })`; o form mantém `pendingRequest: UpdateCustomerRequest | null`.

- [ ] **Step 1: escrever testes RED do gate de CPF**

```tsx
await user.clear(screen.getByLabelText('CPF')); await user.type(screen.getByLabelText('CPF'), '98765432100'); await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
expect(screen.getByRole('dialog', { name: /confirmar alteração do cpf/i })).toHaveTextContent('987.654.321-00')
expect(onValidRequest).not.toHaveBeenCalled()
```

Cubra alteração não-CPF sem dialog, Escape/cancel sem submit e foco restaurado ao botão.

Run: `cd frontend; npm test -- src/features/customer/components/CpfChangeDialog.test.tsx src/features/customer/components/CustomerProfileForm.test.tsx`
Expected: FAIL por dialog ausente.

- [ ] **Step 2: implementar dialog com ação segura inicial**

Use `Dialog` com título/descrição, `initialFocusRef` no botão “Voltar”, CPFs mascarados e botões desabilitados quando `pending`.

- [ ] **Step 3: interceptar somente CPF normalizado diferente**

```ts
if (request.cpf !== profile.cpf) { setPendingRequest(request); return }
await onValidRequest(request)
```

Confirmar envia `pendingRequest` sem remontá-lo; cancelar zera o snapshot pendente.

- [ ] **Step 4: verificar e commit**

Run: `cd frontend; npm test -- src/features/customer/components/CpfChangeDialog.test.tsx src/features/customer/components/CustomerProfileForm.test.tsx; npm run typecheck; npm run lint; npm test; npm run build`
Expected: PASS.

```bash
git add frontend/src/features/customer/components
git commit -m "feat(TASK-089): Confirmar alteração de CPF"
```

### TASK-090: PUT do perfil e erros de formulário

**Files:**
- Modify: `frontend/src/features/customer/services/customerProfileService.ts`
- Modify: `frontend/src/features/customer/services/customerProfileService.test.ts`
- Create: `frontend/src/features/customer/mutations/useUpdateCustomerMutation.ts`
- Create: `frontend/src/features/customer/mutations/useUpdateCustomerMutation.test.tsx`
- Create: `frontend/src/features/customer/forms/customerFieldErrors.ts`
- Create: `frontend/src/features/customer/forms/customerFieldErrors.test.ts`
- Modify: `frontend/src/features/customer/pages/CustomerDataPage.tsx`

**Interfaces:**
- Consumes: `UpdateCustomerRequest`, `adaptCustomerIdResponse`, `AppError`.
- Produces: `updateCustomer({ customerId, token, request }): Promise<{ customerId: number }>`; `mapCustomerFieldErrors(details): { fieldErrors: Partial<Record<keyof CustomerProfileFormValues,string>>; formErrors: string[] }`; `useUpdateCustomerMutation()`.

- [ ] **Step 1: escrever testes RED de PUT e mapeamento**

```ts
expect(client.request).toHaveBeenCalledWith('/api/v1/cliente/7', { method: 'PUT', token: 'token', body: request })
expect(mapCustomerFieldErrors([{ propertyName: 'Endereco.Logradouro', message: 'Inválido' }]).fieldErrors.logradouro).toBe('Inválido')
expect(mapCustomerFieldErrors([{ propertyName: 'Outro', message: 'Falha' }]).formErrors).toEqual(['Falha'])
```

Run: `cd frontend; npm test -- src/features/customer/services/customerProfileService.test.ts src/features/customer/forms/customerFieldErrors.test.ts src/features/customer/mutations/useUpdateCustomerMutation.test.tsx`
Expected: FAIL pelos exports ausentes.

- [ ] **Step 2: implementar PUT estrito e mutation sem retry**

`updateCustomer` usa body já adaptado e valida o mesmo ID. A variável da mutation é `{ customerId: number; token: string; request: UpdateCustomerRequest }`; `retry: false`, `meta: privateCacheMeta`.

- [ ] **Step 3: mapear notificações sem depender da mensagem para regras**

Mapeie, sem distinção de caixa, `Cpf`, `Nome`, `DataNascimento`, `Email`, `Endereco.Logradouro|Numero|Complemento|Cep|Bairro|Cidade|Uf` e `Celular.Ddd|Numero|WhatsApp`; desconhecidos ficam no resumo. `409`, `404`, `403`, rede e servidor exibem `AppError.message` e preservam form.

- [ ] **Step 4: integrar pending e erros à página**

Capture `useAuthStore.getState().session` no submit, recuse sessão ausente, chame `mutateAsync`, desabilite submit/dialog durante pending e aplique `setError` para 422. O handler global continua responsável por 401.

- [ ] **Step 5: verificar e commit**

Run: `cd frontend; npm test -- src/features/customer/services/customerProfileService.test.ts src/features/customer/forms/customerFieldErrors.test.ts src/features/customer/mutations/useUpdateCustomerMutation.test.tsx src/features/customer/pages/CustomerDataPage.test.tsx; npm run typecheck; npm run lint; npm test; npm run build`
Expected: PASS com 409/422/401/403/404/5xx/rede e duplicidade cobertos.

```bash
git add frontend/src/features/customer
git commit -m "feat(TASK-090): Atualizar perfil completo"
```

### TASK-091: Reconciliação do cache e snapshot

**Files:**
- Modify: `frontend/src/features/customer/mutations/useUpdateCustomerMutation.ts`
- Modify: `frontend/src/features/customer/mutations/useUpdateCustomerMutation.test.tsx`
- Modify: `frontend/src/features/customer/pages/CustomerDataPage.tsx`
- Modify: `frontend/src/features/customer/pages/CustomerDataPage.test.tsx`
- Modify: `frontend/src/features/checkout/pages/CheckoutPage.test.tsx`

**Interfaces:**
- Consumes: `customerProfileQueryKeys.detail(customerId)` e `CustomerProfile`.
- Produces: mutation retorna `CustomerProfile` reconciliado e `onProfileConfirmed(profile)` redefine snapshot do form.

- [ ] **Step 1: escrever testes RED da chave exata e sessão tardia**

```ts
expect(queryClient.getQueryData(customerProfileQueryKeys.detail(7))).toEqual({ customerId: 7, ...request })
expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: customerProfileQueryKeys.detail(7), exact: true })
```

Cubra troca para cliente 8 antes do sucesso: nenhum `setQueryData`, invalidate ou confirmação visual; checkout observa o perfil atualizado da chave 7 sem nova chave.

Run: `cd frontend; npm test -- src/features/customer/mutations/useUpdateCustomerMutation.test.tsx src/features/customer/pages/CustomerDataPage.test.tsx src/features/checkout/pages/CheckoutPage.test.tsx`
Expected: FAIL porque a mutation ainda não reconcilia.

- [ ] **Step 2: implementar guarda e cache confirmado**

```ts
const current = useAuthStore.getState().session
if (current?.clienteId !== variables.customerId || current.token !== variables.token) return
const profile = { customerId: variables.customerId, ...variables.request }
queryClient.setQueryData(customerProfileQueryKeys.detail(variables.customerId), profile)
await queryClient.invalidateQueries({ queryKey: customerProfileQueryKeys.detail(variables.customerId), exact: true })
```

- [ ] **Step 3: redefinir snapshot sem apagar edição concorrente**

Após sucesso correspondente, passe `profile` ao form; `reset(toFormValues(profile), { keepDirtyValues: true })` e mantenha o novo CPF como referência confirmada. Não use `onMutate` otimista.

- [ ] **Step 4: verificar e commit**

Run: `cd frontend; npm test -- src/features/customer/mutations/useUpdateCustomerMutation.test.tsx src/features/customer/pages/CustomerDataPage.test.tsx src/features/checkout/pages/CheckoutPage.test.tsx; npm run typecheck; npm run lint; npm test; npm run build`
Expected: PASS.

```bash
git add frontend/src/features/customer frontend/src/features/checkout
git commit -m "feat(TASK-091): Reconciliar cache do perfil"
```

### TASK-092: Schema e indicador das regras de senha

**Files:**
- Create: `frontend/src/features/customer/contracts/customerPassword.ts`
- Create: `frontend/src/features/customer/contracts/customerPassword.test.ts`
- Create: `frontend/src/features/customer/components/PasswordRules.tsx`
- Create: `frontend/src/features/customer/components/PasswordRules.test.tsx`

**Interfaces:**
- Consumes: `adaptCustomerIdResponse` da TASK-086.
- Produces: `CustomerPasswordRequest`, `passwordRuleResults(value: string): { minLength: boolean; uppercase: boolean; number: boolean; special: boolean }`, `adaptCustomerPasswordRequest(unknown)` e `PasswordRules({ value })`.

- [ ] **Step 1: escrever matriz RED de senha**

```ts
expect(passwordRuleResults('Abcdef1!')).toEqual({ minLength: true, uppercase: true, number: true, special: true })
expect(() => adaptCustomerPasswordRequest({ senhaAtual: 'Atual1!', senhaNova: 'abcdef1!' })).toThrow()
expect(() => adaptCustomerPasswordRequest({ senhaAtual: 'Atual1!', senhaNova: 'Abcdef1!', extra: true })).toThrow()
```

Teste cada regra ausente, senha atual vazia e preservação literal de espaços.

Run: `cd frontend; npm test -- src/features/customer/contracts/customerPassword.test.ts src/features/customer/components/PasswordRules.test.tsx`
Expected: FAIL por módulos ausentes.

- [ ] **Step 2: implementar schema e avaliador único**

```ts
export const passwordRuleResults = (value: string) => ({ minLength: value.length >= 8, uppercase: /[A-Z]/.test(value), number: /\d/.test(value), special: /[!@#$%]/.test(value) })
```

Schema `.strict()` exige `senhaAtual.min(1)` e refina `senhaNova` com as quatro propriedades; não use `.trim()`.

- [ ] **Step 3: implementar lista persistente sem depender de cor**

Renderize `<ul aria-label="Regras da nova senha">` com quatro `<li>` contendo “Atendida”/“Pendente” em texto visualmente disponível e ícone `aria-hidden`; derive todos do avaliador único.

- [ ] **Step 4: verificar e commit**

Run: `cd frontend; npm test -- src/features/customer/contracts/customerPassword.test.ts src/features/customer/components/PasswordRules.test.tsx; npm run typecheck; npm run lint; npm test; npm run build`
Expected: PASS.

```bash
git add frontend/src/features/customer/contracts/customerPassword* frontend/src/features/customer/components/PasswordRules*
git commit -m "feat(TASK-092): Validar regras de nova senha"
```

### TASK-093: Página e mutation de troca de senha

**Files:**
- Create: `frontend/src/features/customer/services/customerPasswordService.ts`
- Create: `frontend/src/features/customer/services/customerPasswordService.test.ts`
- Create: `frontend/src/features/customer/mutations/useUpdateCustomerPasswordMutation.ts`
- Create: `frontend/src/features/customer/mutations/useUpdateCustomerPasswordMutation.test.tsx`
- Create: `frontend/src/features/customer/pages/CustomerPasswordPage.tsx`
- Create: `frontend/src/features/customer/pages/CustomerPasswordPage.test.tsx`
- Modify: `frontend/src/app/router/AppRouter.tsx`
- Modify: `frontend/src/app/router/AppRouter.lazy.test.tsx`

**Interfaces:**
- Consumes: `CustomerPasswordRequest`, `adaptCustomerIdResponse`, `AppError` e sessão.
- Produces: `updateCustomerPassword({ customerId, token, request }): Promise<{ customerId: number }>` e `useUpdateCustomerPasswordMutation()`.

- [ ] **Step 1: escrever testes RED do serviço, mutation e página**

```ts
expect(client.request).toHaveBeenCalledWith('/api/v1/cliente/7/senha', { method: 'PUT', token: 'token', body: { senhaAtual: 'Atual1!', senhaNova: 'Nova123!' } })
expect(screen.getByLabelText('Senha atual')).toHaveAttribute('autocomplete', 'current-password')
expect(screen.getByLabelText('Nova senha')).toHaveAttribute('autocomplete', 'new-password')
```

Cubra ID divergente, 422 por campo, sucesso limpa ambos, foco na confirmação, região viva, pending e resposta tardia ignorada.

Run: `cd frontend; npm test -- src/features/customer/services/customerPasswordService.test.ts src/features/customer/mutations/useUpdateCustomerPasswordMutation.test.tsx src/features/customer/pages/CustomerPasswordPage.test.tsx src/app/router/AppRouter.lazy.test.tsx`
Expected: FAIL por módulos ausentes.

- [ ] **Step 2: implementar serviço/mutation protegidos**

Serviço faz PUT e valida ID; mutation recebe `{ customerId, token, request }`, `retry: false`, `meta: privateCacheMeta`. Callback só confirma se `clienteId` e token atuais coincidirem. A página mapeia notificações `SenhaAtual` e `SenhaNova` diretamente aos dois campos; qualquer propriedade desconhecida permanece no resumo geral.

- [ ] **Step 3: implementar formulário e feedback acessível**

Use React Hook Form, `PasswordRules` observado via `watch('senhaNova')`, `aria-describedby`, summary e botão `min-h-11`. Em sucesso: `reset({ senhaAtual: '', senhaNova: '' })`, atualize texto neutro em `role="status" aria-live="polite"` e foque elemento `tabIndex={-1}`. Em falha, limpe `senhaNova` e mantenha erros disponíveis.

- [ ] **Step 4: adicionar lazy route independente**

```tsx
const CustomerPasswordPage = lazy(() => import('../../features/customer/pages/CustomerPasswordPage').then(({ CustomerPasswordPage: Page }) => ({ default: Page })))
```

Teste que o módulo não carrega antes da rota e que build lista `CustomerPasswordPage-*.js` separado de `CustomerDataPage-*.js` e entry.

- [ ] **Step 5: verificar e commit**

Run: `cd frontend; npm test -- src/features/customer/services/customerPasswordService.test.ts src/features/customer/mutations/useUpdateCustomerPasswordMutation.test.tsx src/features/customer/pages/CustomerPasswordPage.test.tsx src/app/router/AppRouter.lazy.test.tsx; npm run typecheck; npm run lint; npm test; npm run build`
Expected: PASS e dois chunks de conta separados.

```bash
git add frontend/src/features/customer frontend/src/app/router
git commit -m "feat(TASK-093): Permitir troca de senha"
```

### TASK-094: Área de perigo e dialog de cancelamento

**Files:**
- Create: `frontend/src/features/customer/components/DeleteAccountDangerZone.tsx`
- Create: `frontend/src/features/customer/components/DeleteAccountDangerZone.test.tsx`
- Modify: `frontend/src/features/customer/pages/CustomerDataPage.tsx`
- Modify: `frontend/src/features/customer/pages/CustomerDataPage.test.tsx`

**Interfaces:**
- Consumes: `Dialog`, `Checkbox`, `Button`.
- Produces: `DeleteAccountDangerZone({ pending, error, onConfirm }): JSX.Element`.

- [ ] **Step 1: escrever testes RED de confirmação explícita**

```tsx
await user.click(screen.getByRole('button', { name: 'Cancelar minha conta' }))
expect(screen.getByRole('dialog', { name: 'Cancelar conta' })).toHaveTextContent(/perder acesso/i)
expect(screen.getByRole('button', { name: 'Confirmar cancelamento' })).toBeDisabled()
```

Cubra checkbox habilitando ação, clique único sem efeito, foco inicial em “Voltar”, Escape, trap/retorno de foco, pending sem segundo envio e erro com retry.

Run: `cd frontend; npm test -- src/features/customer/components/DeleteAccountDangerZone.test.tsx src/features/customer/pages/CustomerDataPage.test.tsx`
Expected: FAIL por componente ausente.

- [ ] **Step 2: implementar área visualmente distinta**

Use section com heading “Cancelar conta”, borda/ícone/texto além de vermelho, consequências explícitas e CTA com alvo mínimo. Não inclua CPF/endereço na cópia.

- [ ] **Step 3: implementar dialog seguro**

Estado local `open`/`confirmed`; ao abrir, `confirmed=false`. `initialFocusRef` aponta “Voltar”; confirmação só chama `onConfirm` quando marcada. Durante `pending`, desabilite checkbox/botões, ignore Escape/close e use `aria-busy`.

- [ ] **Step 4: verificar e commit**

Run: `cd frontend; npm test -- src/features/customer/components/DeleteAccountDangerZone.test.tsx src/features/customer/pages/CustomerDataPage.test.tsx; npm run typecheck; npm run lint; npm test; npm run build`
Expected: PASS.

```bash
git add frontend/src/features/customer
git commit -m "feat(TASK-094): Confirmar cancelamento da conta"
```

### TASK-095: DELETE e limpeza integral

**Files:**
- Create: `frontend/src/features/customer/cache/customerPrivateSnapshots.ts`
- Create: `frontend/src/features/customer/cache/customerPrivateSnapshots.test.ts`
- Create: `frontend/src/features/customer/services/deleteCustomerService.ts`
- Create: `frontend/src/features/customer/services/deleteCustomerService.test.ts`
- Create: `frontend/src/features/customer/mutations/useDeleteCustomerMutation.ts`
- Create: `frontend/src/features/customer/mutations/useDeleteCustomerMutation.test.tsx`
- Modify: `frontend/src/features/customer/components/CustomerProfileForm.tsx`
- Modify: `frontend/src/features/customer/components/CustomerProfileForm.test.tsx`
- Modify: `frontend/src/features/customer/pages/CustomerDataPage.tsx`
- Modify: `frontend/src/features/customer/pages/CustomerDataPage.test.tsx`
- Modify: `frontend/src/features/auth/store/authStore.test.ts`
- Modify: `frontend/src/features/cart/store/cartSessionStore.test.ts`

**Interfaces:**
- Consumes: `adaptCustomerIdResponse`, `useCartSessionStore.getState().removeCartId`, `useAuthStore.getState().clearSession`, `clearPrivateCache(queryClient)` e `navigate`.
- Produces: `deleteCustomer(customerId, token): Promise<{ customerId: number }>`; `clearCustomerPrivateSnapshots(customerId: number): void`; `useDeleteCustomerMutation()`.

- [ ] **Step 1: escrever testes RED do DELETE e atomicidade**

```ts
expect(client.request).toHaveBeenCalledWith('/api/v1/cliente/7', { method: 'DELETE', token: 'token' })
expect(order).toEqual(['remove-cart:7', 'clear-auth', 'clear-private-cache', 'clear-snapshots:7', 'navigate:/'])
expect(useCartSessionStore.getState().getCartId(8)).toBe(88)
```

Cubra envelope nulo/falso/ID divergente, falha 401/404/422/rede sem limpeza parcial, retry manual, duplicidade e sucesso tardio após troca de sessão sem efeitos.

Run: `cd frontend; npm test -- src/features/customer/services/deleteCustomerService.test.ts src/features/customer/cache/customerPrivateSnapshots.test.ts src/features/customer/mutations/useDeleteCustomerMutation.test.tsx`
Expected: FAIL por módulos ausentes.

- [ ] **Step 2: implementar DELETE sem body e snapshots transitórios**

`deleteCustomer` envia somente method/token, adapta mesmo ID e mapeia contrato. O cache transitório é `Map<number, Set<() => void>>` em memória, expõe `registerCustomerPrivateSnapshot(customerId: number, clear: () => void): () => void` e `clearCustomerPrivateSnapshots(customerId: number): void`; nunca persiste payload. `CustomerProfileForm` registra uma função que descarta `pendingRequest` e o estado do dialog, removendo o registro no unmount.

- [ ] **Step 3: implementar mutation e sequência guardada**

```ts
const current = useAuthStore.getState().session
if (current?.clienteId !== variables.customerId || current.token !== variables.token) return
useCartSessionStore.getState().removeCartId(variables.customerId)
useAuthStore.getState().clearSession()
clearPrivateCache(queryClient)
clearCustomerPrivateSnapshots(variables.customerId)
navigate('/', { replace: true, state: { accountCancelled: true } })
```

Use `retry: false`, `meta: privateCacheMeta`; nenhum efeito em `onMutate`/`onError`. A rota pública mostra confirmação neutra “Conta cancelada com sucesso.” sem dados pessoais.

- [ ] **Step 4: integrar dialog e testar persistências reais**

No teste com `localStorage`/`sessionStorage`, mantenha vínculos 7 e 8, cancele 7 e confirme ausência apenas de 7, chave auth removida dos dois storages, queries/mutations privadas removidas e públicas preservadas. Falha mantém tudo e dialog aberto com ação “Tentar novamente”.

- [ ] **Step 5: executar testes de jornada e gates finais**

Run: `cd frontend; npm test -- src/features/customer/services/deleteCustomerService.test.ts src/features/customer/cache/customerPrivateSnapshots.test.ts src/features/customer/mutations/useDeleteCustomerMutation.test.tsx src/features/customer/pages/CustomerDataPage.test.tsx src/features/auth/store/authStore.test.ts src/features/cart/store/cartSessionStore.test.ts`
Expected: PASS.

Run: `cd frontend; npm run typecheck; npm run lint; npm test; npm run build; npm run test:e2e -- --list`
Expected: exit code 0; build mantém chunks separados e Playwright lista a suíte.

- [ ] **Step 6: revisão final da fase e commit**

Gere diff desde o BASE_COMMIT da TASK-095, delegue ao reviewer, corrija todo finding CRITICAL/IMPORTANT com novo `fix(TASK-095): ...`, repita testes e revisão. Só então atualize TASK-095 para DONE com evidências.

```bash
git add frontend/src/features/customer frontend/src/features/auth/store/authStore.test.ts frontend/src/features/cart/store/cartSessionStore.test.ts
git commit -m "feat(TASK-095): Cancelar conta com limpeza privada"
```

## Phase Completion Audit

- [ ] Confirmar RF-090 a RF-097 e RNF-001 a RNF-007, RNF-010, RNF-013, RNF-014, RNF-016 e RNF-018 com evidência de teste.
- [ ] Confirmar que GET/PUT/PUT senha/DELETE correspondem ao OpenAPI e que não há consulta de perfil por CPF.
- [ ] Confirmar `rg "checkoutProfileResponseSchema|useCheckoutProfileQuery|getCheckoutProfile" frontend/src` sem implementação duplicada.
- [ ] Confirmar `rg "localStorage|sessionStorage" frontend/src/features/customer` encontra somente testes de limpeza, nunca persistência de perfil/senha.
- [ ] Confirmar `npm run build` lista `CustomerDataPage-*.js` e `CustomerPasswordPage-*.js` fora do entry.
- [ ] Confirmar auditoria por teclado e viewports 320, 768, 1280 e 1920 px sem scroll horizontal.
- [ ] Registrar em cada item do backlog commits, RED/GREEN, gates e aprovação do reviewer antes de mudar `Status: DONE`.
