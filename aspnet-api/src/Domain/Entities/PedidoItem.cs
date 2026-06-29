namespace aspnet_api.Domain.Entities;

public class PedidoItem
{
    public long ProdutoId { get; set; }
    public decimal Quantidade { get; set; }

    public PedidoItem()
    {
    }

    public PedidoItem(long produtoId, decimal quantidade)
    {
        ProdutoId = produtoId;
        Quantidade = quantidade;
    }
}
