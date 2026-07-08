# Shop API — Proposta de UI para Loja Virtual

## 1. Conceito visual

A **Shop API** é uma loja virtual criada para testar novas tecnologias, mas com estrutura visual e funcional suficiente para operar em cenários reais de produção.

A interface deve transmitir:

* **Confiança**, por se tratar de uma loja funcional;
* **Agilidade**, com foco em navegação rápida e compra simples;
* **Clareza**, por também servir como vitrine técnica;
* **Apelo comercial**, com ofertas, busca evidente e carrinho sempre acessível.

A inspiração visual vem de lojas como **Mercado Livre**, **KaBuM** e **Magalu**, mas com identidade própria, mais suave, limpa e moderna.

---

# 2. Tema visual com Tailwind CSS 4

A Shop API deve utilizar uma paleta suave, harmônica e comercial, com tons claros para fundo, azul como cor principal de ação e laranja para destaque de ofertas.

## 2.1 Arquivo global de estilo

Exemplo sugerido para `app.css`, `globals.css` ou arquivo global equivalente:

```css
@import "tailwindcss";

@theme {
  /* Brand */
  --color-shop-primary: #2563eb;
  --color-shop-primary-hover: #1d4ed8;
  --color-shop-primary-soft: #dbeafe;

  --color-shop-secondary: #f97316;
  --color-shop-secondary-hover: #ea580c;
  --color-shop-secondary-soft: #ffedd5;

  /* Base */
  --color-shop-background: #f8fafc;
  --color-shop-surface: #ffffff;
  --color-shop-surface-muted: #f1f5f9;
  --color-shop-border: #e2e8f0;

  /* Text */
  --color-shop-text: #0f172a;
  --color-shop-text-muted: #64748b;
  --color-shop-text-light: #94a3b8;
  --color-shop-text-inverted: #ffffff;

  /* Semantic */
  --color-shop-success: #16a34a;
  --color-shop-success-soft: #dcfce7;

  --color-shop-warning: #f59e0b;
  --color-shop-warning-soft: #fef3c7;

  --color-shop-danger: #dc2626;
  --color-shop-danger-soft: #fee2e2;

  /* E-commerce */
  --color-shop-price: #0f172a;
  --color-shop-discount: #f97316;
  --color-shop-free-shipping: #16a34a;
  --color-shop-rating: #f59e0b;
}
```

---

## 2.2 Uso das cores no Tailwind

| Contexto                 | Classe Tailwind                              |
| ------------------------ | -------------------------------------------- |
| Fundo da aplicação       | `bg-shop-background`                         |
| Cards e superfícies      | `bg-shop-surface`                            |
| Superfície secundária    | `bg-shop-surface-muted`                      |
| Borda de cards e inputs  | `border-shop-border`                         |
| Texto principal          | `text-shop-text`                             |
| Texto secundário         | `text-shop-text-muted`                       |
| Texto discreto           | `text-shop-text-light`                       |
| Botão principal          | `bg-shop-primary text-shop-text-inverted`    |
| Hover do botão principal | `hover:bg-shop-primary-hover`                |
| Botão de oferta          | `bg-shop-secondary text-shop-text-inverted`  |
| Hover do botão de oferta | `hover:bg-shop-secondary-hover`              |
| Badge de oferta          | `bg-shop-secondary-soft text-shop-secondary` |
| Preço                    | `text-shop-price`                            |
| Desconto                 | `text-shop-discount`                         |
| Frete grátis             | `text-shop-free-shipping`                    |
| Avaliação                | `text-shop-rating`                           |
| Mensagem de sucesso      | `bg-shop-success-soft text-shop-success`     |
| Mensagem de alerta       | `bg-shop-warning-soft text-shop-warning`     |
| Mensagem de erro         | `bg-shop-danger-soft text-shop-danger`       |

---

# 3. Diretrizes de UI

## Mobile First

A interface deve ser pensada primeiro para telas pequenas. O mobile precisa ser direto, rápido e com foco em compra.

Princípios:

* Botões grandes;
* Busca sempre visível;
* Carrinho sempre acessível;
* Cards simples;
* Menos texto por tela;
* Navegação inferior opcional;
* Ações principais acima da dobra.

