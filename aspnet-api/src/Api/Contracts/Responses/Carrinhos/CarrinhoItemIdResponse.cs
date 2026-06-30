namespace aspnet_api.Api.Contracts.Responses.Carrinhos;

public sealed record CarrinhoItemIdResponse
{
    public long ItemId { get; init; }

    public long ProdutoId { get; init; }
}
