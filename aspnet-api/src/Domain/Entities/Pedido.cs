using aspnet_api.Domain.ValueObjects;
using aspnet_api.src.Domain.Enums;

namespace aspnet_api.Domain.Entities;

public class Pedido
{
    public long Id { get; private set; }
    public DateTime DataPedido { get; private set; }
    public long ClienteId { get; private set; }
    public long? CarrinhoId { get; private set; }
    public Endereco? EnderecoEntrega { get; private set; }
    public StatusPedido Status { get; private set; } = StatusPedido.Criado;
    public List<PedidoItem> Items { get; private set; } = [];

    public Pedido()
    {
    }

    public Pedido(long id, DateTime dataPedido, long clienteId, long? carrinhoId, Endereco? enderecoEntrega, StatusPedido statusPedido, List<PedidoItem>? items)
    {
        Id = id;
        DataPedido = dataPedido;
        ClienteId = clienteId;
        CarrinhoId = carrinhoId;
        EnderecoEntrega = enderecoEntrega;
        Status = statusPedido;
        Items = items ?? [];
    }
}
