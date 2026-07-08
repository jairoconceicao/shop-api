namespace aspnet_api.Api.Contracts.Responses.Produtos;

public sealed record CategoriaProdutoResponse
{
    public long Id { get; init; }

    public string Titulo { get; init; } = string.Empty;
}
