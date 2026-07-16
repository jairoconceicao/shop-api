# TASK-115 — diagnóstico da falha integrada de checkout

## Reprodução

Comando executado no worktree `E:/CodeRepo/shop-api/.worktrees/phase-8-hardening`:

```text
cd frontend
npm test -- --run src/features/checkout/checkout.integration.test.tsx --reporter=verbose
```

Resultado reproduzível: `1 failed, 2 passed`. O caso 201 envia exatamente um
POST e passa pelos asserts do body, mas não encontra o heading `Pedido criado`.
No timeout, a árvore está em `/carrinho`, exibindo `Carrinho` e
`Seu carrinho está vazio`.

Isso exclui contrato HTTP, fake timer, lazy loading e parsing da resposta como
causa primária: o POST já foi observado e resolvido como 201 antes da falha. Os
casos 409/422 passam porque não executam a reconciliação de sucesso.

## Sequência real que causa a falha

1. `CheckoutPage.tsx:92-100` chama `mutation.mutate(..., { onSuccess })`. A
   navegação para `/pedido-confirmado/:id` existe somente nesse callback local
   passado à chamada de `mutate`.
2. O callback global da mutation roda primeiro. Em
   `useCreateOrderMutation.ts:103-115`, ele:
   - grava o snapshot de confirmação;
   - remove o vínculo do carrinho do Zustand em `:109`;
   - remove o cache do carrinho;
   - aguarda a invalidação dos pedidos.
3. A remoção síncrona no Zustand notifica `useCartQuery`. O
   `CheckoutGuard.tsx:31-35` recalcula `hasCart=false` e renderiza
   `<Navigate replace to="/carrinho" />`.
4. A página de checkout e seu `MutationObserver` são desmontados.
5. O TanStack Query condiciona callbacks locais de `mutate` à existência de
   listeners (`node_modules/@tanstack/query-core/src/mutationObserver.ts:164`).
   Como o observer foi desmontado, o callback de
   `CheckoutPage.tsx:96-98` não é chamado.
6. O resultado final fica em `/carrinho`. O snapshot foi criado, mas a rota que
   o consome nunca é alcançada.

## Por que os testes anteriores não detectaram

`CheckoutPage.test.tsx:125-160` monta `CheckoutPage` diretamente com `cart` e
`profile` por props, sem `CheckoutGuard` e sem `useCartQuery`. Portanto,
`removeCartId` não desmonta a página nesses testes e o callback local continua
com listener ativo. O teste integrado novo é o primeiro que combina a mutation
real com guard, Zustand, cache e router reais.

O fluxo análogo de exclusão de cliente evita essa divisão: o próprio callback
global de `useDeleteCustomerMutation` executa reconciliação e navegação, logo
não depende de um callback por chamada após uma desmontagem. Para TASK-115,
entretanto, mover `useNavigate` para o hook aumentaria o patch e obrigaria a
envolver todos os testes isolados do hook em Router.

## Hipótese única de causa raiz

A causa raiz é a dependência de um callback `onSuccess` por chamada para
navegar, enquanto o `onSuccess` global remove antes o estado observado pelo
guard. Essa remoção desmonta o observer e, por contrato do TanStack Query,
suprime exatamente o callback que faria a navegação.

## Correção mínima recomendada

Alterar somente `CheckoutPage.tsx` para não depender do callback local de
`mutate`. Usar a Promise de `mutateAsync`, cuja resolução não depende de o
observer continuar montado:

```tsx
submissionInFlightRef.current = true
createOrderMutation.reset()
void createOrderMutation
  .mutateAsync({ values: parsed.data, cart })
  .then((createdOrder) => {
    navigate(`/pedido-confirmado/${createdOrder.id}`)
  })
  .catch(() => {
    submissionInFlightRef.current = false
  })
```

Ordem resultante:

1. mutation global grava snapshot;
2. remove vínculo/cache;
3. invalida pedidos;
4. a Promise de `mutateAsync` resolve mesmo que o guard tenha desmontado a
   página;
5. a continuação navega para a confirmação, que lê o snapshot já gravado.

Essa é a menor mudança de produto: preserva o hook, as garantias de sessão, a
reconciliação e todos os consumidores/testes isolados. Pode existir uma
transição intermediária para `/carrinho` durante a invalidação; se isso for
considerado visualmente inaceitável, a alternativa arquitetural é tornar a
navegação parte do `onSuccess` global antes de `removeCartId`, como no fluxo de
exclusão de cliente, com custo maior de acoplamento ao Router e alterações nos
wrappers dos testes do hook.

## Regressões exigidas

1. Manter o novo teste integrado 201 exigindo `Pedido criado`, snapshot,
   remoção do vínculo/cache e invalidação de pedidos.
2. Manter 409/422 exigindo permanência no checkout e ausência de efeitos de
   sucesso.
3. Acrescentar/ajustar teste de `CheckoutPage` para provar que a navegação
   ocorre após `mutateAsync` mesmo quando o componente é desmontado antes da
   resolução da Promise. O teste integrado já é a prova funcional principal.
4. Executar:

```text
npm test -- --run src/features/checkout/checkout.integration.test.tsx
npm test -- --run src/features/checkout/pages/CheckoutPage.test.tsx src/features/checkout/mutations/useCreateOrderMutation.test.tsx
npm run typecheck
npm run lint
```

Nenhum arquivo de produto foi alterado durante este diagnóstico.
