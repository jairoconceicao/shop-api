using aspnet_api.Domain.Enums;

namespace aspnet_api.Domain.Entities;

public class MovimentoEstoque
{
    public long Id { get; set; }
    public long EstoqueId { get; set; }
    public DateTime DataMovimento { get; set; }
    public int OperacaoCodigo { get; set; }
    public MovimentoTipo OperacaoTipo { get; set; }
    public string? OperacaoDescricao { get; set; }
    public decimal Quantidade { get; set; }

    public MovimentoEstoque()
    {
    }

    public MovimentoEstoque(long id, long estoqueId, DateTime dataMovimento, int operacaoCodigo, MovimentoTipo operacaoTipo, string? operacaoDescricao, decimal quantidade)
    {
        Id = id;
        EstoqueId = estoqueId;
        DataMovimento = dataMovimento;
        OperacaoCodigo = operacaoCodigo;
        OperacaoTipo = operacaoTipo;
        OperacaoDescricao = operacaoDescricao;
        Quantidade = quantidade;
    }
}
