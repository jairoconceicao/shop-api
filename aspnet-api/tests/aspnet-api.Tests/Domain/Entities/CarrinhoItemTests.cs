using aspnet_api.Domain.Entities;
using Xunit;

namespace aspnet_api.Tests.Domain.Entities;

public class CarrinhoItemTests
{
    public class Constructor
    {
        [Fact]
        public void DeveCriarCarrinhoItemComParametrolessConstructor()
        {
            var item = new CarrinhoItem();

            Assert.Equal(0, item.Id);
            Assert.Equal(0, item.ProdutoId);
            Assert.Equal(0m, item.Quantidade);
            Assert.Equal(0m, item.ValorUnitario);
        }

        [Fact]
        public void DeveCriarCarrinhoItemComTresParametros()
        {
            var item = new CarrinhoItem(10, 2.5m, 50.0m);

            Assert.Equal(0, item.Id);
            Assert.Equal(10, item.ProdutoId);
            Assert.Equal(2.5m, item.Quantidade);
            Assert.Equal(50.0m, item.ValorUnitario);
        }

        [Fact]
        public void DeveCriarCarrinhoItemComQuatroParametros()
        {
            var item = new CarrinhoItem(5, 10, 3.0m, 25.0m);

            Assert.Equal(5, item.Id);
            Assert.Equal(10, item.ProdutoId);
            Assert.Equal(3.0m, item.Quantidade);
            Assert.Equal(25.0m, item.ValorUnitario);
        }
    }

    public class AtualizarQuantidade
    {
        [Fact]
        public void DeveAtualizarQuantidade()
        {
            var item = new CarrinhoItem(10, 2.0m, 50.0m);

            item.AtualizarQuantidade(5.0m);

            Assert.Equal(5.0m, item.Quantidade);
        }

        [Fact]
        public void DeveAtualizarQuantidadeParaZero()
        {
            var item = new CarrinhoItem(10, 2.0m, 50.0m);

            item.AtualizarQuantidade(0m);

            Assert.Equal(0m, item.Quantidade);
        }
    }

    public class IncrementarQuantidade
    {
        [Fact]
        public void DeveIncrementarQuantidade()
        {
            var item = new CarrinhoItem(10, 2.0m, 50.0m);

            item.IncrementarQuantidade(3.0m);

            Assert.Equal(5.0m, item.Quantidade);
        }

        [Fact]
        public void DeveIncrementarQuantidadePartindoDeZero()
        {
            var item = new CarrinhoItem();

            item.IncrementarQuantidade(1.5m);

            Assert.Equal(1.5m, item.Quantidade);
        }
    }

    public class AtualizarValorUnitario
    {
        [Fact]
        public void DeveAtualizarValorUnitario()
        {
            var item = new CarrinhoItem(10, 2.0m, 50.0m);

            item.AtualizarValorUnitario(75.0m);

            Assert.Equal(75.0m, item.ValorUnitario);
        }

        [Fact]
        public void DeveAtualizarValorUnitarioParaZero()
        {
            var item = new CarrinhoItem(10, 2.0m, 50.0m);

            item.AtualizarValorUnitario(0m);

            Assert.Equal(0m, item.ValorUnitario);
        }
    }
}