## Desktop

No desktop, a interface pode usar melhor o espaço horizontal.

Princípios:

* Header completo;
* Busca centralizada;
* Menu de categorias;
* Grid com mais produtos;
* Carrinho no canto superior direito;
* Área do cliente com menu lateral;
* Página de produto em duas colunas.

---

# 4. Componentes globais

## Header mobile

```text
┌─────────────────────────────────┐
│ Shop API              🛒        │
│ ┌─────────────────────────────┐ │
│ │ Buscar produto...        🔍 │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

Classes sugeridas:

```html
<header class="bg-shop-surface border-b border-shop-border">
  <div class="flex items-center justify-between px-4 py-3">
    <h1 class="text-xl font-bold text-shop-primary">Shop API</h1>

    <button class="relative text-shop-text">
      🛒
    </button>
  </div>

  <div class="px-4 pb-4">
    <input
      type="search"
      placeholder="Buscar produto..."
      class="w-full rounded-xl border border-shop-border bg-shop-background px-4 py-3 text-shop-text placeholder:text-shop-text-light"
    />
  </div>
</header>
```

## Header desktop

```text
┌───────────────────────────────────────────────────────────────┐
│ Shop API   [Buscar produtos...]   Ofertas  Categorias  🛒 👤 │
└───────────────────────────────────────────────────────────────┘
```

Classes sugeridas:

```html
<header class="sticky top-0 z-50 border-b border-shop-border bg-shop-surface">
  <div class="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
    <h1 class="text-2xl font-bold text-shop-primary">Shop API</h1>

    <input
      type="search"
      placeholder="Buscar produtos..."
      class="flex-1 rounded-xl border border-shop-border bg-shop-background px-4 py-3 text-shop-text placeholder:text-shop-text-light"
    />

    <nav class="flex items-center gap-4 text-sm font-medium text-shop-text-muted">
      <a class="hover:text-shop-primary" href="/">Ofertas</a>
      <a class="hover:text-shop-primary" href="/products">Categorias</a>
      <a class="hover:text-shop-primary" href="/cart">🛒</a>
      <a class="hover:text-shop-primary" href="/account">👤</a>
    </nav>
  </div>
</header>
```

---

# 5. Página de Login

## Objetivo

Permitir que o cliente acesse sua conta com e-mail e senha, incluindo a opção de manter-se conectado.

## Mobile

```text
┌───────────────────────────────┐
│ Shop API                      │
│ Bem-vindo de volta            │
│ Acesse sua conta para comprar │
│                               │
│ E-mail                        │
│ [_________________________]   │
│                               │
│ Senha                         │
│ [_________________________]   │
│                               │
│ [ ] Manter-me conectado       │
│                               │
│ [Entrar]                      │
│                               │
│ Esqueci minha senha           │
│ Criar nova conta              │
└───────────────────────────────┘
```

Classes principais:

```html
<main class="min-h-screen bg-shop-background px-4 py-8">
  <section class="mx-auto max-w-sm rounded-2xl bg-shop-surface p-6 shadow-sm">
    <h1 class="text-2xl font-bold text-shop-primary">Shop API</h1>
    <h2 class="mt-6 text-xl font-semibold text-shop-text">Bem-vindo de volta</h2>
    <p class="mt-1 text-sm text-shop-text-muted">Acesse sua conta para comprar.</p>

    <form class="mt-6 space-y-4">
      <input class="w-full rounded-xl border border-shop-border px-4 py-3" placeholder="E-mail" />
      <input class="w-full rounded-xl border border-shop-border px-4 py-3" placeholder="Senha" type="password" />

      <label class="flex items-center gap-2 text-sm text-shop-text-muted">
        <input type="checkbox" />
        Manter-me conectado
      </label>

      <button class="w-full rounded-xl bg-shop-primary px-4 py-3 font-semibold text-shop-text-inverted hover:bg-shop-primary-hover">
        Entrar
      </button>
    </form>
  </section>
