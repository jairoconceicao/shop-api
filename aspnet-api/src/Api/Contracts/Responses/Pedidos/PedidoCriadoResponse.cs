using aspnet_api.Api.Contracts.Shared;

namespace aspnet_api.Api.Contracts.Responses.Pedidos;

public sealed record PedidoCriadoResponse
{
    public long PedidoId { get; init; }

    public long ClienteId { get; init; }

    public DateTime DataPedido { get; init; }

    public FormaPagamento FormaPagamento { get; init; }

    public PedidoStatus Status { get; init; }

    public decimal ValorTotal { get; init; }
}
