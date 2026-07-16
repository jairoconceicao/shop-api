# Fase 8 — Lote 1: Cobertura Determinística Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** fechar, com cobertura determinística e evidência rastreável, as lacunas de contratos, formatação, stores e componentes base das `TASK-106` a `TASK-110`.

**Architecture:** as tasks preservam cinco fronteiras: contratos/adapters, funções puras, autenticação, sessão do carrinho e primitives de UI. `TASK-106`, `107`, `108` e `110` usam TDD; `TASK-109` encerra por verificação dos dez testes já inspecionados.

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
- Novo `frontend/src/shared/formatting/currency.ts` e teste: função única de moeda consumida pelos nove arquivos listados na Task 107.
- `frontend/src/features/auth/store/authStore.test.ts`: storage, reidratação, expiração, corrupção e versão.
- `frontend/src/features/cart/store/cartSessionStore.test.ts`: prova integral da sessão do carrinho.
- Testes em `frontend/src/shared/ui/**`: semântica, teclado, foco e estados.
- Evidências em `docs/frontend-quality/task-106-contract-matrix.md`, `task-107-formatting-matrix.md`, `task-109-cart-session-evidence.md` e `task-110-component-matrix.md`.

## Workflow obrigatório por task

- [ ] Confirmar no `docs/frontend-tasks-v2.md` que a task está `READY`, todas as dependências listadas estão `DONE`, critérios existem e não há writer concorrente.
- [ ] Registrar `BASE_COMMIT=$(git rev-parse HEAD)` no relatório do orquestrador e mover a task para execução sem editar backlog.
- [ ] Delegar a um explorador read-only a comparação critério↔teste↔produto; aguardar relatório antes de delegar escrita.
- [ ] Delegar a um único implementador a task e os passos abaixo; aguardar RED, implementação mínima, GREEN e commits.
- [ ] Gerar `git diff --check $BASE_COMMIT..HEAD` e `git diff --stat $BASE_COMMIT..HEAD`, depois entregar `git diff $BASE_COMMIT..HEAD` a um revisor.
- [ ] Finding `CRITICAL` ou `IMPORTANT` volta ao mesmo implementador; testes/gates e revisão são repetidos.
- [ ] Após testes e revisão aprovados, atualizar a task para `DONE`, registrar comandos/contagens/commits no backlog e criar o commit final pendente.

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
- Modify after RED: `frontend/src/shared/contracts/apiEnvelopes.ts`, `frontend/src/features/auth/contracts/login.ts`, `frontend/src/features/catalog/contracts/catalog.ts`, `frontend/src/features/cart/contracts/cart.ts`, `frontend/src/features/checkout/contracts/checkout.ts`, `frontend/src/features/checkout/contracts/order.ts`, `frontend/src/features/customer/contracts/registration.ts`, `frontend/src/features/customer/contracts/customerProfile.ts`, `frontend/src/features/orders/contracts/orders.ts`.

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

Use fixtures literais nos testes de login, catálogo, carrinho e pedidos:

```ts
const loginEnvelope = { status: true, data: { token: 'token', tipo: 'Bearer', expiraEm: '2026-07-16T12:00:00Z', usuarioId: '10', clienteId: 20, email: 'a@b.com' } }
expect(adaptLoginResponse(loginEnvelope)).toMatchObject({ usuarioId: 10, clienteId: 20 })
expect(() => adaptLoginResponse({ ...loginEnvelope, extra: true })).toThrow()
expect(() => adaptLoginResponse({ status: true, data: null })).toThrow()

const productEnvelope = { status: true, data: { produtoId: '1', titulo: 'Mouse', descricao: null, modelo: null, foto: null, preco: '19.90', estoque: 2, categoria: { categoriaId: '3', titulo: 'Periféricos' } } }
expect(adaptProductDetailResponse(productEnvelope)).toMatchObject({ id: 1, price: 19.9, stock: 2, description: null })
expect(() => adaptProductDetailResponse({ ...productEnvelope, data: { ...productEnvelope.data, extra: true } })).toThrow()

const cartEnvelope = { status: true, data: { clienteId: '10', carrinhoId: 100, dataCarrinho: '2026-07-16T12:00:00Z', items: [{ itemId: '1', produtoId: 2, quantidade: '3', valorUnitario: '19.90' }] } }
expect(adaptCartResponse(cartEnvelope)).toMatchObject({ customerId: 10, id: 100, items: [{ id: 1, productId: 2, quantity: 3, unitPrice: 19.9 }] })
expect(() => adaptCartResponse({ ...cartEnvelope, data: { ...cartEnvelope.data, items: [{ ...cartEnvelope.data.items[0], valorUnitario: 'Infinity' }] } })).toThrow()

const address = { logradouro: 'Rua A', numero: '10', complemento: null, bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01001000' }
const orderEnvelope = { status: true, data: { pedidoId: '1', carrinhoId: 2, clienteId: '3', enderecoEntrega: address, dataPedido: '2026-07-16T12:00:00Z', formaPagamento: 'Pix', status: 'Criado', items: [{ itemId: '4', produtoId: 5, quantidade: '2', valorUnitario: '9.50' }] } }
expect(adaptOrderResponse(orderEnvelope)).toMatchObject({ id: 1, cartId: 2, customerId: 3, paymentMethod: 'Pix', status: 'Criado' })
expect(() => adaptOrderResponse({ ...orderEnvelope, data: { ...orderEnvelope.data, status: 'Unknown' } })).toThrow()
```

Adicione estes blocos completos aos demais arquivos nomeados:

```ts
// registration.test.ts
const registration = { senha: 'Senha@123', cpf: '12345678901', nome: 'Ana', dataNascimento: '1990-05-20', email: 'ana@example.com', endereco: { logradouro: 'Rua A', numero: '10', complemento: null, cep: '01001000', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' }, celular: { ddd: '11', numero: '912345678', whatsApp: true } }
expect(adaptCreateCustomerRequest(registration)).toEqual(registration)
expect(adaptCreateCustomerResponse({ status: true, data: { clienteId: '8' } })).toEqual({ clienteId: 8 })
expect(() => adaptCreateCustomerRequest({ ...registration, extra: true })).toThrow()
expect(() => adaptCreateCustomerResponse({ status: true, data: null })).toThrow()
expect(() => adaptCreateCustomerResponse({ status: false, data: { clienteId: 8 } })).toThrow()
expect(() => adaptCreateCustomerResponse({ status: true, data: { clienteId: Number.MAX_SAFE_INTEGER + 1 } })).toThrow()
```

