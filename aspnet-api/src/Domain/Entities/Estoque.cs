namespace aspnet_api.Domain.Entities;

public class Estoque
{
    public long Id { get; set; }
    public string? Descricao { get; set; }
    public DateTime DataMovimento { get; set; }
    public long ProdutoId { get; set; }
    public decimal QuantidadeMinima { get; set; }
    public decimal QuantidadeMaxima { get; set; }
    public decimal QuantidadeAtual { get; set; }

    public Estoque()
    {
    }

    public Estoque(long id, string? descricao, DateTime dataMovimento, long produtoId, decimal quantidadeMinima, decimal quantidadeMaxima, decimal quantidadeAtual)
    {
        Id = id;
        Descricao = descricao;
        DataMovimento = dataMovimento;
        ProdutoId = produtoId;
        QuantidadeMinima = quantidadeMinima;
        QuantidadeMaxima = quantidadeMaxima;
        QuantidadeAtual = quantidadeAtual;
    }
}
