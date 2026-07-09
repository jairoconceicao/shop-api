using aspnet_api.Api.Contracts.Requests.Shared;
using aspnet_api.Api.Contracts.Shared;

namespace aspnet_api.Api.Contracts.Requests.Pedidos;

public sealed record CreatePedidoRequest
{
    public EnderecoRequest EnderecoEntrega { get; init; } = new();

    public FormaPagamento FormaPagamento { get; init; }

    public DateTime DataPedido { get; init; }

    public List<PedidoItemRequest> Items { get; init; } = [];
}
