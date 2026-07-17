# Fase 13 — Experiência do Cliente — Design

**Data:** 2026-07-16
**Status:** PLANNED
**Dependências:** Fase 3 (Catálogo), Fase 5 (Checkout), Fase 7 (Pedidos)

## 1. Contexto

O MVP atual cobre o fluxo básico de e-commerce. Esta fase adiciona diferenciais competitivos inspirados em Mercado Livre, KaBuM e Magalu: filtros avançados, favoritos, múltiplos endereços, seleção visual de pagamento, timeline de pedido e avaliações.

## 2. Objetivo

Melhorar a experiência de descoberta de produtos e fidelização com features de conveniência e engajamento.

## 3. Funcionalidades

### 3.1 Filtros Avançados no Catálogo

**Endpoint existente:** `GET /api/v1/produto`

**Novos parâmetros de query:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `precoMin` | decimal | Preço mínimo |
| `precoMax` | decimal | Preço máximo |
| `ordenarPor` | string | `preco_asc`, `preco_desc`, `nome_asc`, `nome_desc`, `recentes` |
| `page` | int | Página (existente) |
| `size` | int | Tamanho (existente) |
| `searchword` | string | Busca textual (existente) |

**Frontend:**
- Select de ordenação no topo da listagem
- Inputs de faixa de preço com máscara monetária (R$)
- Estado dos filtros na URL (`?ordenarPor=preco_asc&precoMin=100&precoMax=500`)
- Botão "Limpar filtros" quando houver filtros ativos

### 3.2 Lista de Desejos (Favoritos)

**Entidade:**
```csharp
public class Favorito
{
    public long Id { get; private set; }
    public long ClienteId { get; private set; }
    public long ProdutoId { get; private set; }
    public DateTime AdicionadoEm { get; private set; }
}
```

**Endpoints:**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/favorito` | Listar favoritos do cliente |
| POST | `/api/v1/favorito/{produtoId}` | Adicionar produto |
| DELETE | `/api/v1/favorito/{produtoId}` | Remover produto |
| GET | `/api/v1/favorito/check/{produtoId}` | Verificar se está favoritado |

**Frontend:**
- Botão coração no `ProductCard` e `ProductDetailPage`
- Coração preenchido (`text-shop-danger`) quando favoritado, contorno quando não
- Página `/favoritos` com grid de produtos favoritados
- Query com invalidação otimista ao favoritar/desfavoritar

### 3.3 Múltiplos Endereços

**Endpoint expandido:**
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/cliente/{clienteId}/enderecos` | Listar endereços |
| POST | `/api/v1/cliente/{clienteId}/enderecos` | Adicionar endereço |
| PUT | `/api/v1/cliente/{clienteId}/enderecos/{enderecoId}` | Editar endereço |
| DELETE | `/api/v1/cliente/{clienteId}/enderecos/{enderecoId}` | Remover endereço |

**Regras:**
- Cliente pode ter até 5 endereços
- Pelo menos 1 endereço deve existir sempre (não pode excluir o último)
- Endereço principal (`isPrincipal: true`) — usado como padrão no checkout

**Frontend:**
- Seção "Endereços" na área do cliente (nova rota: `/minha-conta/enderecos`)
- Card por endereço com badge "Principal", botões editar/excluir
- Modal de formulário de endereço (reutiliza validação existente do cadastro)
- No checkout: dropdown para selecionar endereço de entrega entre os cadastrados

### 3.4 Seleção Visual de Pagamento

**Frontend (sem mudanças no backend):**
- No checkout, substituir select nativo por cards clicáveis:
  - Card Pix: ícone QR code, descrição "Pagamento instantâneo"
  - Card Cartão: ícone de cartão, "Crédito em até 10x" (simulado)
  - Card Boleto: ícone de boleto, "Vencimento em 3 dias úteis"
- Card selecionado: borda `shop-primary`, fundo `shop-primary-soft`
- Animação de transição ao selecionar

### 3.5 Timeline de Status do Pedido

**Frontend (dados já disponíveis na API):**
- Componente `OrderTimeline` na `OrderDetailPage`
- Steps horizontais:
  1. Pedido Criado (check green)
  2. Pagamento Confirmado (simulado)
  3. Em Separação (simulado)
  4. Em Transporte (simulado)
  5. Entregue (simulado)
- Step atual: destacado em `shop-primary`
- Steps futuros: cinza claro
- Status "Cancelado": substitui timeline por banner de cancelamento

### 3.6 Avaliações de Produto

**Entidade:**
```csharp
public class Avaliacao
{
    public long Id { get; private set; }
    public long ClienteId { get; private set; }
    public long ProdutoId { get; private set; }
    public int Nota { get; private set; }        // 1 a 5
    public string Comentario { get; private set; } // opcional, max 1000 chars
    public DateTime CriadaEm { get; private set; }
}
```

**Endpoints:**
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/v1/avaliacao/produto/{produtoId}` | Anonymous | Listar avaliações |
| POST | `/api/v1/avaliacao` | Required | Criar avaliação |
| GET | `/api/v1/avaliacao/produto/{produtoId}/media` | Anonymous | Média das notas |

**Regras:**
- Cliente só pode avaliar um produto uma vez
- Nota entre 1 e 5
- Comentário opcional

**Frontend:**
- `ProductRating` no `ProductCard`: estrelas + nota média + contagem
- Seção "Avaliações" na `ProductDetailPage`: lista de avaliações + formulário
- Formulário: 5 estrelas clicáveis + textarea comentário

## 4. Tasks e Ordem de Execução

A ordem recomendada é:
1. Filtros avançados (BACK-UX-001, FRONT-UX-001) — menor esforço, alto impacto
2. Seleção visual de pagamento (FRONT-UX-004) — apenas frontend
3. Timeline de pedido (FRONT-UX-005) — apenas frontend
4. Múltiplos endereços (BACK-UX-006, FRONT-UX-003)
5. Favoritos (BACK-UX-002..003, FRONT-UX-002)
6. Avaliações (BACK-UX-004..005, FRONT-UX-006)

## 5. Testes

| Funcionalidade | Testes |
|----------------|--------|
| Filtros | Query com combinação de filtros; ordenação consistente; página vazia com filtros restritivos |
| Favoritos | Adicionar/remover idempotente; listar vazio; MSW mock de toggle otimista |
| Endereços | CRUD completo; validação de limite (5); exclusão do último bloqueada |
| Pagamento | Seleção visual alterna valor do campo; card selecionado destacado |
| Timeline | Cada status mapeia para step correto; pedido cancelado mostra banner |
| Avaliações | Nota 1-5 válida; duplicata bloqueada; média calculada corretamente |
| E2E | Fluxo: filtrar catálogo → favoritar → ir para favoritos → checkout com endereço selecionado → avaliar produto |
