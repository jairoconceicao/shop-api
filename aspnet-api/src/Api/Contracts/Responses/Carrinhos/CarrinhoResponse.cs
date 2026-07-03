namespace aspnet_api.Api.Contracts.Responses.Carrinhos;

public sealed record CarrinhoResponse
{
    public long ClienteId { get; init; }

    public long CarrinhoId { get; init; }

    public DateTime DataCarrinho { get; init; }

    public IReadOnlyCollection<CarrinhoItemResponse> Items { get; init; } = [];
}