```ts
// customerProfile.test.ts
const profileEnvelope = { status: true, data: { clienteId: '8', cpf: '12345678901', nome: 'Ana', dataNascimento: '1990-05-20', email: 'ana@example.com', endereco: { logradouro: 'Rua A', numero: '10', complemento: null, cep: '01001000', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' }, celular: { ddd: '11', numero: '912345678', whatsApp: true } } }
expect(adaptCustomerProfileResponse(profileEnvelope)).toMatchObject({ customerId: 8, cpf: '12345678901' })
expect(() => adaptCustomerProfileResponse({ ...profileEnvelope, extra: true })).toThrow()
expect(() => adaptCustomerProfileResponse({ status: true, data: null })).toThrow()
expect(() => adaptCustomerProfileResponse({ ...profileEnvelope, data: { ...profileEnvelope.data, clienteId: '9007199254740992' } })).toThrow()
const profileForm = { cpf: '123.456.789-01', nome: 'Ana', dataNascimento: '1990-05-20', email: 'ana@example.com', logradouro: 'Rua A', numero: '10', complemento: '', cep: '01001000', bairro: 'Centro', cidade: 'São Paulo', uf: 'sp', ddd: '11', celularNumero: '912345678', whatsApp: true }
expect(adaptUpdateCustomerRequest(profileForm)).toMatchObject({ cpf: '12345678901', endereco: { complemento: null, uf: 'SP' } })
```

```ts
// checkout.test.ts
const delivery = { logradouro: 'Rua A', numero: '10', complemento: null, cep: '01001000', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' }
expect(checkoutFormSchema.parse({ enderecoEntrega: delivery, formaPagamento: 'Pix' })).toEqual({ enderecoEntrega: delivery, formaPagamento: 'Pix' })
expect(paymentMethodSchema.options).toEqual(['Pix', 'Cartao', 'Boleto'])
expect(() => checkoutFormSchema.parse({ enderecoEntrega: delivery, formaPagamento: 'Dinheiro' })).toThrow()
expect(() => checkoutFormSchema.parse({ enderecoEntrega: delivery, formaPagamento: 'Pix', extra: true })).toThrow()
expect(() => checkoutFormSchema.parse({ enderecoEntrega: { ...delivery, complemento: 7 }, formaPagamento: 'Pix' })).toThrow()
```

```ts
// order.test.ts
const request = { enderecoEntrega: delivery, formaPagamento: 'Cartao', dataPedido: '2026-07-16T12:00:00-03:00', items: [{ itemId: '7', produtoId: 42, quantidade: '2', valorUnitario: '19.90' }] }
expect(adaptCreateOrderRequest(request)).toMatchObject({ items: [{ itemId: 7, produtoId: 42, quantidade: 2, valorUnitario: 19.9 }] })
expect(() => adaptCreateOrderRequest({ ...request, items: [{ ...request.items[0], itemId: '9007199254740992' }] })).toThrow()
expect(() => adaptCreateOrderRequest({ ...request, items: [{ ...request.items[0], quantidade: 'Infinity' }] })).toThrow()
const created = { status: true, data: { pedidoId: '101', clienteId: 11, dataPedido: '2026-07-16T12:00:00-03:00', formaPagamento: 'Boleto', status: 'Criado', valorTotal: '39.80' } }
expect(adaptCreatedOrderResponse(created)).toMatchObject({ id: 101, customerId: 11, total: 39.8 })
expect(() => adaptCreatedOrderResponse({ ...created, data: null })).toThrow()
expect(() => adaptCreatedOrderResponse({ ...created, data: { ...created.data, valorTotal: Number.NaN } })).toThrow()
```

```ts
// catalog.test.ts — envelope paginado completo
const page = { status: true, pagination: { pages: '2', size: 10, totalItems: '11', data: [{ produtoId: '1', titulo: 'Mouse', thumb: null, preco: '19.90', estoque: 2, categoria: { categoriaId: 3, titulo: 'Periféricos' } }] } }
expect(adaptCatalogResponse(page)).toMatchObject({ pagination: { pages: 2, size: 10, totalItems: 11 }, products: [{ id: 1, thumbnail: null, price: 19.9 }] })
expect(() => adaptCatalogResponse({ ...page, pagination: { ...page.pagination, pages: '9007199254740992' } })).toThrow()
expect(() => adaptCatalogResponse({ ...page, pagination: { ...page.pagination, data: null } })).toThrow()
expect(() => adaptCatalogResponse({ ...page, extra: true })).toThrow()
```

- [ ] **Step 3: confirmar RED focado**

Run: `npm --prefix frontend test -- src/shared/adapters/numbers.test.ts src/shared/contracts/apiEnvelopes.test.ts src/features/auth/contracts/login.test.ts src/features/catalog/contracts/catalog.test.ts src/features/cart/contracts/cart.test.ts src/features/checkout/contracts/checkout.test.ts src/features/checkout/contracts/order.test.ts src/features/customer/contracts/registration.test.ts src/features/customer/contracts/customerProfile.test.ts src/features/orders/contracts/orders.test.ts`

Expected: FAIL em strictness de `createApiResponseSchema`, login, catálogo, carrinho, registration e profile; checkout/create-order/orders permanecem PASS nas provas já estritas.

- [ ] **Step 4: implementar o mínimo após RED**

Use as definições finais abaixo. Mantenha os adapters abaixo das definições sem mudança, exceto a validação já mostrada pelos testes.

```ts
// frontend/src/shared/contracts/apiEnvelopes.ts
const transportIntegerSchema = z.union([z.number().int().safe(), z.string().regex(/^-?(?:0|[1-9]\d*)$/)])
export function createApiResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({ status: z.boolean().optional(), message: z.string().optional(), data: dataSchema.nullable().optional() }).strict()
}
export function createPagedResponseSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({ status: z.boolean().optional(), message: z.string().optional(), pagination: z.object({ pages: transportIntegerSchema.optional(), size: transportIntegerSchema.optional(), totalItems: transportIntegerSchema.optional(), data: z.array(itemSchema).optional() }).strict().optional() }).strict()
}
export const apiErrorResponseSchema = z.object({ error: z.object({ code: z.string().optional(), message: z.string().optional(), details: z.unknown().optional() }).strict().optional() }).strict()
```

