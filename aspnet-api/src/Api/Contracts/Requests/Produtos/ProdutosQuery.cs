namespace aspnet_api.Api.Contracts.Requests.Produtos;

public sealed record ProdutosQuery
{
    public int Page { get; init; } = 1;

    public int Size { get; init; } = 20;
}
