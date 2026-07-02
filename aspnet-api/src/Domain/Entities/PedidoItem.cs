namespace aspnet_api.Domain.Entities;

public class PedidoItem
{
    public long Id { get; private set; }
    public long ProdutoId { get; private set; }
    public decimal Quantidade { get; private set; }
    public decimal ValorUnitario { get; private set; }

    public PedidoItem()
    {
    }

    public PedidoItem(long produtoId, decimal quantidade, decimal valorUnitario)
        : this(0, produtoId, quantidade, valorUnitario)
    {
    }

    public PedidoItem(long id, long produtoId, decimal quantidade, decimal valorUnitario)
    {
        Id = id;
        ProdutoId = produtoId;
        Quantidade = quantidade;
        ValorUnitario = valorUnitario;
    }
}