```ts
// frontend/src/features/auth/contracts/login.ts
const transportIdSchema = z.union([z.number().int().safe(), z.string().regex(/^-?(?:0|[1-9]\d*)$/)])
export const loginRequestSchema = z.object({ email: z.string().trim().pipe(z.email()), senha: z.string().min(1) }).strict()
export const loginResponseDataSchema = z.object({ token: z.string().min(1), tipo: z.string().min(1), expiraEm: z.iso.datetime({ offset: true }), usuarioId: transportIdSchema, clienteId: transportIdSchema, email: z.email() }).strict()
export const loginResponseSchema = createApiResponseSchema(loginResponseDataSchema)
```

```ts
// frontend/src/features/catalog/contracts/catalog.ts
const transportIdSchema = z.union([z.number().int().safe(), z.string().regex(/^-?(?:0|[1-9]\d*)$/)])
const transportNumberSchema = z.union([z.number().finite(), z.string().regex(/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/)])
export const productCategorySchema = z.object({ categoriaId: transportIdSchema, titulo: z.string().min(1) }).strict()
export const categorySchema = productCategorySchema.extend({ descricao: z.string().nullable() }).strict()
export const catalogProductSchema = z.object({ produtoId: transportIdSchema, titulo: z.string().min(1), thumb: z.string().nullable(), preco: transportNumberSchema, estoque: transportNumberSchema, categoria: productCategorySchema }).strict()
export const productDetailSchema = z.object({ produtoId: transportIdSchema, titulo: z.string().min(1), descricao: z.string().nullable(), modelo: z.string().nullable(), foto: z.string().nullable(), preco: transportNumberSchema, estoque: transportNumberSchema, categoria: productCategorySchema }).strict()
export const categoriesResponseSchema = createApiResponseSchema(z.array(categorySchema))
export const catalogResponseSchema = createPagedResponseSchema(catalogProductSchema)
export const productDetailResponseSchema = createApiResponseSchema(productDetailSchema)
```

```ts
// frontend/src/features/cart/contracts/cart.ts
const transportIdSchema = z.union([z.number().int().safe(), z.string().regex(/^-?(?:0|[1-9]\d*)$/)])
const transportNumberSchema = z.union([z.number().finite(), z.string().regex(/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/)])
export const addCartItemRequestSchema = z.object({ produtoId: transportIdSchema, quantidade: transportNumberSchema, valorUnitario: transportNumberSchema }).strict()
export const updateCartItemRequestSchema = z.object({ quantidade: transportNumberSchema }).strict()
const createdCartDataSchema = z.object({ carrinhoId: transportIdSchema, dataCarrinho: z.iso.datetime({ offset: true }) }).strict()
const addedCartItemDataSchema = z.object({ itemId: transportIdSchema }).strict()
const cartItemIdDataSchema = z.object({ itemId: transportIdSchema, produtoId: transportIdSchema }).strict()
const cartItemDataSchema = z.object({ itemId: transportIdSchema, produtoId: transportIdSchema, quantidade: transportNumberSchema, valorUnitario: transportNumberSchema }).strict()
const cartDataSchema = z.object({ clienteId: transportIdSchema, carrinhoId: transportIdSchema, dataCarrinho: z.iso.datetime({ offset: true }), items: z.array(cartItemDataSchema) }).strict()
export const createCartResponseSchema = createApiResponseSchema(createdCartDataSchema)
export const cartResponseSchema = createApiResponseSchema(cartDataSchema)
export const addCartItemResponseSchema = createApiResponseSchema(addedCartItemDataSchema)
export const cartItemIdResponseSchema = createApiResponseSchema(cartItemIdDataSchema)
```

```ts
// frontend/src/features/checkout/contracts/checkout.ts
export const paymentMethodSchema = z.enum(['Pix', 'Cartao', 'Boleto'])
export const checkoutFormSchema = z.object({ enderecoEntrega: deliveryAddressSchema, formaPagamento: paymentMethodSchema }).strict()
```

```ts
// frontend/src/features/checkout/contracts/order.ts
const transportIdSchema = z.union([z.number().int().safe(), z.string().regex(/^-?(?:0|[1-9]\d*)$/)])
const transportNumberSchema = z.union([z.number().finite(), z.string().regex(/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/)])
const orderItemRequestSchema = z.object({ itemId: transportIdSchema.nullable(), produtoId: transportIdSchema, quantidade: transportNumberSchema, valorUnitario: transportNumberSchema }).strict()
export const createOrderRequestSchema = z.object({ enderecoEntrega: deliveryAddressSchema, formaPagamento: paymentMethodSchema, dataPedido: z.iso.datetime({ offset: true }), items: z.array(orderItemRequestSchema) }).strict()
const createdOrderDataSchema = z.object({ pedidoId: transportIdSchema, clienteId: transportIdSchema, dataPedido: z.iso.datetime({ offset: true }), formaPagamento: paymentMethodSchema, status: orderStatusSchema, valorTotal: transportNumberSchema }).strict()
const createdOrderResponseSchema = z.object({ status: z.boolean().optional(), message: z.string().optional(), data: createdOrderDataSchema.nullable().optional() }).strict()
```

```ts
// frontend/src/features/customer/contracts/registration.ts
const transportIdSchema = z.union([z.number().int().safe(), z.string().regex(/^-?(?:0|[1-9]\d*)$/)])
export const addressRequestSchema = z.object({ logradouro: z.string().trim().min(1).max(200), numero: z.string().trim().min(1).max(50), complemento: z.string().trim().max(200).nullable(), cep: z.string().trim().min(1).max(20), bairro: z.string().trim().min(1).max(100), cidade: z.string().trim().min(1).max(100), uf: z.string().trim().length(2) }).strict()
export const phoneRequestSchema = z.object({ ddd: z.string().regex(/^\d{2}$/), numero: z.string().trim().min(1).max(30), whatsApp: z.boolean() }).strict()
export const createCustomerRequestSchema = z.object({ senha: z.string().min(8).max(200), cpf: z.string().regex(/^\d{11}$/), nome: z.string().trim().min(1).max(200), dataNascimento: z.iso.date(), email: z.string().trim().email().max(200), endereco: addressRequestSchema, celular: phoneRequestSchema }).strict()
export const createCustomerResponseDataSchema = z.object({ clienteId: transportIdSchema }).strict()
export const createCustomerResponseSchema = createApiResponseSchema(createCustomerResponseDataSchema)
```

