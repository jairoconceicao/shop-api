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

    public static PedidoItem Create(long produtoId, decimal quantidade, decimal valorUnitario)
    {
        return new PedidoItem
        {
            ProdutoId = produtoId,
            Quantidade = quantidade,
            ValorUnitario = valorUnitario
        };
    }

    public static PedidoItem Reconstituir(long produtoId, decimal quantidade, decimal valorUnitario)
    {
        return Reconstituir(0, produtoId, quantidade, valorUnitario);
    }

    public static PedidoItem Reconstituir(long id, long produtoId, decimal quantidade, decimal valorUnitario)
    {
        return new PedidoItem
        {
            Id = id,
            ProdutoId = produtoId,
            Quantidade = quantidade,
            ValorUnitario = valorUnitario
        };
    }
}


