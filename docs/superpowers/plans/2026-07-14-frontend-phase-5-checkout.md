# Frontend Phase 5 Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o checkout protegido até a confirmação persistente do pedido, aderente a RF-070–RF-078.

**Architecture:** A feature `checkout` concentra formulário, contratos, serviços, queries/mutation e páginas; reutiliza sessão, query/cache do carrinho e cliente HTTP existentes. O request é montado de dados confirmados e validado em uma fronteira estrita antes do POST; efeitos de sucesso são coordenados pela mutação.

**Tech Stack:** React 19, TypeScript, React Router, TanStack Query, React Hook Form, Zod 4, Zustand, Vitest, Testing Library e MSW.

## Global Constraints

- Executar TASK-076..085 em ordem, uma implementação e uma revisão por task.
- Aplicar TDD: teste vermelho, implementação mínima, teste verde e commit rastreável.
- O root do request contém somente `enderecoEntrega`, `formaPagamento`, `dataPedido` e `items`.
- Formas de pagamento: exatamente `Pix`, `Cartao` e `Boleto`.
- Nunca prometer autorização de pagamento, entrega ou emissão de nota fiscal.
- Não implementar lazy loading, E2E, lista/detalhe de pedidos ou edição persistente do perfil nesta fase.

---

### Task 076: Schemas do checkout

**Files:** Create `frontend/src/features/checkout/contracts/checkout.ts`; Test `frontend/src/features/checkout/contracts/checkout.test.ts`.

**Interfaces:** Produces `paymentMethodSchema`, `deliveryAddressSchema`, `checkoutFormSchema`, `PaymentMethod`, `DeliveryAddress`, `CheckoutFormValues`.

- [ ] Escrever testes que aceitam endereço completo e cada método, e rejeitam método/propriedade desconhecida; executar `npm test -- src/features/checkout/contracts/checkout.test.ts` e esperar FAIL por módulo ausente.
- [ ] Implementar schemas Zod estritos: strings não vazias, CEP com 8 dígitos, UF com 2 letras, `complemento` opcional/nullable e enum `['Pix','Cartao','Boleto']`.
- [ ] Reexecutar o teste focado esperando PASS; executar `npm run typecheck`; commit `feat(TASK-076): Criar schemas do checkout`.

### Task 077: Guard de carrinho não vazio

**Files:** Create `frontend/src/features/checkout/routing/CheckoutGuard.tsx`; Test `frontend/src/features/checkout/routing/CheckoutGuard.test.tsx`; Modify `frontend/src/app/router/AppRouter.tsx`.

**Interfaces:** Consumes `useCartQuery(): {data?: Cart,isPending,isError,hasCart}` and `ProtectedRoute`; Produces `CheckoutGuard` rendering `Outlet` only when `data.items.length > 0`.

- [ ] Testar loading, erro, ausência/vazio redirecionando para `/carrinho`, e carrinho não vazio liberando outlet; comando focado deve falhar antes da implementação.
- [ ] Implementar guard com `Navigate replace`, `Skeleton`/`ErrorState`, e aninhá-lo dentro de `ProtectedRoute` na rota checkout.
- [ ] Rodar teste focado e `npm run typecheck` esperando PASS; commit `feat(TASK-077): Proteger acesso ao checkout`.

### Task 078: Pré-carga do endereço

**Files:** Create `frontend/src/features/checkout/contracts/customerProfile.ts`, `services/getCheckoutProfileService.ts`, `queries/useCheckoutProfileQuery.ts` and matching `.test.ts(x)` files.

**Interfaces:** Consumes `apiClient`, `session.clienteId/token`; Produces `CheckoutProfile { customerId:number; address:DeliveryAddress }` and `useCheckoutProfileQuery()`.

- [ ] Testar adaptação do envelope de `GET /api/v1/cliente/{clienteId}`, normalização do endereço e query desabilitada sem sessão; testes focados devem falhar por módulos ausentes.
- [ ] Implementar schema de transporte, adapter, serviço com `signal` e query key `['customer','checkout-profile',clienteId]` marcada privada.
- [ ] Rodar testes focados e typecheck esperando PASS; commit `feat(TASK-078): Precarregar endereco do checkout`.

### Task 079: Página e formulário

**Files:** Create `frontend/src/features/checkout/pages/CheckoutPage.tsx` and `.test.tsx`; Modify `frontend/src/app/router/AppRouter.tsx`.

**Interfaces:** Consumes `checkoutFormSchema`, `useCheckoutProfileQuery`, `useCartQuery`; Produces formulário com `onSubmit(values: CheckoutFormValues)` pronto para a mutação da TASK-083.

- [ ] Testar loading/erro, preenchimento do perfil, edição local, três pagamentos, validação e resumo do carrinho; teste focado deve falhar.
- [ ] Implementar React Hook Form com resolver Zod local compatível, inputs existentes, radio group semântico, `FormErrorSummary`, subtotal/total sem frete/desconto; não chamar PUT de cliente.
- [ ] Rodar teste focado, typecheck e lint esperando PASS; commit `feat(TASK-079): Implementar pagina de checkout`.

### Task 080: Adapter estrito do pedido

**Files:** Create `frontend/src/features/checkout/contracts/order.ts`; Test `frontend/src/features/checkout/contracts/order.test.ts`.

