using aspnet_api.Api.Contracts.Responses.Shared;
using aspnet_api.Api.Contracts.Shared;

namespace aspnet_api.Api.Contracts.Responses.Pedidos;

public sealed record PedidoResponse
{
    public long PedidoId { get; init; }

    public long CarrinhoId { get; init; }

    public long ClienteId { get; init; }

    public EnderecoResponse EnderecoEntrega { get; init; } = new();

    public DateTime DataPedido { get; init; }

    public FormaPagamento FormaPagamento { get; init; }

    public PedidoStatus Status { get; init; }

    public IReadOnlyCollection<PedidoItemResponse> Items { get; init; } = [];
}


