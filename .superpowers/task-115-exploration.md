# TASK-115 — Relatório de exploração

## Contexto

- Worktree: `E:/CodeRepo/shop-api/.worktrees/phase-8-hardening`
- `BASE_COMMIT`: `26501eb9af961d9b31016e96d674367dd19cd262`
- Backlog: TASK-114 está `DONE` e TASK-115 está `READY`; dependências satisfeitas.
- Escopo analisado: plano TASK-115, router/guard/page de checkout, queries de
  carrinho e perfil, mutation/serviço/contratos de criação, caches de carrinho,
  pedidos e confirmação, infraestrutura MSW e testes existentes.

## Baseline

- `npm test -- --run src/features/checkout`: PASS, 9 arquivos e 84 testes.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `git diff --check 26501eb`: PASS.
- Worktree limpo no início da exploração.

## Confirmação dos critérios

### Carrinho e perfil confirmados

O fluxo real atende ao desenho:

1. `CheckoutGuard` executa `useCartQuery`.
2. Somente depois de um carrinho confirmado, não vazio e sem erro, habilita
   `useCustomerProfileQuery`.
3. O `Outlet` entrega o `Cart` adaptado e o `CheckoutProfile` derivado da
   resposta confirmada.
4. `CheckoutPage` usa exclusivamente esse contexto para endereço, total e
   itens da mutation.

Os handlers planejados `GET /api/v1/carrinho/70` e
`GET /api/v1/cliente/7` correspondem exatamente às queries reais.

### POST estrito, ISO e sem IDs externos

- `createOrder` acrescenta `dataPedido` via `now().toISOString()`.
- `adaptCreateOrderRequest` valida um objeto `.strict()` contendo somente
  `enderecoEntrega`, `formaPagamento`, `dataPedido` e `items`.
- `clienteId` e `carrinhoId` não fazem parte do tipo nem do schema do request.
- `buildOrderItems` deriva os itens do `Cart` confirmado, preservando
  `itemId`, `produtoId`, `quantidade` e `valorUnitario`.
- O `toEqual` literal do plano verifica o contrato completo e os dois
  `not.toHaveProperty` tornam explícita a ausência dos IDs.

### Submissão duplicada

`CheckoutPage` combina uma trava síncrona em `submissionInFlightRef` com
`createOrderMutation.isPending`. Assim, os dois submits emitidos por
`user.dblClick` chegam à mesma instância de página, mas somente o primeiro
alcança `mutate`. O ledger `bodies` do plano é adequado para provar um POST.

### Efeitos de 201

`useCreateOrderMutation.onSuccess`:

- grava `orderConfirmationKey(7, 900)`;
- remove somente o vínculo do carrinho confirmado;
- remove exatamente `cartQueryKeys.detail(7, 70)`;
- invalida pelo prefixo canônico `orderQueryKeys.all`.

Depois disso, o callback local da página navega para
`/pedido-confirmado/900`. A página de confirmação lê o snapshot privado e
exibe o heading `Pedido criado`. As chaves literais usadas pelo plano
correspondem às implementações atuais.

### Efeitos de 409 e 422

Falhas HTTP não executam `onSuccess`. A página:

- mapeia 409 para `Revise o carrinho antes de tentar novamente.`;
- mapeia 422 para `Revise os dados do pedido e tente novamente.`;
- libera somente a trava de submissão em `onError`;
- preserva formulário, rota, vínculo, cache do carrinho e cache de pedidos;
- não cria snapshot de confirmação nem navega.

Os asserts planejados cobrem as cópias mapeadas, endereço, pagamento,
heading, vínculo e ausência dos efeitos de sucesso.

## RED e lacunas de produto

Não foi encontrada lacuna de produto que justifique patch na aplicação. Os
comportamentos pedidos já possuem cobertura unitária/por hook e o novo teste
deve apenas prová-los integrados com router, providers reais e MSW.

Por isso, não há RED comportamental esperado para TASK-115. A regra do plano
está correta: qualquer falha da spec literal deve bloquear a task e retornar
para análise, em vez de autorizar mudança automática de produto.

## Divergências e ajustes recomendados no listing

1. **Fake timers são mais amplos que o necessário.** O listing usa
   `vi.useFakeTimers({ shouldAdvanceTime: true })` apenas para congelar
   `new Date()`, mas `renderIntegration` cria `userEvent` sem `advanceTimers`.
   Isso adiciona risco de timeout ou flakiness nos cliques. Preferir
   `vi.useFakeTimers({ toFake: ['Date'] })` com `vi.setSystemTime(...)`, ou
   validar previamente que o modo atual não bloqueia `userEvent`.
2. **Os GETs são provados indiretamente, não contabilizados.** Heading,
   endereço e cache demonstram que carrinho e perfil foram consumidos, mas
   contadores `cartReads` e `profileReads` iguais a 1 deixariam explícito que
   ambos os snapshots confirmados vieram da rede e não foram duplicados.
3. **A rota é verificada por efeito visível.** `Pedido criado` comprova a
   navegação de sucesso e `Checkout` comprova permanência nas falhas. Isso é
   suficiente para o fluxo atual; se o critério exigir pathname literal,
   será necessário um observador de `useLocation` no harness, pois
   `renderIntegration` não expõe history.
4. **O radio Pix já nasce selecionado.** O clique explícito no primeiro teste
   é válido, mas não necessário. No teste parametrizado, o assert
   `toBeChecked()` está alinhado ao default real.
5. **Fixtures, seletores e query keys estão corretos.** Os envelopes MSW
   respeitam os schemas estritos; `Rua A`, `Pix`, `Confirmar pedido`,
   `Checkout` e `Pedido criado` existem com os roles/names usados; as keys
   `cartQueryKeys.detail(7, 70)`, `orderQueryKeys.all`,
   `orderQueryKeys.list(7, undefined, undefined, 1, 20)` e
   `orderConfirmationKey(7, 900)` são canônicas.

## Recomendação ao implementador

Criar somente `frontend/src/features/checkout/checkout.integration.test.tsx`.
Manter o contrato e os asserts de cache do plano, acrescentar contadores dos
dois GETs e limitar o fake timer ao `Date`. Se a spec literal falhar por
comportamento da aplicação, registrar o RED e bloquear TASK-115 antes de
qualquer alteração de produto.
