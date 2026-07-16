# Cart Page Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exibir no resumo do carrinho com itens ações acessíveis para voltar ao catálogo e avançar ao checkout.

**Architecture:** A mudança permanece na vertical slice do carrinho: `CartSummary` compõe dois `LinkButton` do design system e continua derivando sua exibição dos itens confirmados já fornecidos por `CartPage`. Não serão criados estado, efeitos, queries, mutations ou regras de navegação; o fluxo usa links internos do React Router e o guard existente continua protegendo `/checkout`.

**Tech Stack:** React 19, TypeScript, React Router 7, Tailwind CSS v4, Vitest 4 e Testing Library.

## Global Constraints

- Alterar somente o frontend da TASK-131; nenhuma mudança de backend.
- “Continuar comprando” usa `LinkButton` secundário com destino exato `/`.
- “Ir para checkout” usa `LinkButton` primário com destino exato `/checkout`.
- As duas ações existem somente quando há itens confirmados no carrinho.
- Preservar nomes acessíveis, ativação por teclado, foco visível e layout sem overflow horizontal entre 320 px e desktop amplo.
- Não alterar regras de negócio, totais, caches, queries, mutations, persistência ou o guard de checkout.
- Registrar commits no formato `feat(TASK-131): descrição`, `test(TASK-131): descrição` ou `fix(TASK-131): descrição`.

---

## Estrutura de arquivos

- Modificar `frontend/src/features/cart/pages/CartPage.test.tsx`: cobrir presença, ordem, nomes, destinos e ausência das ações.
- Modificar `frontend/src/features/cart/pages/CartPage.tsx`: compor as ações responsivas dentro de `CartSummary` usando `LinkButton` existente.
- Modificar `docs/frontend-tasks-v2.md`: marcar TASK-131 como `DONE` e registrar evidências somente depois dos testes e das aprovações obrigatórias.

### Task 1: Ações do resumo do carrinho

**Files:**
- Modify: `frontend/src/features/cart/pages/CartPage.test.tsx`
- Modify: `frontend/src/features/cart/pages/CartPage.tsx:65-87`

**Interfaces:**
- Consumes: `LinkButton({ to, variant, className, children }: LinkButtonProps)` de `frontend/src/shared/ui/buttons/LinkButton.tsx`; `CartSummary({ items }: { items: readonly CartItemContract[] })` e o `MemoryRouter` já usado pelos testes.
- Produces: dois links internos no `aside` “Resumo do carrinho”, na ordem “Continuar comprando” (`/`) e “Ir para checkout” (`/checkout`), sem nova API pública.

- [ ] **Step 1: Escrever os testes de presença, ordem e destinos com itens**

Adicionar este teste em `frontend/src/features/cart/pages/CartPage.test.tsx`, após o teste de subtotal e total:

```tsx
it('shows catalog and checkout actions in the cart summary when items exist', () => {
  Object.assign(cartQuery, { data: cart, hasCart: true })
  productsQuery.data = [product(1, 'Primeiro produto'), product(2, 'Segundo produto')]

  renderPage()

  const summary = screen.getByRole('complementary', { name: 'Resumo do carrinho' })
  const links = within(summary).getAllByRole('link')

  expect(links).toHaveLength(2)
  expect(links[0]).toHaveAccessibleName('Continuar comprando')
  expect(links[0]).toHaveAttribute('href', '/')
  expect(links[1]).toHaveAccessibleName('Ir para checkout')
  expect(links[1]).toHaveAttribute('href', '/checkout')
})
```

- [ ] **Step 2: Ampliar os testes de carrinho vazio para provar ausência**

Adicionar as duas asserções abaixo ao fim de ambos os testes existentes, `shows the empty state without a cart association and still calls hydration at the top level` e `shows the empty state when the confirmed cart has no items`:

```tsx
expect(screen.queryByRole('link', { name: 'Continuar comprando' })).not.toBeInTheDocument()
expect(screen.queryByRole('link', { name: 'Ir para checkout' })).not.toBeInTheDocument()
```

Essas asserções distinguem as novas ações do link existente “Explorar catálogo” no `EmptyState`.

- [ ] **Step 3: Executar o teste focado e confirmar RED**

Run:

```bash
cd frontend
npm test -- src/features/cart/pages/CartPage.test.tsx
```

Expected: FAIL no teste `shows catalog and checkout actions in the cart summary when items exist`, porque o resumo ainda retorna zero links; os testes de ausência continuam passando.

- [ ] **Step 4: Implementar a composição mínima no CartSummary**

Em `frontend/src/features/cart/pages/CartPage.tsx`, inserir o bloco abaixo imediatamente depois de `</dl>` e antes de `</Card>`:

