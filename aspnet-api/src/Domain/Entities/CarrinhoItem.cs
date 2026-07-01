namespace aspnet_api.Domain.Entities;

public class CarrinhoItem
{
    public long Id { get; private set; }
    public long ProdutoId { get; private set; }
    public decimal Quantidade { get; private set; }
    public decimal ValorUnitario { get; private set; }

    public CarrinhoItem()
    {
    }

    public CarrinhoItem(long produtoId, decimal quantidade, decimal valorUnitario)
        : this(0, produtoId, quantidade, valorUnitario)
    {
    }

    public CarrinhoItem(long id, long produtoId, decimal quantidade, decimal valorUnitario)
    {
        Id = id;
        ProdutoId = produtoId;
        Quantidade = quantidade;
        ValorUnitario = valorUnitario;
    }

    public void AtualizarQuantidade(decimal quantidade)
    {
        Quantidade = quantidade;
    }

    public void IncrementarQuantidade(decimal quantidade)
    {
        Quantidade += quantidade;
    }

    public void AtualizarValorUnitario(decimal valorUnitario)
    {
        ValorUnitario = valorUnitario;
    }
}
