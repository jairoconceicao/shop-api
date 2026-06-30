using aspnet_api.Domain.Enums;

namespace aspnet_api.Domain.Entities;

public class MovimentoEstoque
{
    public long Id { get; private set; }
    public long EstoqueId { get; private set; }
    public DateTime DataMovimento { get; private set; }
    public int OperacaoCodigo { get; private set; }
    public MovimentoTipo OperacaoTipo { get; private set; }
    public string? OperacaoDescricao { get; private set; }
    public decimal Quantidade { get; private set; }

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
