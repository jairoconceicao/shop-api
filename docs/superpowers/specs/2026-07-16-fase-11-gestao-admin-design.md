# Fase 11 — Gestão/Admin — Design

**Data:** 2026-07-16
**Status:** PLANNED
**Dependências:** Fase 3 (Catálogo), Fase 9 (Estoque)

## 1. Contexto

Atualmente não há endpoints para criar, editar ou excluir produtos, categorias e estoque via API. Toda gestão depende de scripts SQL manuais ou seeds de desenvolvimento. Esta fase implementa um painel administrativo completo.

## 2. Objetivo

CRUD administrativo com autorização por role `Admin`, endpoints RESTful e painel frontend para gestão de produtos, categorias e estoque.

## 3. Autorização

### Policy `Admin`

```csharp
options.AddPolicy("Admin", policy =>
    policy.RequireClaim("role", "Admin"));
```

- Role incluída no JWT durante autenticação
- Usuário admin seed: `admin@shopapi.com` com senha definida via variável de ambiente `ADMIN_SEED_PASSWORD`
- Endpoints admin prefixados com `/api/v1/admin/`

## 4. Use Cases

### Admin Produtos

| Use Case | Input | Output |
|----------|-------|--------|
| `CriarProdutoCommand` | titulo, descricao, modelo, preco, foto, thumb, categoriaProdutoId | Result\<ProdutoIdResponse\> |
| `EditarProdutoCommand` | produtoId + campos editáveis | Result\<ProdutoIdResponse\> |
| `ExcluirProdutoCommand` | produtoId | Result\<ProdutoIdResponse\> |

**Regras:**
- `preco` > 0
- `categoriaProdutoId` deve existir
- `titulo` obrigatório (max 200 chars)
- Exclusão verifica se há itens de carrinho/pedido ativos vinculados (soft check, warning)

### Admin Categorias

| Use Case | Input | Output |
|----------|-------|--------|
| `CriarCategoriaCommand` | titulo, descricao | Result\<CategoriaIdResponse\> |
| `EditarCategoriaCommand` | categoriaId, titulo, descricao | Result\<CategoriaIdResponse\> |
| `ExcluirCategoriaCommand` | categoriaId | Result\<CategoriaIdResponse\> |

**Regras:**
- `titulo` obrigatório e único
- Exclusão bloqueada se houver produtos vinculados (retorna `Result.Conflict` com lista de produtos)

### Admin Estoque

| Use Case | Input | Output |
|----------|-------|--------|
| `CriarEstoqueCommand` | produtoId, descricao, quantidadeMinima, quantidadeMaxima, quantidadeInicial | Result\<EstoqueIdResponse\> |
| `EditarEstoqueCommand` | estoqueId, descricao, quantidadeMinima, quantidadeMaxima | Result\<EstoqueIdResponse\> |

**Regras:**
- Um produto só pode ter um registro de estoque
- `quantidadeInicial` deve estar entre mínima e máxima

## 5. Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/v1/admin/produto` | Admin | Criar produto |
| PUT | `/api/v1/admin/produto/{id}` | Admin | Editar produto |
| DELETE | `/api/v1/admin/produto/{id}` | Admin | Excluir produto |
| POST | `/api/v1/admin/categoria` | Admin | Criar categoria |
| PUT | `/api/v1/admin/categoria/{id}` | Admin | Editar categoria |
| DELETE | `/api/v1/admin/categoria/{id}` | Admin | Excluir categoria |
| POST | `/api/v1/admin/estoque` | Admin | Criar estoque |
| PUT | `/api/v1/admin/estoque/{id}` | Admin | Editar estoque |

## 6. Frontend

### Layout Admin

- Rota base: `/admin`
- Menu lateral fixo (desktop) / drawer (mobile):
  - Produtos
  - Categorias
  - Estoque
- Header com "Admin" label + link "Voltar para loja"
- Protegido por `AdminGuard`: verifica claim `role` no JWT, redireciona para `/` se não for admin

### Página de Produtos

- Tabela com colunas: Thumb, Título, Categoria, Preço, Estoque, Ações
- Ações: Editar (ícone lápis), Excluir (ícone lixeira com modal de confirmação)
- Botão "Novo produto" no topo
- Modal/Drawer de formulário para criação e edição (mesmo componente)

### Página de Categorias

- Tabela simples: Título, Descrição, Qtde Produtos, Ações
- Modal de confirmação ao excluir com produtos vinculados (mostra nomes)

### Página de Estoque

- Tabela: Produto, Quantidade Atual, Mín, Máx, Status, Ações
- Status: badge verde (ok), amarelo (baixo), vermelho (zerado)
- Ao criar, busca produto por ID (campo numérico)

### Componentes

```
/features/admin/
  AdminGuard.tsx
  AdminLayout.tsx
  AdminProductsPage.tsx
  AdminCategoriesPage.tsx
  AdminStockPage.tsx
  components/
    ProductForm.tsx       (reutilizado criar/editar)
    CategoryForm.tsx
    StockForm.tsx
    ConfirmDialog.tsx
    AdminTable.tsx
```

### Hooks

- `useAdminProductsQuery()`, `useCreateProductMutation()`, `useUpdateProductMutation()`, `useDeleteProductMutation()`
- `useAdminCategoriesQuery()`, `useCreateCategoryMutation()`, `useUpdateCategoryMutation()`, `useDeleteCategoryMutation()`
- `useAdminStockQuery()`, `useCreateStockMutation()`, `useUpdateStockMutation()`
- Invalidação cruzada: editar produto → invalida catálogo público

## 7. Testes

| Camada | O que testar |
|--------|-------------|
| Domínio | Validação de preço > 0, título obrigatório, unicidade de estoque por produto |
| Aplicação | Validators de formulário admin; Command com role não-admin retorna Forbidden; Exclusão de categoria com produtos vinculados retorna Conflict |
| API | Endpoints admin retornam 401 sem token, 403 com token não-admin; CRUD retorna respostas corretas |
| Frontend MSW | AdminGuard redireciona não-admin; Formulários criam/editam/excluem; Modal de confirmação aparece ao excluir |
| Frontend E2E | Login admin → criar produto → ver no catálogo → editar → excluir |
