using aspnet_api.Domain.Entities;
using aspnet_api.Domain.Enums;
using Xunit;

namespace aspnet_api.Tests.Domain.Entities;

public class MovimentoEstoqueTests
{
    public class Constructor
    {
        [Fact]
        public void DeveCriarMovimentoEstoqueComTodosOsCampos()
        {
            var dataMovimento = DateTime.Now;
            var movimento = new MovimentoEstoque(1, 10, dataMovimento, 100, MovimentoTipo.IN, "Entrada", 50m);

            Assert.Equal(1, movimento.Id);
            Assert.Equal(10, movimento.EstoqueId);
            Assert.Equal(dataMovimento, movimento.DataMovimento);
            Assert.Equal(100, movimento.OperacaoCodigo);
            Assert.Equal(MovimentoTipo.IN, movimento.OperacaoTipo);
            Assert.Equal("Entrada", movimento.OperacaoDescricao);
            Assert.Equal(50m, movimento.Quantidade);
        }

        [Fact]
        public void DeveCriarMovimentoEstoqueComParametrolessConstructor()
        {
            var movimento = new MovimentoEstoque();

            Assert.Equal(0, movimento.Id);
            Assert.Equal(0, movimento.EstoqueId);
            Assert.Equal(default, movimento.DataMovimento);
            Assert.Equal(0, movimento.OperacaoCodigo);
            Assert.Equal(default(MovimentoTipo), movimento.OperacaoTipo);
            Assert.Null(movimento.OperacaoDescricao);
            Assert.Equal(0m, movimento.Quantidade);
        }

        [Theory]
        [InlineData(MovimentoTipo.IN)]
        [InlineData(MovimentoTipo.OU)]
        public void DeveCriarMovimentoEstoqueComDiferentesTipos(MovimentoTipo tipo)
        {
            var movimento = new MovimentoEstoque(1, 10, DateTime.Now, 100, tipo, "Descricao", 50m);

            Assert.Equal(tipo, movimento.OperacaoTipo);
        }
    }
}