</main>
```

## Desktop

Layout em duas colunas:

* Coluna esquerda com mensagem institucional;
* Coluna direita com card de login;
* Fundo `bg-shop-background`;
* Card `bg-shop-surface`;
* Botão principal `bg-shop-primary`.

---

# 6. Página Home

## Objetivo

Exibir ofertas, campo de busca, categorias e catálogo de produtos.

## Mobile

```text
┌───────────────────────────────┐
│ Shop API                  🛒  │
│ ┌───────────────────────────┐ │
│ │ Buscar produto...      🔍 │ │
│ └───────────────────────────┘ │
├───────────────────────────────┤
│ 🔥 Ofertas da semana          │
│ ┌───────────────────────────┐ │
│ │ Banner promocional        │ │
│ │ Até 40% OFF               │ │
│ └───────────────────────────┘ │
├───────────────────────────────┤
│ Categorias                    │
│ [Celulares] [Games] [Casa]    │
├───────────────────────────────┤
│ Produtos em destaque          │
│ [Produto] [Produto]           │
│ [Produto] [Produto]           │
└───────────────────────────────┘
```

Classes principais:

```html
<main class="bg-shop-background">
  <section class="px-4 py-4">
    <div class="rounded-2xl bg-shop-primary-soft p-5">
      <span class="rounded-full bg-shop-secondary-soft px-3 py-1 text-sm font-medium text-shop-secondary">
        Oferta da semana
      </span>

      <h2 class="mt-4 text-2xl font-bold text-shop-text">
        Até 40% OFF em produtos selecionados
      </h2>

      <button class="mt-4 rounded-xl bg-shop-primary px-4 py-3 font-semibold text-shop-text-inverted hover:bg-shop-primary-hover">
        Ver ofertas
      </button>
    </div>
  </section>
</main>
```

## Desktop

```text
┌───────────────────────────────────────────────────────────────┐
│ Shop API   [Buscar produtos...]   Ofertas Categorias  🛒 👤  │
├───────────────────────────────────────────────────────────────┤
│ Menu categorias: Celulares | Games | Informática | Casa       │
├───────────────────────────────────────────────────────────────┤
│ Banner principal                                              │
├───────────────────────────────────────────────────────────────┤
│ Ofertas relâmpago                                             │
│ [Produto] [Produto] [Produto] [Produto]                       │
├───────────────────────────────────────────────────────────────┤
│ Catálogo                                                      │
│ [Produto] [Produto] [Produto] [Produto]                       │
└───────────────────────────────────────────────────────────────┘
```

Grid recomendado:

```html
<section class="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
  <!-- ProductCard -->
</section>
```

---

# 7. Card de Produto

## Estrutura visual

```text
┌────────────────────┐
│ [Imagem]           │
│ Nome do Produto    │
│ ★★★★★ 4.8          │
│ R$ 1.999,90        │
│ 10x de R$ 199,99   │
│ Frete grátis       │
│ [Comprar]          │
└────────────────────┘
```

Classes sugeridas:

```html
<article class="rounded-2xl border border-shop-border bg-shop-surface p-3 shadow-sm transition hover:shadow-md">
  <div class="aspect-square rounded-xl bg-shop-surface-muted"></div>

  <h3 class="mt-3 line-clamp-2 text-sm font-medium text-shop-text">
    Smartphone XPTO 128GB
  </h3>

  <p class="mt-1 text-xs text-shop-rating">★★★★★ 4.8</p>

  <p class="mt-2 text-lg font-bold text-shop-price">
    R$ 1.999,90
  </p>

  <p class="text-xs text-shop-text-muted">
    10x de R$ 199,99
  </p>

  <p class="mt-1 text-xs font-medium text-shop-free-shipping">
    Frete grátis
  </p>

  <button class="mt-3 w-full rounded-xl bg-shop-primary px-3 py-2 text-sm font-semibold text-shop-text-inverted hover:bg-shop-primary-hover">
    Comprar
  </button>