**Interfaces:** Produces `OrderItem`, `CreateOrderRequest`, `CreatedOrder`, `adaptCreateOrderRequest(input)` and `adaptCreatedOrderResponse(response)`.

- [ ] Testar root exato, rejeição de `clienteId`/`carrinhoId`, itens com `itemId/produtoId/quantidade/valorUnitario` e resposta 201; teste deve falhar inicialmente.
- [ ] Implementar schemas `.strict()`, normalização numérica e mapeamento entre nomes internos e transporte; nenhuma omissão de `itemId`.
- [ ] Rodar teste focado e typecheck esperando PASS; commit `feat(TASK-080): Criar adapter de pedido`.

### Task 081: Itens do estado confirmado

**Files:** Create `frontend/src/features/checkout/adapters/confirmedCartItems.ts`; Test `frontend/src/features/checkout/adapters/confirmedCartItems.test.ts`.

**Interfaces:** Consumes `Cart`; Produces `buildOrderItems(cart: Cart): OrderItem[]`.

- [ ] Testar mapeamento exato e rejeição de carrinho ausente/vazio, demonstrando que campos hidratados não entram no resultado; teste focado deve falhar.
- [ ] Implementar função pura que copia `id→itemId`, `productId→produtoId`, `quantity→quantidade`, `unitPrice→valorUnitario` e lança `TypeError` para vazio.
- [ ] Rodar teste focado e typecheck esperando PASS; commit `feat(TASK-081): Montar itens confirmados do pedido`.

### Task 082: Serviço de criação

**Files:** Create `frontend/src/features/checkout/services/createOrderService.ts` and `.test.ts`.

**Interfaces:** Produces `createOrder(request: CreateOrderRequest, token: string, signal?: AbortSignal): Promise<CreatedOrder>`; consumes `apiClient` and order adapters.

- [ ] Com relógio fixo no chamador de teste, verificar POST `/api/v1/pedido`, bearer token, ISO e resposta adaptada; teste focado deve falhar.
- [ ] Implementar serviço que valida o request e usa `apiClient.post`; manter geração de data fora do serviço para ocorrer no submit.
- [ ] Rodar teste focado e typecheck esperando PASS; commit `feat(TASK-082): Criar pedido pelo checkout`.

### Task 083: Mutação, data e duplicidade

**Files:** Create `frontend/src/features/checkout/mutations/useCreateOrderMutation.ts` and `.test.tsx`; Modify `CheckoutPage.tsx` and test.

**Interfaces:** Consumes form values plus confirmed `Cart`; Produces mutation whose `mutate` builds items and uses `new Date().toISOString()` immediately before `createOrder`.

- [ ] Testar ISO no clique, um POST em clique duplo, CTA `disabled` durante pending e mensagens específicas para `AppError` 409/422 preservando campos; testes devem falhar.
- [ ] Implementar mutation e submissão com guarda síncrona por ref além de `isPending`; mapear erros para alerta acionável e liberar ref em `onSettled`.
- [ ] Rodar testes focados, typecheck e lint esperando PASS; commit `feat(TASK-083): Controlar envio do checkout`.

### Task 084: Reconciliação após 201

**Files:** Create `frontend/src/features/checkout/cache/orderCache.ts`; Modify mutation and test; Test/modify `frontend/src/features/cart/store/cartSessionStore.test.ts` only if coverage is missing.

**Interfaces:** Produces `orderQueryKeys.all = ['orders']`; consumes `removeCartId(customerId)`, `cartQueryKeys.detail(customerId,cartId)` and QueryClient.

- [ ] Testar que sucesso remove somente vínculo corrente, remove query do carrinho e invalida `orders`; testar que 409/422 não executam efeitos; teste deve falhar.
- [ ] Implementar efeitos em `onSuccess` somente após resposta adaptada, capturando customer/cart IDs da tentativa confirmada.
- [ ] Rodar testes focados e typecheck esperando PASS; commit `feat(TASK-084): Reconciliar caches apos pedido`.

### Task 085: Confirmação restaurável

**Files:** Create `frontend/src/features/checkout/storage/orderConfirmationStorage.ts`, `.test.ts`, `pages/OrderConfirmationPage.tsx`, `.test.tsx`; Modify mutation, `CheckoutPage.tsx`, `AppRouter.tsx` and tests.

**Interfaces:** Produces key `shop-api:order-confirmation`, version `1`, `save/read/clearOrderConfirmation`, and page route `/pedido-confirmado/:pedidoId`.

- [ ] Testar storage versionado/sanitizado, correspondência do ID, navegação após 201, refresh restaurado, ausência inválida e textos sem promessas proibidas; testes devem falhar.
- [ ] Implementar snapshot somente de `CreatedOrder`, leitura protegida de sessionStorage, navigation state e página com ID, data, método, status e total; mismatch mostra estado seguro e link `/pedidos`.
- [ ] Rodar testes focados, `npm test`, `npm run typecheck`, `npm run lint` e `npm run build`, todos esperando exit 0; commit `feat(TASK-085): Exibir confirmacao do pedido`.

## Fechamento por task e do lote

Após cada commit: gerar `git diff BASE_COMMIT..HEAD`, obter aprovação de implementação e revisão, corrigir findings CRITICAL/IMPORTANT e só então trocar a task correspondente para `Status: DONE` com evidências. Ao final, confirmar que cada TASK-076..085 possui commit identificável e que o backlog registra testes e revisão sem falhas.
