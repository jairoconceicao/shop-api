using aspnet_api.Domain.Entities;
using Xunit;

namespace aspnet_api.Tests.Domain.Entities;

public class PedidoItemTests
{
    public class Constructor
    {
        [Fact]
        public void DeveCriarPedidoItemComParametrolessConstructor()
        {
            var item = new PedidoItem();

            Assert.Equal(0, item.Id);
            Assert.Equal(0, item.ProdutoId);
            Assert.Equal(0m, item.Quantidade);
            Assert.Equal(0m, item.ValorUnitario);
        }

        [Fact]
        public void DeveCriarPedidoItemComTresParametros()
        {
            var item = new PedidoItem(10, 2.5m, 50.0m);

            Assert.Equal(0, item.Id);
            Assert.Equal(10, item.ProdutoId);
            Assert.Equal(2.5m, item.Quantidade);
            Assert.Equal(50.0m, item.ValorUnitario);
        }

        [Fact]
        public void DeveCriarPedidoItemComQuatroParametros()
        {
            var item = new PedidoItem(5, 10, 3.0m, 25.0m);

            Assert.Equal(5, item.Id);
            Assert.Equal(10, item.ProdutoId);
            Assert.Equal(3.0m, item.Quantidade);
            Assert.Equal(25.0m, item.ValorUnitario);
        }
    }
}
