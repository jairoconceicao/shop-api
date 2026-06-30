namespace aspnet_api.Domain.Entities;

public class PedidoItem
{
    public long ProdutoId { get; private set; }
    public decimal Quantidade { get; private set; }
    public decimal ValorUnitario { get; private set; }

    public PedidoItem()
    {
    }

    public PedidoItem(long produtoId, decimal quantidade, decimal valorUnitario)
    {
        ProdutoId = produtoId;
        Quantidade = quantidade;
        ValorUnitario = valorUnitario;
    }
}
