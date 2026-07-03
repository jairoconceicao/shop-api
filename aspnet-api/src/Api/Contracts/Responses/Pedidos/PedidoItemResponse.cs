namespace aspnet_api.Api.Contracts.Responses.Pedidos;

public sealed record PedidoItemResponse
{
    public long ItemId { get; init; }

    public long ProdutoId { get; init; }

    public decimal Quantidade { get; init; }

    public decimal ValorUnitario { get; init; }
}


