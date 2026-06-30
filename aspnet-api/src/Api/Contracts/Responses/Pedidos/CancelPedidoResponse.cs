namespace aspnet_api.Api.Contracts.Responses.Pedidos;

public sealed record CancelPedidoResponse
{
    public bool Status { get; init; }

    public string Message { get; init; } = string.Empty;

    public long PedidoId { get; init; }
}
