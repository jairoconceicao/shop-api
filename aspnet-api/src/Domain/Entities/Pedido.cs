using aspnet_api.Domain.ValueObjects;

namespace aspnet_api.Domain.Entities;

public class Pedido
{
    public long Id { get; set; }
    public DateTime DataPedido { get; set; }
    public long ClienteId { get; set; }
    public long? CarrinhoId { get; set; }
    public Endereco? EnderecoEntrega { get; set; }
    public List<PedidoItem> Items { get; set; } = new();

    public Pedido()
    {
    }

    public Pedido(long id, DateTime dataPedido, long clienteId, long? carrinhoId, Endereco? enderecoEntrega, List<PedidoItem>? items)
    {
        Id = id;
        DataPedido = dataPedido;
        ClienteId = clienteId;
        CarrinhoId = carrinhoId;
        EnderecoEntrega = enderecoEntrega;
        Items = items ?? new List<PedidoItem>();
    }
}
