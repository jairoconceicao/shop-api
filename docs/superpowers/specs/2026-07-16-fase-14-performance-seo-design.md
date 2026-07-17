# Fase 14 — Performance & SEO — Design

**Data:** 2026-07-16
**Status:** PLANNED
**Dependências:** Nenhuma (otimização transversal)

## 1. Contexto

O frontend atual tem boa performance de desenvolvimento, mas não foi otimizado para produção: sem code splitting completo, sem meta tags dinâmicas, sem PWA, sem otimização de imagens. O backend não retorna cache headers e pode ter queries não otimizadas.

## 2. Objetivo

Otimizar para métricas de produção: Lighthouse Performance >= 90, SEO >= 90, TTI < 3s, bundle sem chunks acima de 250KB.

## 3. Frontend

### 3.1 Code Splitting

Já parcialmente implementado com `React.lazy` em algumas rotas. Expandir para todas.

```tsx
const CheckoutPage = lazy(() => import('@/features/checkout/pages/CheckoutPage'));
const OrdersPage = lazy(() => import('@/features/orders/pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/features/orders/pages/OrderDetailPage'));
const OrderConfirmationPage = lazy(() => import('@/features/checkout/pages/OrderConfirmationPage'));
const CustomerDataPage = lazy(() => import('@/features/customer/pages/CustomerDataPage'));
const CustomerPasswordPage = lazy(() => import('@/features/customer/pages/CustomerPasswordPage'));
// + Admin pages quando existirem
```

- Manter Home, Login, Registration e ProductDetail como eager (páginas de entrada)
- Suspense com fallback: `PageSkeleton` (placeholder de layout)

### 3.2 Otimização de Imagens

**Componente `ProductImage`:**
- `loading="lazy"` nativo (não usar Intersection Observer)
- `decoding="async"` para não bloquear render
- Dimensões explícitas (`width`/`height`) para evitar CLS
- Placeholder: div com `bg-shop-surface-muted` e cor do produto como fallback
- Formato: referência WebP com fallback PNG/JPEG via `<picture>` (quando backend suportar)

**Vite config:**
```ts
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        query: ['@tanstack/react-query'],
        forms: ['react-hook-form', 'zod'],
      }
    }
  }
}
```

### 3.3 Meta Tags Dinâmicas

**Biblioteca:** `react-helmet-async`

Páginas com meta tags:
| Página | Title | Description |
|--------|-------|-------------|
| Home | Shop API — Encontre produtos para o seu dia a dia | Loja virtual com ofertas em tecnologia, games e periféricos |
| Produto | {titulo} — Shop API | {titulo} por R$ {preco} na Shop API. {descricao truncada} |
| Login | Entrar — Shop API | Acesse sua conta na Shop API para gerenciar seus pedidos |
| Pedidos | Meus Pedidos — Shop API | Consulte e acompanhe seus pedidos na Shop API |

### 3.4 PWA

**Biblioteca:** `vite-plugin-pwa`

```ts
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Shop API',
    short_name: 'ShopAPI',
    theme_color: '#2563eb',
    background_color: '#f8fafc',
    display: 'standalone',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https?:\/\/.*\/api\/v1\/produto.*/,
        handler: 'NetworkFirst',
        options: { cacheName: 'api-catalog', expiration: { maxEntries: 100, maxAgeSeconds: 300 } }
      }
    ]
  }
})
```

### 3.5 Bundle Analysis

- `rollup-plugin-visualizer` para gerar `stats.html`
- Meta: nenhum chunk > 250KB (exceto vendor)
- Identificar duplicações com `vite-plugin-checker`

### 3.6 Prefetching

- Links de categorias no header: `<link rel="prefetch">` para JS chunks
- Links de produto no grid: prefetch no hover (delay 100ms)

## 4. Backend

### 4.1 Cache Headers

**Endpoints públicos:**
| Endpoint | Cache-Control |
|----------|--------------|
| `GET /api/v1/produto` | `public, max-age=30` |
| `GET /api/v1/produto/{id}` | `public, max-age=60` |
| `GET /api/v1/categoria` | `public, max-age=300` (5 min) |

**ETag:**
- Gerado com hash do conteúdo da resposta (SHA256 dos dados serializados)
- Middleware que compara `If-None-Match` do request e retorna 304 se igual

### 4.2 Query Optimization

- Todas as queries de leitura: `.AsNoTracking()`
- Projeções com `.Select()` em vez de carregar entidade completa e mapear depois
- Revisar N+1: queries de catálogo devem incluir `.Include(p => p.Categoria)` ou usar projeção
- Índices adicionais (já listados no Backlog Contínuo)

### 4.3 Compressão

```csharp
builder.Services.AddResponseCompression(options => {
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});
```

## 5. Testes

- Lighthouse CI no pipeline (budget: performance >= 85, seo >= 85)
- Bundle analysis report no CI (warning se chunk > 250KB)
- Testes de cache: response contém `Cache-Control` e `ETag`; `If-None-Match` retorna 304
- Testes de compressão: response contém `Content-Encoding: br` ou `gzip`
