using aspnet_api.Domain.Entities;
using Xunit;

namespace aspnet_api.Tests.Domain.Entities;

public class EstoqueTests
{
    public class Constructor
    {
        [Fact]
        public void DeveCriarEstoqueComTodosOsCampos()
        {
            var dataMovimento = DateTime.Now;
            var estoque = Estoque.Reconstituir(1, "Descricao", dataMovimento, 10, 5m, 100m, 50m);

            Assert.Equal(1, estoque.Id);
            Assert.Equal("Descricao", estoque.Descricao);
            Assert.Equal(dataMovimento, estoque.DataMovimento);
            Assert.Equal(10, estoque.ProdutoId);
            Assert.Equal(5m, estoque.QuantidadeMinima);
            Assert.Equal(100m, estoque.QuantidadeMaxima);
            Assert.Equal(50m, estoque.QuantidadeAtual);
        }

        [Fact]
        public void DeveCriarEstoqueComParametrolessConstructor()
        {
            var estoque = new Estoque();

            Assert.Equal(0, estoque.Id);
            Assert.Null(estoque.Descricao);
            Assert.Equal(default, estoque.DataMovimento);
            Assert.Equal(0, estoque.ProdutoId);
            Assert.Equal(0m, estoque.QuantidadeMinima);
            Assert.Equal(0m, estoque.QuantidadeMaxima);
            Assert.Equal(0m, estoque.QuantidadeAtual);
        }
    }
}