```ts
// frontend/src/features/customer/contracts/customerProfile.ts
const transportIdSchema = z.union([z.number().int().safe(), z.string().regex(/^-?(?:0|[1-9]\d*)$/)])
const customerAddressSchema = z.object({ logradouro: z.string().trim().min(1).max(200), numero: z.string().trim().min(1).max(50), complemento: z.string().trim().max(200).nullable(), cep: z.string().trim().min(1).max(20), bairro: z.string().trim().min(1).max(100), cidade: z.string().trim().min(1).max(100), uf: z.string().trim().length(2).transform((value) => value.toUpperCase()) }).strict()
export const deliveryAddressSchema = customerAddressSchema.extend({ complemento: z.string().trim().min(1).max(200).nullable().optional(), cep: z.string().trim().regex(/^\d{8}$/), uf: z.string().trim().length(2).regex(/^[A-Za-z]{2}$/) }).strict()
const customerPhoneSchema = z.object({ ddd: z.string().regex(/^\d{2}$/), numero: z.string().trim().min(1).max(30), whatsApp: z.boolean() }).strict()
const customerDetailSchema = z.object({ clienteId: transportIdSchema, cpf: z.string().regex(/^\d{11}$/), nome: z.string().trim().min(1).max(200), dataNascimento: notFutureDateSchema, email: z.string().trim().email().max(200), endereco: customerAddressSchema, celular: customerPhoneSchema }).strict()
const customerIdSchema = z.object({ clienteId: transportIdSchema }).strict()
const customerProfileResponseSchema = createApiResponseSchema(customerDetailSchema)
const customerIdResponseSchema = createApiResponseSchema(customerIdSchema)
```

```ts
// frontend/src/features/orders/contracts/orders.ts
const transportIdSchema = z.union([z.number().int().safe(), z.string().regex(/^-?(?:0|[1-9]\d*)$/)])
const transportNumberSchema = z.union([z.number().finite(), z.string().regex(/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/)])
export const orderStatuses = ['Criado', 'EmProcessamento', 'Processado', 'Cancelado', 'Devolvido'] as const
export const orderStatusSchema = z.enum(orderStatuses)
const orderItemSchema = z.object({ itemId: transportIdSchema, produtoId: transportIdSchema, quantidade: transportNumberSchema, valorUnitario: transportNumberSchema }).strict()
const orderSchema = z.object({ pedidoId: transportIdSchema, carrinhoId: transportIdSchema, clienteId: transportIdSchema, enderecoEntrega: deliveryAddressSchema, dataPedido: z.iso.datetime({ offset: true }), formaPagamento: paymentMethodSchema, status: orderStatusSchema, items: z.array(orderItemSchema) }).strict()
const ordersPageSchema = z.object({ status: z.literal(true), message: z.string().optional(), pagination: z.object({ pages: transportIdSchema, size: transportIdSchema, totalItems: transportIdSchema, data: z.array(orderSchema) }).strict() }).strict()
const orderResponseSchema = z.object({ status: z.literal(true), message: z.string().optional(), data: orderSchema.nullable() }).strict()
const cancelledOrderSchema = z.object({ pedidoId: transportIdSchema, clienteId: transportIdSchema, dataPedido: z.iso.datetime({ offset: true }), status: z.literal('Cancelado') }).strict()
const cancelledOrderResponseSchema = z.object({ status: z.literal(true), message: z.string().optional(), data: cancelledOrderSchema.nullable() }).strict()
```

- [ ] **Step 5: GREEN, gates e commits**

Run: comando focado do Step 3; depois `npm --prefix frontend run typecheck` e `npm --prefix frontend run lint`. Expected: todos exit `0`.

```powershell
git add frontend/src/shared/adapters/numbers.test.ts frontend/src/shared/contracts/apiEnvelopes.test.ts frontend/src/features/auth/contracts/login.test.ts frontend/src/features/catalog/contracts/catalog.test.ts frontend/src/features/cart/contracts/cart.test.ts frontend/src/features/checkout/contracts/checkout.test.ts frontend/src/features/checkout/contracts/order.test.ts frontend/src/features/customer/contracts/registration.test.ts frontend/src/features/customer/contracts/customerProfile.test.ts frontend/src/features/orders/contracts/orders.test.ts docs/frontend-quality/task-106-contract-matrix.md
git commit -m "test(TASK-106): ampliar matriz de contratos"
```

Commit de produto: `git add frontend/src/shared/contracts/apiEnvelopes.ts frontend/src/features/auth/contracts/login.ts frontend/src/features/catalog/contracts/catalog.ts frontend/src/features/cart/contracts/cart.ts frontend/src/features/checkout/contracts/checkout.ts frontend/src/features/checkout/contracts/order.ts frontend/src/features/customer/contracts/registration.ts frontend/src/features/customer/contracts/customerProfile.ts frontend/src/features/orders/contracts/orders.ts && git commit -m "fix(TASK-106): rejeitar contratos de transporte inválidos"`.

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
- Consumers modified: `frontend/src/features/catalog/components/ProductCard.tsx`, `frontend/src/features/catalog/pages/ProductDetailPage.tsx`, `frontend/src/features/cart/components/CartItem.tsx`, `frontend/src/features/cart/pages/CartPage.tsx`, `frontend/src/features/checkout/pages/CheckoutPage.tsx`, `frontend/src/features/checkout/pages/OrderConfirmationPage.tsx`, `frontend/src/features/orders/components/OrderCard.tsx`, `frontend/src/features/orders/components/OrderItem.tsx`, `frontend/src/features/orders/pages/OrderDetailPage.tsx`.

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

