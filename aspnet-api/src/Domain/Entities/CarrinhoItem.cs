namespace aspnet_api.Domain.Entities;

public class CarrinhoItem
{
    public long ProdutoId { get; set; }
    public decimal Quantidade { get; set; }

    public CarrinhoItem()
    {
    }

    public CarrinhoItem(long produtoId, decimal quantidade)
    {
        ProdutoId = produtoId;
        Quantidade = quantidade;
    }
}
