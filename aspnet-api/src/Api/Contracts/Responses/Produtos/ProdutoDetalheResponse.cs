namespace aspnet_api.Api.Contracts.Responses.Produtos;

public sealed record ProdutoDetalheResponse
{
    public long ProdutoId { get; init; }

    public string Titulo { get; init; } = string.Empty;

    public string? Descricao { get; init; }

    public string? Modelo { get; init; }

    public string? Foto { get; init; }

    public decimal Preco { get; init; }

    public decimal Estoque { get; init; }

    public CategoriaProdutoResponse? Categoria { get; init; }
}
