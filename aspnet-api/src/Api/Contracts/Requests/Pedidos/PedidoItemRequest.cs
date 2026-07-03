namespace aspnet_api.Api.Contracts.Requests.Pedidos;

public sealed record PedidoItemRequest
{
    public long? ItemId { get; init; }

    public long ProdutoId { get; init; }

    public decimal Quantidade { get; init; }

    public decimal ValorUnitario { get; init; }
}