</article>
```

---

# 8. Página Detalhes do Produto

## Objetivo

Apresentar informações completas do produto e conduzir o cliente para compra ou carrinho.

## Mobile

```text
┌───────────────────────────────┐
│ ← Produto                 🛒  │
├───────────────────────────────┤
│ [Imagem grande do produto]    │
│ ● ○ ○                         │
├───────────────────────────────┤
│ Notebook Ultra 15             │
│ ★★★★★ 4.9 | 128 avaliações    │
│                               │
│ R$ 3.499,90                   │
│ 10x de R$ 349,99 sem juros    │
│                               │
│ Frete grátis                  │
│ Chegará em até 3 dias úteis   │
│                               │
│ [Comprar agora]               │
│ [Adicionar ao carrinho]       │
└───────────────────────────────┘
```

Classes principais:

```html
<section class="bg-shop-background">
  <div class="bg-shop-surface">
    <div class="aspect-square bg-shop-surface-muted"></div>
  </div>

  <div class="space-y-4 px-4 py-5">
    <h1 class="text-xl font-semibold text-shop-text">Notebook Ultra 15</h1>

    <p class="text-sm text-shop-rating">★★★★★ 4.9 | 128 avaliações</p>

    <div>
      <p class="text-3xl font-bold text-shop-price">R$ 3.499,90</p>
      <p class="text-sm text-shop-text-muted">10x de R$ 349,99 sem juros</p>
    </div>

    <p class="font-medium text-shop-free-shipping">Frete grátis</p>

    <button class="w-full rounded-xl bg-shop-primary px-4 py-3 font-semibold text-shop-text-inverted hover:bg-shop-primary-hover">
      Comprar agora
    </button>

    <button class="w-full rounded-xl border border-shop-primary px-4 py-3 font-semibold text-shop-primary">
      Adicionar ao carrinho
    </button>
  </div>
</section>
```

## Desktop

```text
┌──────────────────────────────────────────────────────────────┐
│ Breadcrumb: Home > Informática > Notebook                    │
├───────────────────────────────┬──────────────────────────────┤
│ [Imagem grande]               │ Notebook Ultra 15            │
│ [mini] [mini] [mini]          │ R$ 3.499,90                  │
│                               │ Frete grátis                 │
│                               │ [Comprar agora]              │
│                               │ [Adicionar ao carrinho]      │
├──────────────────────────────────────────────────────────────┤
│ Descrição | Especificações | Avaliações                      │
└──────────────────────────────────────────────────────────────┘
```

---

# 9. Página Carrinho

## Objetivo

Permitir revisar produtos, alterar quantidade, remover itens e iniciar o checkout.

O carrinho deve ser acessível por botão ou ícone no canto superior direito de todas as páginas.

## Mobile

```text
┌───────────────────────────────┐
│ ← Carrinho                🛒  │
├───────────────────────────────┤
│ Produto no carrinho           │
│ ┌───────────────────────────┐ │
│ │ [Img] Fone Bluetooth      │ │
│ │ R$ 199,90                 │ │
│ │ Quantidade [-] 1 [+]      │ │
│ │ Remover                   │ │
│ └───────────────────────────┘ │
├───────────────────────────────┤
│ Resumo                        │
│ Produtos        R$ 499,70     │
│ Frete           R$ 0,00       │
│ Total           R$ 499,70     │
│                               │
│ [Finalizar compra]            │
└───────────────────────────────┘
```

Classes principais:

```html
<section class="bg-shop-background px-4 py-5">
  <h1 class="text-xl font-semibold text-shop-text">Meu carrinho</h1>

  <div class="mt-4 space-y-3">
    <article class="rounded-2xl border border-shop-border bg-shop-surface p-4">
      <h2 class="font-medium text-shop-text">Fone Bluetooth</h2>
      <p class="mt-1 font-bold text-shop-price">R$ 199,90</p>

      <button class="mt-2 text-sm font-medium text-shop-danger">
        Remover
      </button>
    </article>
  </div>

  <aside class="mt-5 rounded-2xl bg-shop-surface p-4 shadow-sm">
    <h2 class="font-semibold text-shop-text">Resumo</h2>

    <div class="mt-3 space-y-2 text-sm text-shop-text-muted">
      <div class="flex justify-between">
        <span>Produtos</span>
        <span>R$ 499,70</span>
      </div>

      <div class="flex justify-between">
        <span>Frete</span>
        <span class="text-shop-free-shipping">R$ 0,00</span>
      </div>

      <div class="flex justify-between border-t border-shop-border pt-3 text-lg font-bold text-shop-text">
        <span>Total</span>
        <span>R$ 499,70</span>
      </div>
    </div>

    <button class="mt-4 w-full rounded-xl bg-shop-primary px-4 py-3 font-semibold text-shop-text-inverted hover:bg-shop-primary-hover">
      Finalizar compra
    </button>
  </aside>