expect(['', '1', '1234', '1234567', '12345678901'].map(formatCpf)).toEqual(['', '1', '123.4', '123.456.7', '123.456.789-01'])
expect(['', '12345', '123456', '12345-678'].map(formatPostalCode)).toEqual(['', '12345', '12345-6', '12345-678'])
expect(['', '1', '11', '119', '1131234567', '11912345678'].map(formatCellPhone)).toEqual(['', '(1', '(11', '(11) 9', '(11) 3123-4567', '(11) 91234-5678'])
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

  it('rejects an invalid date', () => {
    expect(() => localCivilDate(new Date(Number.NaN))).toThrow(RangeError)
  })
})
```

Implemente no início de `localCivilDate`: `if (Number.isNaN(date.getTime())) throw new RangeError('Invalid local civil date')`. Execute também `$env:TZ='America/Sao_Paulo'; npm --prefix frontend test -- src/shared/dates/localCivilDate.test.ts` e `$env:TZ='UTC'; npm --prefix frontend test -- src/shared/dates/localCivilDate.test.ts`; ambos retornam PASS.

- [ ] **Step 4: RED/GREEN, matriz e gates**

Run: `npm --prefix frontend test -- src/shared/formatting/personalData.test.ts src/shared/formatting/currency.test.ts src/shared/dates/localCivilDate.test.ts src/features/orders/routing/ordersUrl.test.ts src/features/customer/contracts/customerProfile.test.ts`. Expected: RED por módulo de moeda ausente e data inválida; após as duas implementações, PASS.

Registre em `docs/frontend-quality/task-107-formatting-matrix.md` as entradas e saídas literais acima, o round-trip e os cinco arquivos executados. Depois rode `npm --prefix frontend run typecheck` e `npm --prefix frontend run lint`; expected exit `0`.

Substitua os nove `new Intl.NumberFormat(...).format(...)` pelos imports de `formatCurrency`. Commit: `git add frontend/src/shared/formatting frontend/src/shared/dates frontend/src/features/catalog frontend/src/features/cart frontend/src/features/checkout frontend/src/features/orders docs/frontend-quality/task-107-formatting-matrix.md && git commit -m "feat(TASK-107): centralizar formatação monetária"`.

As nove edições literais são:

```ts
// frontend/src/features/catalog/components/ProductCard.tsx
import { formatCurrency } from '../../../shared/formatting/currency'
<span>{formatCurrency(product.price)}</span>

// frontend/src/features/catalog/pages/ProductDetailPage.tsx
import { formatCurrency } from '../../../shared/formatting/currency'
<dd className="text-3xl font-bold text-zinc-50">{formatCurrency(product.price)}</dd>

// frontend/src/features/cart/components/CartItem.tsx
import { formatCurrency } from '../../../shared/formatting/currency'
<span>{formatCurrency(item.unitPrice)}</span>
<span>{formatCurrency(subtotal)}</span>

// frontend/src/features/cart/pages/CartPage.tsx
import { formatCurrency } from '../../../shared/formatting/currency'
<dd>{formatCurrency(subtotal)}</dd>

// frontend/src/features/checkout/pages/CheckoutPage.tsx
import { formatCurrency } from '../../../shared/formatting/currency'
<dd>{formatCurrency(subtotal)}</dd>

// frontend/src/features/checkout/pages/OrderConfirmationPage.tsx
import { formatCurrency } from '../../../shared/formatting/currency'
<dd className="mt-1 text-xl font-semibold text-zinc-50">{formatCurrency(order.total)}</dd>

// frontend/src/features/orders/components/OrderCard.tsx
import { formatCurrency } from '../../../shared/formatting/currency'
<span>{formatCurrency(calculateOrderTotal(order.items))}</span>

// frontend/src/features/orders/components/OrderItem.tsx
import { formatCurrency } from '../../../shared/formatting/currency'
<p className="text-sm text-zinc-400">{formatCurrency(item.unitPrice)} cada</p>
<p className="mt-2 font-semibold text-zinc-100">{formatCurrency(item.unitPrice * item.quantity)}</p>

// frontend/src/features/orders/pages/OrderDetailPage.tsx
import { formatCurrency } from '../../../shared/formatting/currency'
<span>{formatCurrency(calculateOrderTotal(order.items))}</span>
```

Remova as nove constantes locais `brlFormatter`/`currency`. `rg -n "Intl.NumberFormat" frontend/src/features` retorna zero após a edição.

---

### Task 108: TASK-108 — authStore

**Files:**
- Modify: `frontend/src/features/auth/store/authStore.test.ts`
- Modify only after RED: `frontend/src/features/auth/store/authStore.ts`
- Modify only after RED de timer: `frontend/src/features/auth/store/AuthSessionInitializer.tsx`

**Interfaces:** consumes `AUTH_STORE_KEY`, `AUTH_STORE_VERSION`, `AuthSession`, `isAuthSessionExpired(session: AuthSession, now?: number): boolean`, `useAuthStore`; persistence aceita `'session'|'local'`.

O arquivo de teste usa este cleanup:

```ts
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  window.localStorage.clear()
  window.sessionStorage.clear()
  useAuthStore.setState({ session: null, persistence: 'session' })
})
```

- [ ] **Step 1: adicionar corrupção, versão e falhas de leitura/escrita**

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

it('survives storage read failure and starts signed out', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
  await expect(useAuthStore.persist.rehydrate()).resolves.toBeUndefined()
  expect(useAuthStore.getState().session).toBeNull()
})

it('removes both wrappers when expiration is reached', () => {
  window.localStorage.setItem(AUTH_STORE_KEY, JSON.stringify({ state: { session, persistence: 'local' }, version: AUTH_STORE_VERSION }))
  window.sessionStorage.setItem(AUTH_STORE_KEY, JSON.stringify({ state: { session, persistence: 'session' }, version: AUTH_STORE_VERSION }))
  useAuthStore.setState({ session, persistence: 'local' })
  useAuthStore.getState().invalidateExpiredSession(Date.parse(session.expiraEm))
  expect(useAuthStore.getState().session).toBeNull()
  expect(window.localStorage.getItem(AUTH_STORE_KEY)).toBeNull()
  expect(window.sessionStorage.getItem(AUTH_STORE_KEY)).toBeNull()
})

it('accepts an expiration with a negative three-hour offset', () => {
  const offsetSession = { ...session, expiraEm: '2026-07-16T09:00:00-03:00' }
  expect(isAuthSessionExpired(offsetSession, Date.parse('2026-07-16T11:59:59Z'))).toBe(false)
  expect(isAuthSessionExpired(offsetSession, Date.parse('2026-07-16T12:00:00Z'))).toBe(true)
})
```

