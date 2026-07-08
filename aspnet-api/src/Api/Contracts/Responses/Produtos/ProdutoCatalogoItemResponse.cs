namespace aspnet_api.Api.Contracts.Responses.Produtos;

public sealed record ProdutoCatalogoItemResponse
{
    public long ProdutoId { get; init; }

    public string Titulo { get; init; } = string.Empty;

    public string? Thumb { get; init; }

    public decimal Preco { get; init; }

    public decimal Estoque { get; init; }

    public CategoriaProdutoResponse? Categoria { get; init; }
}
