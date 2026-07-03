namespace aspnet_api.Api.Contracts.Requests.Carrinhos;

public sealed record UpdateCarrinhoItemRequest
{
    public decimal Quantidade { get; init; }
}