</section>
```

## Desktop

```text
┌──────────────────────────────────────────────────────────────┐
│ Meu carrinho                                                 │
├──────────────────────────────────────────┬───────────────────┤
│ Produtos                                 │ Resumo do pedido  │
│ [Produto]                                │ Produtos R$ 499   │
│ [Produto]                                │ Frete    R$ 0     │
│                                          │ Total    R$ 499   │
│                                          │ [Finalizar compra]│
└──────────────────────────────────────────┴───────────────────┘
```

---

# 10. Página Área do Cliente

## Objetivo

Permitir que o cliente altere seus dados, altere sua senha e consulte seus pedidos.

## Mobile

```text
┌───────────────────────────────┐
│ ← Minha conta             🛒  │
├───────────────────────────────┤
│ Olá, Cliente                  │
│ cliente@email.com             │
├───────────────────────────────┤
│ [Meus dados]                  │
│ [Alterar senha]               │
│ [Meus pedidos]                │
│ [Endereços]                   │
│ [Sair da conta]               │
├───────────────────────────────┤
│ Últimos pedidos               │
│ Pedido #1023                  │
│ Status: Em transporte         │
│ Total: R$ 399,90              │
│ [Ver detalhes]                │
└───────────────────────────────┘
```

Classes principais:

```html
<section class="bg-shop-background px-4 py-5">
  <div class="rounded-2xl bg-shop-surface p-4 shadow-sm">
    <h1 class="text-xl font-semibold text-shop-text">Minha conta</h1>
    <p class="mt-1 text-sm text-shop-text-muted">cliente@email.com</p>
  </div>

  <nav class="mt-4 space-y-2">
    <a class="block rounded-xl bg-shop-surface px-4 py-3 font-medium text-shop-text" href="/account/profile">
      Meus dados
    </a>

    <a class="block rounded-xl bg-shop-surface px-4 py-3 font-medium text-shop-text" href="/account/password">
      Alterar senha
    </a>

    <a class="block rounded-xl bg-shop-surface px-4 py-3 font-medium text-shop-text" href="/account/orders">
      Meus pedidos
    </a>

    <button class="block w-full rounded-xl bg-shop-danger-soft px-4 py-3 text-left font-medium text-shop-danger">
      Sair da conta
    </button>
  </nav>
</section>
```

## Desktop

```text
┌──────────────────────────────────────────────────────────────┐
│ Minha conta                                                  │
├───────────────────────┬──────────────────────────────────────┤
│ Menu lateral          │ Conteúdo                             │
│ Meus dados            │ Dados pessoais                       │
│ Alterar senha         │ Nome                                 │
│ Meus pedidos          │ E-mail                               │
│ Endereços             │ Telefone                             │
│ Sair                  │ [Salvar alterações]                  │
└───────────────────────┴──────────────────────────────────────┘
```

---

# 11. Navegação recomendada

## Mobile

```text
┌───────────────────────────────────────────────┐
│  🏠 Home   🔎 Busca   🧾 Pedidos   👤 Conta │
└───────────────────────────────────────────────┘
```

Classes sugeridas:

```html
<nav class="fixed bottom-0 left-0 right-0 border-t border-shop-border bg-shop-surface">
  <div class="grid grid-cols-4 text-center text-xs text-shop-text-muted">
    <a class="py-3 hover:text-shop-primary" href="/">Home</a>
    <a class="py-3 hover:text-shop-primary" href="/products">Busca</a>
    <a class="py-3 hover:text-shop-primary" href="/account/orders">Pedidos</a>
    <a class="py-3 hover:text-shop-primary" href="/account">Conta</a>
  </div>