```tsx
<div className="mt-6 flex flex-col gap-3 sm:flex-row">
  <LinkButton className="w-full" to="/" variant="secondary">
    Continuar comprando
  </LinkButton>
  <LinkButton className="w-full" to="/checkout">
    Ir para checkout
  </LinkButton>
</div>
```

Não adicionar condição dentro de `CartSummary`: `CartPage` já retorna `CartEmptyState` antes de renderizar o resumo quando `items.length === 0`. A coluna padrão evita overflow em 320 px; `sm:flex-row` organiza os links lado a lado em telas maiores; `w-full` fornece alvos consistentes. A variante primária de “Ir para checkout” é o default explícito de `LinkButton`.

- [ ] **Step 5: Executar o teste focado e confirmar GREEN**

Run:

```bash
cd frontend
npm test -- src/features/cart/pages/CartPage.test.tsx
```

Expected: PASS para todos os testes de `CartPage.test.tsx`, incluindo presença, ordem, destinos e ausência das ações.

- [ ] **Step 6: Executar verificação estática focada**

Run:

```bash
cd frontend
npm run typecheck
npm run lint -- src/features/cart/pages/CartPage.tsx src/features/cart/pages/CartPage.test.tsx
```

Expected: ambos os comandos encerram com código 0, sem erros TypeScript ou ESLint.

- [ ] **Step 7: Revisar o diff da implementação**

Run:

```bash
git diff --check
git diff -- frontend/src/features/cart/pages/CartPage.tsx frontend/src/features/cart/pages/CartPage.test.tsx
```

Expected: `git diff --check` sem saída; o diff contém somente os dois links responsivos e os testes descritos, sem mudanças em caches, queries, mutations ou checkout.

- [ ] **Step 8: Criar o commit atômico da implementação**

```bash
git add frontend/src/features/cart/pages/CartPage.tsx frontend/src/features/cart/pages/CartPage.test.tsx
git commit -m "feat(TASK-131): Adicionar ações ao carrinho"
```

Expected: um commit criado contendo somente os dois arquivos da feature.

### Task 2: Gate amplo, revisão e fechamento do backlog

**Files:**
- Modify: `docs/frontend-tasks-v2.md`

**Interfaces:**
- Consumes: commit da Task 1, resultados de teste e aprovações do implementador e do revisor exigidas pelo workflow do repositório.
- Produces: TASK-131 com `Status: DONE` e evidência rastreável de commit, RED/GREEN, verificações e revisão.

- [ ] **Step 1: Executar a verificação ampla do frontend**

Run:

```bash
cd frontend
npm test
npm run typecheck
npm run lint
npm run build
```

Expected: suíte completa PASS sem testes falhando; typecheck, lint e build encerram com código 0. Registrar as contagens reais de testes e qualquer aviso não bloqueante para a evidência do backlog.

- [ ] **Step 2: Gerar o diff para revisão obrigatória**

Run:

```bash
git diff 6b3272264cc9dd905a82a73b8f7a8fac599d87ed..HEAD -- frontend/src/features/cart/pages/CartPage.tsx frontend/src/features/cart/pages/CartPage.test.tsx
```

Expected: diff limitado às ações de `CartSummary` e aos testes da TASK-131. Encaminhar esse diff ao agente revisor; findings `CRITICAL` ou `IMPORTANT` devem ser corrigidos pelo implementador, testados novamente e reenviados ao revisor antes de continuar.

- [ ] **Step 3: Atualizar o backlog somente após as duas aprovações**

Em `docs/frontend-tasks-v2.md`, alterar `[ ]` para `[x]`, trocar `Status: READY` por `Status: DONE` e acrescentar, depois dos critérios de aceite, uma linha `Evidência`. Nessa linha, copiar o SHA curto exibido por `git log -1 --format=%h`, as contagens exatas exibidas pelo teste focado e pela suíte completa, o RED pela ausência dos links, os resultados de typecheck/lint/build/diff-check e a aprovação do revisor. Todos os valores devem vir das saídas registradas nos passos anteriores; não inventar valores.

Não marcar `DONE` se um teste estiver falhando ou se houver finding `CRITICAL` ou `IMPORTANT` pendente.

- [ ] **Step 4: Validar e criar o commit final do backlog**

Run:

```bash
git diff --check
git diff -- docs/frontend-tasks-v2.md
git add docs/frontend-tasks-v2.md
git commit -m "feat(TASK-131): Concluir ações do carrinho"
```

Expected: `git diff --check` sem saída e um commit contendo somente o fechamento e as evidências reais da TASK-131.

- [ ] **Step 5: Confirmar o estado final rastreável**

Run:

```bash
git status --short
git log --oneline -3
```

Expected: worktree sem mudanças pendentes da TASK-131; log mostra o commit da implementação e o commit final do backlog, ambos na branch da task.
