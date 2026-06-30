using aspnet_api.Api.Contracts.Responses.Shared;
using aspnet_api.Api.Contracts.Shared;

namespace aspnet_api.Api.Contracts.Responses.Pedidos;

public sealed record PedidoResponse
{
    public long Id { get; init; }

    public PedidoClienteResponse Cliente { get; init; } = new();

    public EnderecoResponse EnderecoEntrega { get; init; } = new();

    public FormaPagamento FormaPagamento { get; init; }

    public DateTime DataPedido { get; init; }

    public PedidoStatus Status { get; init; }

    public IReadOnlyCollection<PedidoItemResponse> Items { get; init; } = [];
}
