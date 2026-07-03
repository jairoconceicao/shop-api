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
                PedidoItem.Reconstituir(1, 2, 50.0m)
            };

            var pedido = Pedido.Reconstituir(1, dataPedido, 10, 5, endereco, StatusPedido.Criado, items);

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
            var pedido = Pedido.Reconstituir(1, DateTime.Now, 10, null, null, StatusPedido.Criado, null);

            Assert.NotNull(pedido.Items);
            Assert.Empty(pedido.Items);
        }

        [Fact]
        public void DeveCriarPedidoComCarrinhoIdNulo()
        {
            var pedido = Pedido.Reconstituir(1, DateTime.Now, 10, null, null, StatusPedido.Criado, new List<PedidoItem>());

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
            var pedido = Pedido.Reconstituir(1, DateTime.Now, 10, null, null, status, new List<PedidoItem>());

            Assert.Equal(status, pedido.Status);
        }
    }

    public class GetItemById
    {
        [Fact]
        public void DeveRetornarItemQuandoExistir()
        {
            var items = new List<PedidoItem>
            {
                PedidoItem.Reconstituir(1, 10, 2.0m, 50.0m),
                PedidoItem.Reconstituir(2, 20, 1.0m, 30.0m)
            };
            var pedido = Pedido.Reconstituir(1, DateTime.Now, 10, null, null, StatusPedido.Criado, items);

            var result = pedido.GetItemById(2);

            Assert.NotNull(result);
            Assert.Equal(2, result.Id);
            Assert.Equal(20, result.ProdutoId);
        }

        [Fact]
        public void DeveRetornarNullQuandoItemNaoExistir()
        {
            var items = new List<PedidoItem>
            {
                PedidoItem.Reconstituir(1, 10, 2.0m, 50.0m)
            };
            var pedido = Pedido.Reconstituir(1, DateTime.Now, 10, null, null, StatusPedido.Criado, items);

            var result = pedido.GetItemById(99);

            Assert.Null(result);
        }

        [Fact]
        public void DeveRetornarNullQuandoListaVazia()
        {
            var pedido = Pedido.Reconstituir(1, DateTime.Now, 10, null, null, StatusPedido.Criado, new List<PedidoItem>());

            var result = pedido.GetItemById(1);

            Assert.Null(result);
        }
    }

    public class AdicionarItem
    {
        [Fact]
        public void DeveAdicionarItemAoPedido()
        {
            var pedido = Pedido.Reconstituir(1, DateTime.Now, 10, null, null, StatusPedido.Criado, new List<PedidoItem>());
            var item = PedidoItem.Reconstituir(1, 10, 2.0m, 50.0m);

            var result = pedido.AdicionarItem(item);

            Assert.Single(pedido.Items);
            Assert.Same(item, result);
            Assert.Contains(item, pedido.Items);
        }

        [Fact]
        public void DeveLancarArgumentNullExceptionQuandoItemForNull()
        {
            var pedido = Pedido.Reconstituir(1, DateTime.Now, 10, null, null, StatusPedido.Criado, new List<PedidoItem>());

            Assert.Throws<ArgumentNullException>(() => pedido.AdicionarItem(null!));
        }
    }

    public class AtualizarStatus
    {
        [Fact]
        public void DeveAtualizarStatusDoPedido()
        {
            var pedido = Pedido.Reconstituir(1, DateTime.Now, 10, null, null, StatusPedido.Criado, new List<PedidoItem>());

            pedido.AtualizarStatus(StatusPedido.EmProcessamento);

            Assert.Equal(StatusPedido.EmProcessamento, pedido.Status);
        }

        [Theory]
        [InlineData(StatusPedido.Criado)]
        [InlineData(StatusPedido.EmProcessamento)]
        [InlineData(StatusPedido.Processado)]
        [InlineData(StatusPedido.Cancelado)]
        [InlineData(StatusPedido.Devolvido)]
        public void DeveAtualizarParaQualquerStatus(StatusPedido novoStatus)
        {
            var pedido = Pedido.Reconstituir(1, DateTime.Now, 10, null, null, StatusPedido.Criado, new List<PedidoItem>());

            pedido.AtualizarStatus(novoStatus);

            Assert.Equal(novoStatus, pedido.Status);
        }
    }

    public class Cancelar
    {
        [Fact]
        public void DeveCancelarPedido()
        {
            var pedido = Pedido.Reconstituir(1, DateTime.Now, 10, null, null, StatusPedido.Criado, new List<PedidoItem>());

            pedido.Cancelar();

            Assert.Equal(StatusPedido.Cancelado, pedido.Status);
        }

        [Fact]
        public void DeveCancelarPedidoEmProcessamento()
        {
            var pedido = Pedido.Reconstituir(1, DateTime.Now, 10, null, null, StatusPedido.EmProcessamento, new List<PedidoItem>());

            pedido.Cancelar();

            Assert.Equal(StatusPedido.Cancelado, pedido.Status);
        }
    }

    public class CalcularValorTotal
    {
        [Fact]
        public void DeveCalcularValorTotalComMultiplosItems()
        {
            var items = new List<PedidoItem>
            {
                PedidoItem.Reconstituir(1, 10, 2.0m, 50.0m),
                PedidoItem.Reconstituir(2, 20, 1.0m, 30.0m)
            };
            var pedido = Pedido.Reconstituir(1, DateTime.Now, 10, null, null, StatusPedido.Criado, items);

            var total = pedido.CalcularValorTotal();

            Assert.Equal(130.0m, total);
        }

        [Fact]
        public void DeveRetornarZeroQuandoListaVazia()
        {
            var pedido = Pedido.Reconstituir(1, DateTime.Now, 10, null, null, StatusPedido.Criado, new List<PedidoItem>());

            var total = pedido.CalcularValorTotal();

            Assert.Equal(0m, total);
        }

        [Fact]
        public void DeveCalcularValorTotalComUmItem()
        {
            var items = new List<PedidoItem>
            {
                PedidoItem.Reconstituir(1, 10, 3.0m, 25.0m)
            };
            var pedido = Pedido.Reconstituir(1, DateTime.Now, 10, null, null, StatusPedido.Criado, items);

            var total = pedido.CalcularValorTotal();

            Assert.Equal(75.0m, total);
        }
    }
}



