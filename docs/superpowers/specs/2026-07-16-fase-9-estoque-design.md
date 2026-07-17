# Fase 9 — Estoque — Design

**Data:** 2026-07-16
**Status:** PLANNED
**Dependências:** Fases 1-8 (DONE)

## 1. Contexto

As entidades `Estoque` e `MovimentoEstoque` já existem no domínio (`src/Domain/Entities/`), assim como suas implementações de repositório (`IEstoqueRepository`, `IMovimentoEstoqueRepository`) e mapeamentos EF Core. No entanto, não há use cases, endpoints, nem comportamento de domínio implementado — as entidades são passivas (apenas `Reconstituir()`).

## 2. Objetivo

Expor API de consulta e movimentação de estoque, fechando o gap entre o domínio modelado e a API pública.

## 3. Design do Domínio

### Estoque

```csharp
public class Estoque
{
    public long Id { get; private set; }
    public long ProdutoId { get; private set; }
    public string Descricao { get; private set; }
    public decimal QuantidadeMinima { get; private set; }
    public decimal QuantidadeMaxima { get; private set; }
    public decimal QuantidadeAtual { get; private set; }
    public DateTime DataMovimento { get; private set; }

    public static Result<Estoque> Criar(long produtoId, string descricao, decimal quantidadeMinima, decimal quantidadeMaxima, decimal quantidadeInicial);
    public Result RegistrarEntrada(decimal quantidade, string descricao);
    public Result RegistrarSaida(decimal quantidade, string descricao);
    public Result AtualizarLimites(decimal quantidadeMinima, decimal quantidadeMaxima);

    public bool EstaAbaixoDoMinimo => QuantidadeAtual <= QuantidadeMinima;
}
```

**Regras de domínio:**
- `quantidadeMinima` deve ser >= 0
- `quantidadeMaxima` deve ser > `quantidadeMinima`
- `quantidadeInicial` deve estar entre `quantidadeMinima` e `quantidadeMaxima`
- Saída não pode resultar em quantidade negativa
- Toda movimentação gera um `MovimentoEstoque` vinculado
- Cada entrada/saída atualiza `DataMovimento`

### MovimentoEstoque

```csharp
public class MovimentoEstoque
{
    public long Id { get; private set; }
    public long EstoqueId { get; private set; }
    public DateTime DataMovimento { get; private set; }
    public MovimentoTipo Tipo { get; private set; }
    public decimal Quantidade { get; private set; }
    public string Descricao { get; private set; }

    public static Result<MovimentoEstoque> Criar(long estoqueId, MovimentoTipo tipo, decimal quantidade, string descricao);
}
```

**Regras:**
- `quantidade` deve ser > 0
- `descricao` é obrigatória (max 500 chars)
- `Tipo` é `IN` (entrada) ou `OU` (saída)

## 4. Use Cases

### ConsultarEstoqueQuery

```
Input:  produtoId (long)
Output: Result<EstoqueResponse>

EstoqueResponse {
    produtoId, descricao, quantidadeAtual, quantidadeMinima,
    quantidadeMaxima, estaAbaixoDoMinimo, dataUltimoMovimento
}
```

- Se não existir estoque para o produto, retorna `Result.NotFound`
- Validador: `produtoId > 0`

### RegistrarMovimentacaoCommand

```
Input:  produtoId, tipo (IN|OU), quantidade, descricao
Output: Result<MovimentacaoResponse>

MovimentacaoResponse { movimentoId, estoqueId, tipo, quantidade, dataMovimento }
```

- Busca ou cria estoque para o produto
- Se tipo = OU, valida que quantidade atual >= quantidade solicitada
- Cria `MovimentoEstoque` e atualiza `Estoque`
- Usa `IUnitOfWork` para atomicidade

### ListarMovimentacoesQuery

```
Input:  produtoId, page, size
Output: Result<PagedResult<MovimentacaoItemResponse>>

MovimentacaoItemResponse { movimentoId, tipo, quantidade, descricao, dataMovimento }
```

- Paginado, ordenado por `dataMovimento DESC`
- Validador: `produtoId > 0`, `page >= 1`, `size entre 1 e 100`

## 5. Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/v1/estoque/{produtoId}` | Anonymous | Consultar estoque do produto |
| POST | `/api/v1/estoque/movimentacao` | Required | Registrar entrada/saída |
| GET | `/api/v1/estoque/movimentacoes/{produtoId}` | Required | Listar movimentações |

### Contratos

**GET /estoque/{produtoId} Response:**
```json
{
  "status": true,
  "data": {
    "produtoId": 1,
    "descricao": "Estoque principal",
    "quantidadeAtual": 42.0,
    "quantidadeMinima": 5.0,
    "quantidadeMaxima": 100.0,
    "estaAbaixoDoMinimo": false,
    "dataUltimoMovimento": "2026-07-16T10:00:00-03:00"
  }
}
```

**POST /estoque/movimentacao Request:**
```json
{
  "produtoId": 1,
  "tipo": "OU",
  "quantidade": 3.0,
  "descricao": "Venda via pedido #123"
}
```

## 6. Frontend

### ProductCard — Indicador de estoque

- Abaixo do preço: tag "Disponível: X un." em `text-shop-text-muted`
- Se `estaAbaixoDoMinimo`: tag de alerta "Últimas unidades!" em `text-shop-warning` com badge

### ProductDetailPage — Seção de estoque

- Nova seção abaixo do preço: "Estoque: X unidades disponíveis"
- Se baixo estoque: alerta visual com texto "Restam apenas X unidades"

### Hooks

- `useStockQuery(produtoId)` — React Query, stale time 60s
- Cache key factory: `stockKeys.detail(produtoId)`

## 7. Testes

| Camada | O que testar |
|--------|-------------|
| Domínio | `Estoque.Criar()` com parâmetros válidos/inválidos; `RegistrarEntrada()`/`RegistrarSaida()` com quantidade > atual, = atual, < atual; `EstaAbaixoDoMinimo` |
| Aplicação | Validators rejeitam produtoId <= 0, quantidade <= 0; Command handler retorna `NotFound` para produto sem estoque; Query handler retorna paginação correta |
| API | GET retorna 404 para produto sem estoque; POST retorna 422 para quantidade inválida; POST retorna 201 com movimento criado |
| Frontend | MSW mock retorna estoque; indicador aparece no card e detail; alerta de baixo estoque renderiza |
