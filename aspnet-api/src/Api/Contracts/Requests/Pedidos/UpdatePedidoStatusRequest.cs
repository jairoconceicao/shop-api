using aspnet_api.Api.Contracts.Shared;

namespace aspnet_api.Api.Contracts.Requests.Pedidos;

public sealed record UpdatePedidoStatusRequest
{
    public PedidoStatus Status { get; init; }
}


