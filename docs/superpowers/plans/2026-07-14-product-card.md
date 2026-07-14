# ProductCard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar um `ProductCard` reutilizável que apresente exclusivamente os dados disponíveis em `CatalogProduct` e ofereça um link explícito para os detalhes do produto.

**Architecture:** O componente será uma unidade de apresentação pura dentro da feature de catálogo: recebe um `CatalogProduct`, deriva apenas preço e disponibilidade e compõe `Card`, `ProductImage`, `Badge` e `LinkButton` existentes. A navegação permanece declarativa via React Router; fallback de imagem continua responsabilidade exclusiva de `ProductImage`.

**Tech Stack:** React 19, TypeScript 5.7, React Router DOM 7, Tailwind CSS 4, Vitest 4, Testing Library 16.

## Global Constraints

- Implementar somente em `frontend/`; não alterar backend.
- SPA, sem server-side pages.
- Usar o tipo existente `CatalogProduct`; não alterar contratos, serviços, queries, páginas, grid ou rotas.
- Compor com `Card`, `ProductImage`, `Badge` e `LinkButton` existentes.
- Exibir somente categoria, título, imagem/fallback, preço atual em BRL, disponibilidade e o link explícito “Ver detalhes”.
- Considerar “Em estoque” quando `stock >= 1` e “Esgotado” quando `stock < 1`.
- Navegar para `/produtos/{id}` pelo roteador, sem recarregar a página.
- Não exibir compra, quantidade, avaliação, promoção, preço anterior, Pix, parcelamento, frete, modelo, descrição ou SKU.
- Textos longos não podem ampliar o card nem sobrepor preço, disponibilidade ou link.
- Preservar `frontend/public/mockServiceWorker.js`, que já está modificado no checkout e não pertence à TASK-051.
- Baseline em 2026-07-14 no commit `ea595f32161f0bb3517a2869a526f463a7a5d679`: `npm run typecheck` PASS; `npm run lint` PASS; `npm run test` tem 1 falha preexistente em `src/features/auth/store/authStore.test.ts > useAuthStore > restores a persisted session that has not expired` (46 arquivos passam, 1 falha; 242 testes passam, 1 falha); `npm run build` falha preexistente porque top-level await em `src/main.tsx` não está disponível no target configurado. Registrar esses baselines nos gates globais, sem corrigi-los nesta task.

---

## File Map

- Create: `frontend/src/features/catalog/components/ProductCard.test.tsx` — testes comportamentais do conteúdo, limites de estoque, fallback, navegação acessível e exclusões do MVP.
- Create: `frontend/src/features/catalog/components/ProductCard.tsx` — componente puro e formatação BRL local à apresentação.
- Do not modify: `frontend/src/features/catalog/contracts/catalog.ts` — fonte existente do tipo `CatalogProduct`.
- Do not modify: `frontend/public/mockServiceWorker.js` — alteração preexistente deve permanecer fora do commit.

### Task 1: Implementar o ProductCard orientado por comportamento

**Files:**
- Create: `frontend/src/features/catalog/components/ProductCard.test.tsx`
- Create: `frontend/src/features/catalog/components/ProductCard.tsx`

**Interfaces:**
- Consumes: `CatalogProduct` de `frontend/src/features/catalog/contracts/catalog.ts`; `Card({ variant?, className?, ...HTMLAttributes<HTMLElement> })`; `ProductImage({ alt, src?, width?, height?, ...ImgHTMLAttributes })`; `Badge({ status?, ...HTMLAttributes<HTMLSpanElement> })`; `LinkButton({ to, variant?, size?, ...LinkProps })`.
- Produces: `export interface ProductCardProps { product: CatalogProduct }` e `export function ProductCard({ product }: ProductCardProps): JSX.Element` (retorno inferido pelo TypeScript).

- [ ] **Step 1: Escrever os testes RED completos**

Crie `frontend/src/features/catalog/components/ProductCard.test.tsx` exatamente com:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import type { CatalogProduct } from '../contracts/catalog'
import { ProductCard } from './ProductCard'

const product: CatalogProduct = {
  id: 42,
  title: 'Teclado mecânico ABNT2',
  thumbnail: '/teclado.webp',
  price: 349.9,
  stock: 1,
  category: { id: 12, title: 'Hardware' },
}

function LocationProbe() {
  const location = useLocation()
  return <output aria-label="Localização atual">{location.pathname}</output>
}

function renderCard(candidate: CatalogProduct = product) {
  return render(
    <MemoryRouter initialEntries={['/produtos']}>
      <ProductCard product={candidate} />
      <LocationProbe />
    </MemoryRouter>,
  )
}

