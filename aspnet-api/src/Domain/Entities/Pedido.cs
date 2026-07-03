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
    public FormaPagamento FormaPagamento { get; private set; } = FormaPagamento.Pix;
    public StatusPedido Status { get; private set; } = StatusPedido.Criado;
    public List<PedidoItem> Items { get; private set; } = [];

    public Pedido()
    {
    }

    public static Pedido Create(
        long clienteId,
        long? carrinhoId,
        Endereco? enderecoEntrega,
        DateTime dataPedido,
        FormaPagamento formaPagamento,
        StatusPedido statusPedido,
        IEnumerable<PedidoItem>? items)
    {
        return new Pedido
        {
            ClienteId = clienteId,
            CarrinhoId = carrinhoId,
            EnderecoEntrega = enderecoEntrega,
            DataPedido = dataPedido,
            FormaPagamento = formaPagamento,
            Status = statusPedido,
            Items = items?.ToList() ?? []
        };
    }

    public static Pedido Reconstituir(
        long id,
        DateTime dataPedido,
        long clienteId,
        long? carrinhoId,
        Endereco? enderecoEntrega,
        StatusPedido statusPedido,
        IEnumerable<PedidoItem>? items)
    {
        return Reconstituir(id, dataPedido, clienteId, carrinhoId, enderecoEntrega, FormaPagamento.Pix, statusPedido, items);
    }

    public static Pedido Reconstituir(
        long id,
        DateTime dataPedido,
        long clienteId,
        long? carrinhoId,
        Endereco? enderecoEntrega,
        FormaPagamento formaPagamento,
        StatusPedido statusPedido,
        IEnumerable<PedidoItem>? items)
    {
        return new Pedido
        {
            Id = id,
            DataPedido = dataPedido,
            ClienteId = clienteId,
            CarrinhoId = carrinhoId,
            EnderecoEntrega = enderecoEntrega,
            FormaPagamento = formaPagamento,
            Status = statusPedido,
            Items = items?.ToList() ?? []
        };
    }

    public PedidoItem? GetItemById(long itemId)
    {
        return Items.FirstOrDefault(item => item.Id == itemId);
    }

    public PedidoItem AdicionarItem(PedidoItem item)
    {
        ArgumentNullException.ThrowIfNull(item);

        Items.Add(item);
        return item;
    }

    public void AtualizarStatus(StatusPedido status)
    {
        Status = status;
    }

    public void Cancelar()
    {
        Status = StatusPedido.Cancelado;
    }

    public decimal CalcularValorTotal()
    {
        return Items.Sum(item => item.Quantidade * item.ValorUnitario);
    }
}