- [ ] **Step 2: confirmar RED**

Run: `npm --prefix frontend test -- src/features/auth/store/authStore.test.ts`. Expected: FAIL no payload versão `0`/campo extra; escolha de storage, timer e clear retornam PASS.

- [ ] **Step 3: implementação mínima**

Adicione o schema e use esta configuração completa:

```ts
const persistedAuthSchema = z.object({
  session: z.object({
    token: z.string().min(1), tipo: z.string().min(1), expiraEm: z.iso.datetime({ offset: true }),
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      persistence: 'session',
      setSession: (session, persistence) => {
        authStateStorage.removeItem?.(AUTH_STORE_KEY)
        set({ session, persistence })
      },
      clearSession: () => {
        set({ session: null, persistence: 'session' })
        authStateStorage.removeItem?.(AUTH_STORE_KEY)
      },
      invalidateExpiredSession: (now = Date.now()) => {
        const current = useAuthStore.getState().session
        if (current && isAuthSessionExpired(current, now)) useAuthStore.getState().clearSession()
      },
    }),
    {
      name: AUTH_STORE_KEY,
      version: AUTH_STORE_VERSION,
      storage: createJSONStorage(() => authStateStorage),
      partialize: ({ session, persistence }) => ({ session, persistence }),
      migrate: (persistedState: unknown) => migrateAuthState(persistedState),
      merge: (persistedState, currentState) => ({ ...currentState, ...migrateAuthState(persistedState) }),
      onRehydrateStorage: () => (state) => {
        state?.invalidateExpiredSession()
        if (!state?.session) authStateStorage.removeItem?.(AUTH_STORE_KEY)
      },
    },
  ),
)
```

Importe `z` de `zod`. `migrate` recebe diretamente o estado persistido desembrulhado pelo middleware. `merge` sanitiza também a versão atual. `onRehydrateStorage` remove os dois wrappers após descarte. `authStateStorage.getItem`, `.setItem` e `.removeItem` mantêm seus blocos `try/catch`.

- [ ] **Step 4: GREEN e gates**

Run: teste focado; `npm --prefix frontend run typecheck`; `npm --prefix frontend run lint`. Expected: todos exit `0`, incluindo timer no instante exato e escolha/limpeza dos dois storages.

Commits: `git add frontend/src/features/auth/store/authStore.test.ts && git commit -m "test(TASK-108): cobrir persistência e corrupção da autenticação"`; depois `git add frontend/src/features/auth/store/authStore.ts frontend/src/features/auth/store/AuthSessionInitializer.tsx && git commit -m "fix(TASK-108): sanitizar sessão persistida"`.

---

### Task 109: TASK-109 — cartSessionStore (verificação)

**Files:**
- Verify: `frontend/src/features/cart/store/cartSessionStore.ts`
- Verify: `frontend/src/features/cart/store/cartSessionStore.test.ts`
- Create: `docs/frontend-quality/task-109-cart-session-evidence.md`

**Interfaces:** consumes `CART_SESSION_STORE_KEY`, `CART_SESSION_STORE_VERSION`, `useCartSessionStore.getState().getCartId(customerId: number): number|undefined`, `.setCartId(customerId: number, cartId: number): void`, `.removeCartId(customerId: number): void`.

- [ ] **Step 1: prova exata, sem alterar produto**

Copie no relatório os dez nomes literais de `it(...)`: `persists only the customer-to-cart map with a version`, `keeps cart ids independent for each customer`, `updates only the selected customer cart id`, `removes only the selected customer cart id`, `restores persisted cart ids on rehydration`, `migrates version zero while keeping only valid customer-to-cart entries`, `discards an invalid persisted shape during migration`, `sanitizes a corrupted current-version payload without restoring remote fields`, `canonicalizes numeric customer keys restored from legacy storage`, `keeps the in-memory map usable when localStorage is unavailable`.

- [ ] **Step 2: executar evidência focada e repetida**

Run: `npm --prefix frontend test -- src/features/cart/store/cartSessionStore.test.ts --reporter=verbose`. Expected: `10` testes PASS, exit `0`.

Run: `npm --prefix frontend test -- src/features/cart/store/cartSessionStore.test.ts --reporter=verbose` novamente. Expected: mesmos `10` testes PASS, sem vazamento entre execuções.

Run: `npm --prefix frontend run typecheck`; `npm --prefix frontend run lint`. Expected: exit `0` em ambos.

- [ ] **Step 3: encerramento e commit**

Resultado obrigatório: duas execuções com `10/10 PASS`, typecheck e lint exit `0`, diff de `frontend/src/features/cart/store` vazio. Não modifique `frontend/src`. Registre commit SHA, quatro comandos, contagens e exit codes.

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
- Create: `frontend/src/shared/ui/baseComponents.hardening.test.tsx`
- Create: `docs/frontend-quality/task-110-component-matrix.md`
- Modify after RED: `frontend/src/shared/ui/buttons/Button.tsx`, `frontend/src/shared/ui/buttons/IconButton.tsx`, `frontend/src/shared/ui/buttons/LinkButton.tsx`, `frontend/src/shared/ui/forms/Input.tsx`, `frontend/src/shared/ui/forms/Select.tsx`, `frontend/src/shared/ui/forms/Checkbox.tsx`, `frontend/src/shared/ui/forms/FormErrorSummary.tsx`, `frontend/src/shared/ui/forms/QuantityInput.tsx`, `frontend/src/shared/ui/navigation/Pagination.tsx`, `frontend/src/shared/ui/overlays/Dialog.tsx`, `frontend/src/shared/ui/overlays/DropdownMenu.tsx`, `frontend/src/shared/ui/feedback/InlineAlert.tsx`, `frontend/src/shared/ui/feedback/Toast.tsx`, `frontend/src/shared/ui/states/EmptyState.tsx`, `frontend/src/shared/ui/states/ErrorState.tsx`, `frontend/src/shared/ui/states/Skeleton.tsx`, `frontend/src/shared/ui/indicators/Badge.tsx`, `frontend/src/shared/ui/indicators/Chip.tsx`.