</nav>
```

## Desktop

```text
Shop API | Busca | Ofertas | Categorias | Meus Pedidos | Carrinho | Conta
```

---

# 12. Rotas sugeridas

| Página              | Rota                |
| ------------------- | ------------------- |
| Login               | `/login`            |
| Home                | `/`                 |
| Catálogo            | `/products`         |
| Detalhes do Produto | `/products/:id`     |
| Carrinho            | `/cart`             |
| Área do Cliente     | `/account`          |
| Meus Dados          | `/account/profile`  |
| Alterar Senha       | `/account/password` |
| Meus Pedidos        | `/account/orders`   |

---

# 13. Componentes reutilizáveis

```text
/components
  /layout
    Header
    MobileBottomNavigation
    Footer
    PageContainer

  /product
    ProductCard
    ProductGrid
    ProductGallery
    ProductPrice
    ProductRating
    ProductSpecifications

  /cart
    CartButton
    CartItem
    CartSummary
    QuantitySelector

  /customer
    AccountMenu
    ProfileForm
    PasswordForm
    OrdersList
    OrderStatusBadge

  /forms
    Input
    Checkbox
    Button
    Alert
    FormError
```

---

# 14. Breakpoints recomendados

| Breakpoint       | Uso                            |
| ---------------- | ------------------------------ |
| `0px - 480px`    | Mobile pequeno                 |
| `481px - 768px`  | Mobile grande / tablet pequeno |
| `769px - 1024px` | Tablet / desktop compacto      |
| `1025px+`        | Desktop completo               |

## Grid de produtos

| Dispositivo    | Colunas |
| -------------- | ------: |
| Mobile pequeno |       2 |
| Mobile grande  |       2 |
| Tablet         |       3 |
| Desktop        |       4 |
| Desktop largo  |       5 |

Classes sugeridas:

```html
<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
  <!-- produtos -->
</div>
```

---

# 15. Estados importantes da interface

## Produto indisponível

```html
<div class="rounded-xl bg-shop-warning-soft p-4 text-shop-warning">
  Produto sem estoque.
</div>

<button class="mt-3 rounded-xl border border-shop-warning px-4 py-3 font-semibold text-shop-warning">
  Avise-me quando chegar
</button>
```

## Carrinho vazio

```html
<section class="flex min-h-[60vh] flex-col items-center justify-center bg-shop-background px-4 text-center">
  <h1 class="text-2xl font-bold text-shop-text">Seu carrinho está vazio</h1>

  <p class="mt-2 text-shop-text-muted">
    Explore nossas ofertas e encontre produtos incríveis.
  </p>

  <a
    href="/products"
    class="mt-5 rounded-xl bg-shop-primary px-5 py-3 font-semibold text-shop-text-inverted hover:bg-shop-primary-hover"
  >
    Ver produtos
  </a>
</section>
```

## Cliente não logado

```html
<div class="rounded-2xl bg-shop-surface p-5 text-center shadow-sm">
  <h2 class="text-xl font-semibold text-shop-text">Entre para acessar sua conta</h2>

  <p class="mt-2 text-sm text-shop-text-muted">
    Você precisa estar logado para consultar seus pedidos e alterar seus dados.
  </p>

  <a
    href="/login"
    class="mt-5 inline-block rounded-xl bg-shop-primary px-5 py-3 font-semibold text-shop-text-inverted hover:bg-shop-primary-hover"
  >
    Entrar
  </a>
</div>
```

## Erro no login

```html
<div class="rounded-xl bg-shop-danger-soft p-3 text-sm font-medium text-shop-danger">
  E-mail ou senha inválidos. Verifique seus dados e tente novamente.
</div>
```

---

# 16. Resumo da proposta

A Shop API deve utilizar uma UI mobile first com:

* Tema suave baseado em Tailwind CSS 4;
* Azul como cor principal de ação;
* Laranja para ofertas e chamadas promocionais;
* Fundo claro e limpo;
* Cards brancos com bordas suaves;
* Busca em destaque;
* Carrinho sempre no canto superior direito;
* Home com ofertas, categorias e catálogo;
* Página de produto focada em imagem, preço e compra;
* Carrinho simples e objetivo;
* Área do cliente organizada por dados, senha e pedidos.

A proposta deixa a Shop API com aparência de loja virtual real, boa usabilidade e base visual consistente para implementação em React, Next.js, Vue, Angular ou qualquer stack frontend moderna.
