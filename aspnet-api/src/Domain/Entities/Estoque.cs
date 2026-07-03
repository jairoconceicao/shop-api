namespace aspnet_api.Domain.Entities;

public class Estoque
{
    public long Id { get; private set; }
    public string? Descricao { get; private set; }
    public DateTime DataMovimento { get; private set; }
    public long ProdutoId { get; private set; }
    public decimal QuantidadeMinima { get; private set; }
    public decimal QuantidadeMaxima { get; private set; }
    public decimal QuantidadeAtual { get; private set; }

    public Estoque()
    {
    }

    public static Estoque Reconstituir(long id, string? descricao, DateTime dataMovimento, long produtoId, decimal quantidadeMinima, decimal quantidadeMaxima, decimal quantidadeAtual)
    {
        return new Estoque
        {
            Id = id,
            Descricao = descricao,
            DataMovimento = dataMovimento,
            ProdutoId = produtoId,
            QuantidadeMinima = quantidadeMinima,
            QuantidadeMaxima = quantidadeMaxima,
            QuantidadeAtual = quantidadeAtual
        };
    }
}