**Interfaces:** consumes `Button`, `IconButton`, `LinkButton`, `Input`, `Select`, `Checkbox`, `FormErrorSummary`, `QuantityInput`, `Pagination`, `Dialog`, `DropdownMenu`, `DropdownMenuItem`, `InlineAlert`, `Toast`, `EmptyState`, `ErrorState`, `Skeleton`, `Badge`, `Chip`.

- [ ] **Step 1: criar matriz literal**

Copie esta matriz para o relatório:

| Export | Source | Test | Prova |
| --- | --- | --- | --- |
| Button | `buttons/Button.tsx` | `buttons/buttons.test.tsx` | role/name, Enter/Space, disabled |
| IconButton | `buttons/IconButton.tsx` | `buttons/buttons.test.tsx` | label obrigatório, ícone oculto |
| LinkButton | `buttons/LinkButton.tsx` | `buttons/buttons.test.tsx` | role link, href, foco |
| Input | `forms/Input.tsx` | `forms/forms.test.tsx` | label, description, invalid, disabled |
| Select | `forms/Select.tsx` | `forms/forms.test.tsx` | label, opções, keyboard, disabled |
| Checkbox | `forms/Checkbox.tsx` | `forms/forms.test.tsx` | checked, Space, disabled |
| FormErrorSummary | `forms/FormErrorSummary.tsx` | `forms/forms.test.tsx` | alert, `fieldId`, foco |
| QuantityInput | `forms/QuantityInput.tsx` | `forms/QuantityInput.test.tsx` | nomes, setas, Home/End, limites |
| Pagination | `navigation/Pagination.tsx` | `navigation/Pagination.test.tsx` | navigation, `aria-current`, setas, limites |
| Dialog | `overlays/Dialog.tsx` | `overlays/overlays.test.tsx` | role/name, foco, trap, Escape, retorno |
| DropdownMenu | `overlays/DropdownMenu.tsx` | `overlays/overlays.test.tsx` | trigger, menu, setas, Escape |
| DropdownMenuItem | `overlays/DropdownMenu.tsx` | `overlays/overlays.test.tsx` | menuitem, Enter, disabled |
| InlineAlert | `feedback/InlineAlert.tsx` | `feedback/feedback.test.tsx` | alert, título, ação |
| Toast | `feedback/Toast.tsx` | `feedback/feedback.test.tsx` | status, dismiss, nome |
| EmptyState | `states/EmptyState.tsx` | `states/states.test.tsx` | heading, descrição, ação |
| ErrorState | `states/ErrorState.tsx` | `states/states.test.tsx` | alert, retry |
| Skeleton | `states/Skeleton.tsx` | `states/states.test.tsx` | `aria-hidden=true` |
| Badge | `indicators/Badge.tsx` | `indicators/indicators.test.tsx` | texto e token de status |
| Chip | `indicators/Chip.tsx` | `indicators/indicators.test.tsx` | button, pressed, disabled |

Crie este arquivo completo; ele importa e exercita os 19 exports:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './buttons/Button'
import { IconButton } from './buttons/IconButton'
import { LinkButton } from './buttons/LinkButton'
import { InlineAlert } from './feedback/InlineAlert'
import { Toast } from './feedback/Toast'
import { Checkbox } from './forms/Checkbox'
import { FormErrorSummary } from './forms/FormErrorSummary'
import { Input } from './forms/Input'
import { QuantityInput } from './forms/QuantityInput'
import { Select } from './forms/Select'
import { Badge } from './indicators/Badge'
import { Chip } from './indicators/Chip'
import { Pagination } from './navigation/Pagination'
import { Dialog } from './overlays/Dialog'
import { DropdownMenu, DropdownMenuItem } from './overlays/DropdownMenu'
import { EmptyState } from './states/EmptyState'
import { ErrorState } from './states/ErrorState'
import { Skeleton } from './states/Skeleton'

