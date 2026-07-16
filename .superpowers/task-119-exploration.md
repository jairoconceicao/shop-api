# Exploração da TASK-119 — ciclo completo do carrinho E2E

**BASE_COMMIT:** `c461201caf381f0b1a4a23e27111c969e03316ef`
**Branch/worktree:** `codex/phase-8-hardening` em `E:\CodeRepo\shop-api\.worktrees\phase-8-hardening`
**Modo:** exploração read-only do produto; somente este relatório foi criado.

## Elegibilidade e baseline

- `TASK-117` e `TASK-118` estão `DONE`.
- `TASK-119` está `READY`; todas as dependências listadas estão concluídas.
- Checkout limpo no início da exploração e `HEAD` igual ao BASE_COMMIT.
- `npm run typecheck`: PASS.
- `npm run test:e2e -- --project=chromium`: PASS, 3/3 testes em 7,1 s.
- `npm run lint`: PASS.
- Uma tentativa de executar lint e Playwright simultaneamente falhou com `ENOENT` em `frontend/test-results`, porque o Playwright removeu o diretório enquanto o ESLint percorria a árvore. O comando canônico isolado passou; isso é uma corrida entre gates concorrentes, não uma falha do código. Executar esses gates sequencialmente.

## Conclusão

O plano `docs/superpowers/plans/2026-07-16-task-119-cart-lifecycle-e2e.md` é implementável sem alteração de produto. A lacuna está exclusivamente no backend Playwright em memória e na nova spec:

1. `frontend/e2e/support/authApi.ts` ainda representa sempre um item fixo com quantidade 3 e não reconhece PATCH/DELETE.
2. Não existe `frontend/e2e/cart-lifecycle.spec.ts`.
3. A fixture compartilhada já fornece isolamento, teardown, falha por request inesperado e validação exata de contagens; não precisa ser alterada.

## Colocações exatas

Em `frontend/e2e/support/authApi.ts`:

- Ampliar `RequestName` (linhas 7–16) com `cartUpdate` e `cartDelete`.
- Ampliar o ledger `counts` (linhas 160–170) com ambos zerados.
- Incluir os novos comandos no gate que impede carrinho antes do login (linhas 243–251).
- Após `registeredCustomer` (linha 172), manter estado mutável por teste:
  - item ausente inicialmente;
  - POST de item confirma `{ itemId, productId, quantity: 3, unitPrice }`;
  - PATCH muda a quantidade para 4;
  - DELETE remove o item.
- Substituir a resposta fixa do GET do carrinho (linhas 348–368) por resposta derivada do estado atual.
- Inserir handlers estritos antes do GET `/api/v1/carrinho/:cartId`:
  - `PATCH /api/v1/carrinho/items/${data.cartItemId}`;
  - `DELETE /api/v1/carrinho/items/${data.cartItemId}`.
- No `reset()` (linhas 438–443), limpar também o estado mutável do item.

Criar `frontend/e2e/cart-lifecycle.spec.ts`, reutilizando `test` e `expect` de `./fixtures`.

Não alterar:

- `frontend/e2e/fixtures.ts`;
- `frontend/src/features/cart/**`;
- `frontend/src/features/catalog/**`;
- `docs/frontend-tasks-v2.md` durante a implementação.

## Contratos HTTP confirmados

| Ledger | Request | Corpo |
| --- | --- | --- |
| `cartCreate` | `POST /api/v1/carrinho/criar` | nenhum |
| `cartAdd` | `POST /api/v1/carrinho/items` | `{ produtoId: 42, quantidade: 3, valorUnitario: 3499.9 }` |
| `cartUpdate` | `PATCH /api/v1/carrinho/items/:itemId` | `{ quantidade: 4 }` |
| `cartDelete` | `DELETE /api/v1/carrinho/items/:itemId` | nenhum |
| `cartGet` | `GET /api/v1/carrinho/:cartId` | nenhum |

PATCH e DELETE exigem o mesmo Bearer token já validado pelos handlers existentes. As respostas de ambos devem preservar o envelope aceito pelos adapters, com `itemId` e `produtoId`.

