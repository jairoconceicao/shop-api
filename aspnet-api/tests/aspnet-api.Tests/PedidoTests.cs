using aspnet_api.Domain.Entities;
using aspnet_api.Domain.ValueObjects;
using aspnet_api.src.Domain.Enums;
using Xunit;

namespace aspnet_api.Tests.Domain.Entities;

public class PedidoTests
{
    public class Constructor
    {
        [Fact]
        public void DeveCriarPedidoComTodosOsCampos()
        {
            var dataPedido = DateTime.Now;
            var endereco = new Endereco("Rua", "123", null, "12345678", "Centro", "Cidade", "SP");
            var items = new List<PedidoItem>
            {
                new(1, 2, 50.0m)
            };

            var pedido = new Pedido(1, dataPedido, 10, 5, endereco, StatusPedido.Criado, items);

            Assert.Equal(1, pedido.Id);
            Assert.Equal(dataPedido, pedido.DataPedido);
            Assert.Equal(10, pedido.ClienteId);
            Assert.Equal(5, pedido.CarrinhoId);
            Assert.Equal(endereco, pedido.EnderecoEntrega);
            Assert.Equal(StatusPedido.Criado, pedido.Status);
            Assert.Single(pedido.Items);
        }

        [Fact]
        public void DeveCriarPedidoComParametrolessConstructor()
        {
            var pedido = new Pedido();

            Assert.Equal(0, pedido.Id);
            Assert.Equal(default, pedido.DataPedido);
            Assert.Equal(0, pedido.ClienteId);
            Assert.Null(pedido.CarrinhoId);
            Assert.Null(pedido.EnderecoEntrega);
            Assert.Equal(StatusPedido.Criado, pedido.Status);
            Assert.Empty(pedido.Items);
        }

        [Fact]
        public void DeveInicializarItemsComoListaVaziaQuandoNulo()
        {
            var pedido = new Pedido(1, DateTime.Now, 10, null, null, StatusPedido.Criado, null);

            Assert.NotNull(pedido.Items);
            Assert.Empty(pedido.Items);
        }

        [Fact]
        public void DeveCriarPedidoComCarrinhoIdNulo()
        {
            var pedido = new Pedido(1, DateTime.Now, 10, null, null, StatusPedido.Criado, new List<PedidoItem>());

            Assert.Null(pedido.CarrinhoId);
        }

        [Theory]
        [InlineData(StatusPedido.Criado)]
        [InlineData(StatusPedido.EmProcessamento)]
        [InlineData(StatusPedido.Processado)]
        [InlineData(StatusPedido.Cancelado)]
        [InlineData(StatusPedido.Devolvido)]
        public void DeveCriarPedidoComDiferentesStatus(StatusPedido status)
        {
            var pedido = new Pedido(1, DateTime.Now, 10, null, null, status, new List<PedidoItem>());

            Assert.Equal(status, pedido.Status);
        }
    }
}