describe('base component hardening', () => {
  it('covers buttons and links by native semantics', () => {
    const action = vi.fn()
    render(<MemoryRouter><Button disabled onClick={action}>Salvar</Button><IconButton aria-label="Carrinho">ícone</IconButton><LinkButton to="/products">Produtos</LinkButton></MemoryRouter>)
    fireEvent.keyDown(screen.getByRole('button', { name: 'Salvar' }), { key: 'Enter' })
    expect(action).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Carrinho' }).firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('link', { name: 'Produtos' })).toHaveAttribute('href', '/products')
  })

  it('covers Input, Checkbox, Select and FormErrorSummary', () => {
    const change = vi.fn()
    render(<><Input id="email" label="E-mail" error="Inválido" disabled /><Checkbox label="Aceito" onChange={change} /><Select label="Pagamento" onChange={change}><option>Pix</option><option>Boleto</option></Select><FormErrorSummary data-testid="summary" errors={[{ fieldId: 'email', message: 'Inválido' }]} /></>)
    expect(screen.getByRole('textbox', { name: 'E-mail' })).toBeDisabled()
    const checkbox = screen.getByRole('checkbox', { name: 'Aceito' })
    checkbox.focus(); fireEvent.keyDown(checkbox, { key: ' ' }); fireEvent.click(checkbox)
    fireEvent.change(screen.getByRole('combobox', { name: 'Pagamento' }), { target: { value: 'Boleto' } })
    expect(change).toHaveBeenCalledTimes(2)
    const summary = screen.getByTestId('summary'); summary.focus()
    expect(summary).toHaveFocus()
    expect(screen.getByRole('link', { name: 'Inválido' })).toHaveAttribute('href', '#email')
  })

  it('covers QuantityInput and Pagination keyboard limits', () => {
    const quantity = vi.fn(); const page = vi.fn()
    render(<><QuantityInput label="Quantidade" value={1} min={1} max={2} onChange={quantity} /><Pagination page={1} totalPages={2} onPageChange={page} /></>)
    const input = screen.getByRole('spinbutton', { name: 'Quantidade' })
    fireEvent.keyDown(input, { key: 'End' }); expect(quantity).toHaveBeenLastCalledWith(2)
    const navigation = screen.getByRole('navigation', { name: 'Paginação' })
    fireEvent.keyDown(navigation, { key: 'ArrowLeft' }); expect(page).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Página 1', current: 'page' })).toBeInTheDocument()
  })

  it('covers Dialog focus, Escape and focus return', () => {
    function Fixture() { const [open, setOpen] = useState(false); return <><button onClick={() => setOpen(true)}>Abrir</button><Dialog open={open} onOpenChange={setOpen} title="Confirmação"><button>Confirmar</button></Dialog></> }
    render(<Fixture />); const trigger = screen.getByRole('button', { name: 'Abrir' }); trigger.focus(); fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Confirmação' }); expect(screen.getByRole('button', { name: 'Fechar dialogo' })).toHaveFocus()
    fireEvent.keyDown(dialog, { key: 'Escape' }); expect(trigger).toHaveFocus()
  })

  it('covers DropdownMenu and a disabled DropdownMenuItem', async () => {
    const blocked = vi.fn()
    render(<DropdownMenu label="Conta" trigger="Conta"><DropdownMenuItem disabled onClick={blocked}>Bloqueado</DropdownMenuItem><DropdownMenuItem>Perfil</DropdownMenuItem></DropdownMenu>)
    fireEvent.keyDown(screen.getByRole('button', { name: 'Conta' }), { key: 'ArrowDown' })
    await new Promise(requestAnimationFrame)
    const disabled = screen.getByRole('menuitem', { name: 'Bloqueado' }); expect(disabled).toBeDisabled(); fireEvent.click(disabled); expect(blocked).not.toHaveBeenCalled()
    const profile = screen.getByRole('menuitem', { name: 'Perfil' }); fireEvent.keyDown(profile, { key: 'Escape' }); expect(screen.getByRole('button', { name: 'Conta' })).toHaveFocus()
  })

  it('covers feedback live regions', () => {
    const dismiss = vi.fn(); render(<><InlineAlert title="Falha" variant="error">Revise</InlineAlert><Toast message="Salvo" variant="success" onDismiss={dismiss} /></>)
    expect(screen.getByRole('alert')).toHaveTextContent('Falha')
    expect(screen.getByRole('status')).toHaveTextContent('Salvo')
    fireEvent.click(screen.getByRole('button', { name: 'Fechar notificação' })); expect(dismiss).toHaveBeenCalledOnce()
  })

  it('covers empty, error and skeleton states', () => {
    render(<><EmptyState title="Vazio" description="Sem itens" action={<button>Voltar</button>} /><ErrorState action={<button>Tentar novamente</button>} /><Skeleton data-testid="skeleton" /></>)
    expect(screen.getByRole('heading', { name: 'Vazio' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar')
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true')
  })

  it('covers Badge and Chip states', () => {
    const action = vi.fn(); render(<><Badge status="success">Disponível</Badge><Chip selected disabled onClick={action}>Todos</Chip></>)
    expect(screen.getByText('Disponível')).toHaveClass('text-emerald-300')
    const chip = screen.getByRole('button', { name: 'Todos', pressed: true }); expect(chip).toBeDisabled(); fireEvent.click(chip); expect(action).not.toHaveBeenCalled()
  })
})
```

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
  render(<><Input id="email" label="E-mail" error="E-mail inválido" /><FormErrorSummary errors={[{ fieldId: 'email', message: 'E-mail inválido' }]} /></>)
  expect(screen.getByRole('alert')).toHaveTextContent('E-mail inválido')
  expect(screen.getByLabelText('E-mail')).toHaveAccessibleDescription('E-mail inválido')
  expect(screen.getByRole('link', { name: 'E-mail inválido' })).toHaveAttribute('href', '#email')
})
```

- [ ] **Step 3: RED, correção mínima e GREEN**

Run: `npm --prefix frontend test -- src/shared/ui/baseComponents.hardening.test.tsx src/shared/ui/buttons/buttons.test.tsx src/shared/ui/forms/forms.test.tsx src/shared/ui/forms/QuantityInput.test.tsx src/shared/ui/navigation/Pagination.test.tsx src/shared/ui/overlays/overlays.test.tsx src/shared/ui/feedback/feedback.test.tsx src/shared/ui/states/states.test.tsx src/shared/ui/indicators/indicators.test.tsx`. Expected: PASS; os 19 exports já apresentam a semântica exercitada pelo arquivo completo.

Run: `npm --prefix frontend run typecheck`; `npm --prefix frontend run lint`; `npm --prefix frontend test`. Expected: todos exit `0`; a suíte global encerra o gate do lote.

- [ ] **Step 4: commits e gate do lote**

`git add frontend/src/shared/ui/baseComponents.hardening.test.tsx frontend/src/shared/ui/buttons/buttons.test.tsx frontend/src/shared/ui/forms/forms.test.tsx frontend/src/shared/ui/forms/QuantityInput.test.tsx frontend/src/shared/ui/navigation/Pagination.test.tsx frontend/src/shared/ui/overlays/overlays.test.tsx frontend/src/shared/ui/feedback/feedback.test.tsx frontend/src/shared/ui/states/states.test.tsx frontend/src/shared/ui/indicators/indicators.test.tsx docs/frontend-quality/task-110-component-matrix.md && git commit -m "test(TASK-110): completar matriz dos componentes base"`.

Após revisão aprovada e backlog atualizado, confirme `TASK-106`–`TASK-110` `DONE`, `git status --short` sem mudanças pendentes e só então altere `TASK-111`–`TASK-116` para `READY` em uma operação de backlog própria.

## Self-review

- Spec coverage: `TASK-106` cobre transportes/envelopes/enums; `107` moeda/dados pessoais/data; `108` storage/expiração/versão/falha; `109` cobre dez critérios; `110` cobre teclado/foco/estado/semântica.
- Placeholder scan: zero marcadores pendentes, zero glob em paths de edição e zero decisão de implementação aberta; produto só muda sob RED indicado.
- Type consistency: todas as assinaturas foram conferidas nos fontes; `postalCode` corresponde às funções reais `normalizePostalCode`/`formatPostalCode`; stores usam as chaves e versões exportadas.
- Gates: cada task contém elegibilidade, BASE, explorer, implementer, diff-check, reviewer, fix loop, DONE/evidência, RED/GREEN e commits rastreáveis.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-15-fase-8-lote-1-cobertura-deterministica.md`. Execute com `superpowers:subagent-driven-development`, uma task por vez, preservando writers sequenciais e o workflow de `AGENTS.md`.
