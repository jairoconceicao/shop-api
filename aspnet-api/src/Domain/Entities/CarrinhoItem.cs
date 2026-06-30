namespace aspnet_api.Domain.Entities;

public class CarrinhoItem
{
    public long ProdutoId { get; private set; }
    public decimal Quantidade { get; private set; }
    public decimal ValorUnitario { get; private set; }

    public CarrinhoItem()
    {
    }

    public CarrinhoItem(long produtoId, decimal quantidade, decimal valorUnitario)
    {
        ProdutoId = produtoId;
        Quantidade = quantidade;
        ValorUnitario = valorUnitario;
    }
}
