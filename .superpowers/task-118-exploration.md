# Exploração da TASK-118

## Linha de base e elegibilidade

- Worktree: `E:\CodeRepo\shop-api\.worktrees\phase-8-hardening`
- Branch: `codex/phase-8-hardening`
- `BASE_COMMIT`: `2745a4c8993b9b4fb025a881cc1f038fa634ad3f5`
- O checkout estava limpo antes deste relatório.
- `TASK-117` está `DONE` e `TASK-118` está `READY` em `docs/frontend-tasks-v2.md`.
- O plano aprovado está em `docs/superpowers/plans/2026-07-16-task-118-guest-cart-e2e.md`.

## Baseline executado

Comando:

```text
npm --prefix frontend run test:e2e -- --project=chromium
```

Resultado: `2 passed (6.5s)` para `smoke.spec.ts` e `auth.spec.ts`.

## Comportamento de produto confirmado

- `ProductDetailPage.tsx:73-86` consulta a sessão somente no clique. Para visitante ou sessão expirada, compõe `returnTo` com `pathname + search + hash`, navega para `/entrar` com `replace: true` e retorna antes de chamar o carrinho.
- `LoginPage.tsx:46-48` persiste a sessão em `sessionStorage` quando `Manter conectado` não está marcado e navega para `getInternalReturnTo(location.state)`.
- `returnTo.ts` aceita a rota interna planejada, incluindo query e hash, e rejeita origem externa, protocolo relativo e barra invertida.
- `useAddProductToCart.ts` cria o carrinho quando não existe associação, adiciona o item e somente então anuncia sucesso.
- `useAddCartItemMutation.ts:27` busca novamente o produto antes do POST para confirmar o preço. Portanto `product: 2` significa:
  1. GET que renderiza o detalhe inicial;
  2. GET de confirmação de preço após o segundo clique.
  O retorno do login normalmente reutiliza o cache ainda fresco de 30 segundos e não é o segundo GET.
- Os contratos planejados coincidem com os serviços reais:
  - `GET /api/v1/produto/42`;
  - `POST /api/v1/carrinho/criar` sem body;
  - `POST /api/v1/carrinho/items` com `{ produtoId, quantidade, valorUnitario }`;
  - `GET /api/v1/carrinho/:id` com token.

Nenhuma mudança de produto é indicada.

## Colocação exata da implementação

### `frontend/e2e/support/authApi.ts`

1. Estender `RequestName`, `RegistrationData` e `AuthApi` no bloco público atual das linhas 7-39.
2. Acrescentar produto e IDs do carrinho no retorno de `buildRegistrationData`, iniciado na linha 69.
3. Acrescentar os quatro contadores no ledger iniciado na linha 127.
4. Declarar `seededCustomer()` ao lado de `registeredCustomer`, antes de `increment` e antes de `context.route`.
5. Inserir o precheck de carrinho no início do handler de login da linha 184, antes de incrementar `login`.
6. Inserir os handlers `product`, `cartCreate`, `cartAdd` e `cartGet` depois dos handlers de autenticação existentes e imediatamente antes do fallback inesperado das linhas 245-249.
7. Acrescentar `requestCounts()` e `seedCustomer()` no objeto retornado a partir da linha 252.
8. Manter `reset()` limpando cliente, expectativa e todas as chaves do ledger; a iteração por `Object.keys(counts)` já absorve as novas chaves.

### `frontend/e2e/guest-cart.spec.ts`

Criar a spec ao lado de `auth.spec.ts` e importar exclusivamente de `./fixtures`. A fixture atual já:

- instala uma única interceptação;
- inicia e encerra cada teste com storage/cookies limpos;
- valida contagens no `finally`;
- remove todas as rotas e reinicia o backend mesmo após falha.

Não criar outra fixture ou outro `context.route`.

## Divergências e riscos a validar no GREEN

### 1. `cartGet: 1` depende de deduplicação temporal

O `StoreLayout` mantém `useConfirmedCartCount()` ativo. Quando `useCreateCartMutation` grava o novo `cartId`, o query de carrinho pode iniciar um GET. Depois do POST do item, `reconcileActiveCart()` solicita refetch do mesmo query ativo.

TanStack Query tende a deduplicar essas operações quando o primeiro GET ainda está em voo, tornando a expectativa `cartGet: 1` plausível, mas ela é sensível ao agendamento. O primeiro GREEN deve confirmar a contagem real. Se forem observados dois GETs de modo determinístico, não alterar produto para satisfazer o teste: ajustar a expectativa e documentar que um GET habilita o badge e outro reconcilia a mutation, ou revisar o gate com o orquestrador.

### 2. O checkpoint de zero após login deve esperar a página do produto

O plano já faz `toHaveURL(returnTo)` e aguarda o heading antes de ler contadores. Isso é necessário para cobrir o retorno automático, não apenas a resolução do POST de login. Deve ser preservado.

### 3. A quantidade voltar a `1` é comportamento esperado

A página de produto é desmontada ao ir para o layout público de login. Ao retornar, o reducer local é recriado com `1`. A spec deve reafirmar `1` e selecionar `3` novamente; não deve tentar preservar a intenção anterior.

### 4. A asserção de storage do carrinho ocorre antes da criação

Antes do segundo clique, `shop-api:cart-session` deve ser `null`. Após `cartCreate`, o store persiste a associação; a spec não deve reutilizar a expectativa de `null` depois da adição.

## Resultado observado na implementação

O primeiro GREEN confirmou `cartGet=2` de forma determinística. A causa foi
rastreada sem espera temporal:

1. `useCreateCartMutation.onSuccess` grava o novo `cartId`, ativando
   `useCartQuery()` no badge e produzindo o primeiro GET;
2. após o POST do item, `useAddCartItemMutation.onSuccess` chama
   `reconcileActiveCart()`, que refaz o query ativo e produz o segundo GET.

O backend em memória conclui o primeiro GET antes da reconciliação, portanto
não há uma promise em voo para o TanStack Query deduplicar. A spec deve exigir
exatamente dois GETs, pois ambos representam contratos reais e distintos.

## Conclusão

A TASK-118 está elegível e o plano pode ser implementado nos dois arquivos E2E previstos. Não foi encontrada divergência que exija mudança de produto ou backlog. O único ponto que requer observação explícita no primeiro GREEN é a contagem efetiva de `cartGet`, devido à concorrência entre a ativação do query do badge e a reconciliação posterior.
