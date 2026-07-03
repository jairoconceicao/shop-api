namespace aspnet_api.Api.Contracts.Requests.Carrinhos;

public sealed record CreateCarrinhoRequest
{
    public long ClienteId { get; init; }
}


