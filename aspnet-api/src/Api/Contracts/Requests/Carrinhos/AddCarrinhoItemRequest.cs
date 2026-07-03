namespace aspnet_api.Api.Contracts.Requests.Carrinhos;

public sealed record AddCarrinhoItemRequest
{
    public long ProdutoId { get; init; }

    public decimal Quantidade { get; init; }

    public decimal ValorUnitario { get; init; }
}