## Contagens esperadas e origem

```text
register=0
login=1
categories=3
profile=0
logout=0
product=2
cartCreate=1
cartAdd=1
cartGet=4
cartUpdate=1
cartDelete=1
```

Justificativa:

- `categories=3`: montagem do `StoreLayout` na entrada protegida em `/carrinho`,
  remontagem após o login retornar a `/carrinho` e carga completa ao navegar
  diretamente para o detalhe do produto. O retorno SPA ao carrinho reutiliza o
  layout e o cache.
- `product=2`: detalhe do produto na página e detalhe solicitado pela carga do item no carrinho.
- `cartGet=4`:
  1. ativação da query do badge após `setCartId`;
  2. reconciliação canônica após POST do item;
  3. reconciliação após PATCH;
  4. reconciliação após DELETE.
- Cada comando mutável ocorre exatamente uma vez. O texto do backlog “cada request ocorre uma vez” deve ser interpretado para os comandos; os quatro GETs são efeitos canônicos intencionais e já estão explicitados no plano.

O `cart.integration.test.tsx` confirma o padrão PATCH → GET e DELETE → GET, corpo PATCH estrito, DELETE sem body, atualização de totais/badge e carrinho vazio.

## Seletores semânticos confirmados

- Login:
  - `getByLabel('E-mail')`
  - `getByLabel('Senha')`
  - `getByRole('button', { name: 'Entrar', exact: true })`
- Produto:
  - heading nível 1 com `data.product.title`
  - spinbutton `Quantidade`
  - botão `Aumentar quantidade`
  - botão `Adicionar ao carrinho`
  - status contendo `Produto adicionado ao carrinho`
- Badge:
  - link `Carrinho` quando zero
  - link `Carrinho com 3 itens`
  - link `Carrinho com 4 itens`
- Carrinho:
  - link com título do produto
  - spinbutton `Quantidade de ${data.product.title}`
  - complementary `Resumo do carrinho`
  - termos `Subtotal` e `Total`
  - botão `Remover ${data.product.title}`
  - dialog `Remover item do carrinho?`
  - botão `Remover item`
  - heading `Seu carrinho está vazio`

Há dois botões chamados `Aumentar quantidade` apenas enquanto contextos diferentes não coexistem. Na página do produto há um; no carrinho com um item há um. O seletor do plano é não ambíguo nessa jornada.

## Valores visíveis confirmados

- Preço unitário: `3499.9`.
- Quantidade adicionada: 3.
- Total/subtotal inicial: `R$ 10.499,70`.
- Quantidade após PATCH: 4.
- Total/subtotal final: `R$ 13.999,60`.
- Cada valor total aparece três vezes: subtotal do item, subtotal do resumo e total do resumo. A regex `R\$\s...` tolera espaço normal ou NBSP.

## Divergências e cuidados

1. O File Map do plano diz para modificar `docs/superpowers/plans/2026-07-15-fase-8-testes-hardening.md`, mas essa ligação já foi feita no próprio BASE_COMMIT `c461201`. Não gerar alteração adicional nesse arquivo durante a implementação.
2. Executar lint e Playwright sequencialmente para evitar a corrida observada sobre `frontend/test-results`.
3. O handler atual de POST só valida o request; para a TASK-119 ele precisa também persistir o item confirmado. Sem isso, o primeiro GET continua sendo apenas uma resposta fixa e PATCH/DELETE não conseguem provar transições reais.
4. O estado do item precisa ser reiniciado por `reset()`, além dos contadores e cliente, para preservar `fullyParallel`, repetição e independência de ordem.
5. Manter os handlers PATCH/DELETE antes de qualquer matching mais amplo e rejeitar item inexistente, método incorreto, autorização ausente, body divergente ou body inesperado.

## Escopo recomendado ao implementador

Alterar somente:

- `frontend/e2e/support/authApi.ts`;
- `frontend/e2e/cart-lifecycle.spec.ts`.

Depois executar sequencialmente a spec isolada, repetição dupla, suíte Chromium, suíte Chromium repetida, typecheck, lint, build e `git diff --check`.