describe('ProductCard', () => {
  it('renders only catalog content with a BRL price and accessible image', () => {
    renderCard()

    expect(screen.getByText('Hardware')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Teclado mecânico ABNT2' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'Teclado mecânico ABNT2' }),
    ).toHaveAttribute('src', '/teclado.webp')
    expect(screen.getByText('R$ 349,90')).toBeInTheDocument()
    expect(screen.getByRole('article')).toHaveClass('min-w-0')

    for (const excludedCopy of [
      /comprar/i,
      /quantidade/i,
      /avaliação/i,
      /promoção/i,
      /preço anterior/i,
      /pix/i,
      /parcelamento/i,
      /frete/i,
      /modelo/i,
      /descrição/i,
      /sku/i,
    ]) {
      expect(screen.queryByText(excludedCopy)).not.toBeInTheDocument()
    }
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it.each([
    { stock: 1, label: 'Em estoque' },
    { stock: 0, label: 'Esgotado' },
    { stock: -0.1, label: 'Esgotado' },
  ])('derives $label when stock is $stock', ({ stock, label }) => {
    renderCard({ ...product, stock })

    expect(screen.getByRole('status', { name: label })).toHaveTextContent(label)
  })

  it('delegates an absent thumbnail to the accessible image fallback', () => {
    renderCard({ ...product, thumbnail: null })

    expect(
      screen.getByRole('img', { name: 'Teclado mecânico ABNT2' }),
    ).toHaveTextContent('Imagem indisponível')
  })

  it('delegates a failed thumbnail to the accessible image fallback', () => {
    renderCard()

    fireEvent.error(
      screen.getByRole('img', { name: 'Teclado mecânico ABNT2' }),
    )

    expect(
      screen.getByRole('img', { name: 'Teclado mecânico ABNT2' }),
    ).toHaveTextContent('Imagem indisponível')
  })

  it('navigates through the explicit accessible details link without reload', () => {
    renderCard()

    const link = screen.getByRole('link', { name: 'Ver detalhes' })
    expect(link).toHaveAttribute('href', '/produtos/42')

    fireEvent.click(link)

    expect(screen.getByLabelText('Localização atual')).toHaveTextContent(
      '/produtos/42',
    )
  })
})
```

- [ ] **Step 2: Executar RED e confirmar que a falha é a ausência do componente**

Run:

```powershell
cd frontend
npm run test -- src/features/catalog/components/ProductCard.test.tsx
```

Expected: FAIL antes de coletar os testes com erro de resolução equivalente a `Failed to resolve import "./ProductCard"` / `Cannot find module './ProductCard'`. Não criar nem alterar outros arquivos para resolver o RED.

- [ ] **Step 3: Implementar o mínimo GREEN**

Crie `frontend/src/features/catalog/components/ProductCard.tsx` exatamente com:

```tsx
import type { CatalogProduct } from '../contracts/catalog'
import { LinkButton } from '../../../shared/ui/buttons/LinkButton'
import { Badge } from '../../../shared/ui/indicators/Badge'
import { ProductImage } from '../../../shared/ui/media/ProductImage'
import { Card } from '../../../shared/ui/surfaces/Card'

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export interface ProductCardProps {
  product: CatalogProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const isAvailable = product.stock >= 1
  const availability = isAvailable ? 'Em estoque' : 'Esgotado'

  return (
    <Card className="flex min-w-0 flex-col gap-4 p-4">
      <ProductImage
        alt={product.title}
        className="shrink-0"
        src={product.thumbnail}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <p className="truncate text-sm text-zinc-400">{product.category.title}</p>
        <h2 className="break-words text-lg font-semibold text-zinc-100">
          {product.title}
        </h2>
        <p className="text-xl font-bold text-zinc-100">
          {brlFormatter.format(product.price)}
        </p>
        <Badge
          aria-label={availability}
          className="self-start"
          role="status"
          status={isAvailable ? 'success' : 'danger'}
        >
          {availability}
        </Badge>
        <LinkButton className="mt-auto w-full" to={`/produtos/${product.id}`}>
          Ver detalhes
        </LinkButton>
      </div>
    </Card>
  )
}
```

- [ ] **Step 4: Executar GREEN focado**

Run:

```powershell
cd frontend
npm run test -- src/features/catalog/components/ProductCard.test.tsx
```

Expected: PASS com `1 passed` test file e `7 passed` tests (o `it.each` gera três casos).

- [ ] **Step 5: Refatorar apenas se os testes permanecerem verdes**

Revise os dois arquivos sem ampliar o escopo. Mantenha obrigatoriamente: `CatalogProduct` como única entrada; formatter `pt-BR`/`BRL`; limite `stock >= 1`; fallback delegado a `ProductImage`; `Card`, `Badge` e `LinkButton`; link explícito `/produtos/${product.id}`; classes `min-w-0`, `truncate`/`break-words` e `mt-auto`; nenhuma informação comercial adicional. Se nenhuma simplificação concreta for necessária, não altere o GREEN.

Run novamente:

```powershell
cd frontend
npm run test -- src/features/catalog/components/ProductCard.test.tsx
```

Expected: PASS com `1 passed` test file e `7 passed` tests.

- [ ] **Step 6: Executar gates locais e registrar baselines globais**

Run:

```powershell
cd frontend
npm run typecheck
npm run lint
npm run test -- src/features/catalog/components/ProductCard.test.tsx
npm run test
npm run build
```

Expected:

- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- teste focado: PASS, `1 passed` file e `7 passed` tests.
- suíte global: a nova suíte passa; pode continuar com somente a falha baseline de data em `authStore.test.ts` descrita em Global Constraints. Se surgir qualquer outra falha, corrigir somente regressões da TASK-051 antes de avançar.
- build global: pode continuar com somente a falha baseline de top-level await descrita em Global Constraints. Se surgir qualquer outro erro, corrigir somente regressões da TASK-051 antes de avançar.

Confirme também:

```powershell
git diff -- frontend/public/mockServiceWorker.js
git status --short
```

Expected: o diff de `mockServiceWorker.js` permanece exatamente a alteração preexistente; status contém os dois novos arquivos do ProductCard e a modificação preexistente do worker, sem arquivos inesperados.

- [ ] **Step 7: Commitar somente a implementação da TASK-051**

```powershell
git add frontend/src/features/catalog/components/ProductCard.tsx frontend/src/features/catalog/components/ProductCard.test.tsx
git diff --cached --check
git diff --cached --name-only
git commit -m "feat(TASK-051): Implementar ProductCard."
```

Expected: `git diff --cached --check` sem saída; `git diff --cached --name-only` lista somente os dois arquivos do ProductCard; commit criado com sucesso. `frontend/public/mockServiceWorker.js` continua modificado e não staged.
