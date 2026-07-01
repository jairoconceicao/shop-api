using aspnet_api.Domain.Entities;
using aspnet_api.Domain.ValueObjects;
using Xunit;

namespace aspnet_api.Tests.Domain.Entities;

public class CarrinhoTests
{
    public class Constructor
    {
        [Fact]
        public void DeveCriarCarrinhoComTodosOsCampos()
        {
            var dataCarrinho = DateTime.Now;
            var endereco = new Endereco("Rua", "123", null, "12345678", "Centro", "Cidade", "SP");
            var items = new List<CarrinhoItem>
            {
                new(1, 2, 50.0m)
            };

            var carrinho = new Carrinho(1, 10, endereco, dataCarrinho, items);

            Assert.Equal(1, carrinho.Id);
            Assert.Equal(10, carrinho.ClienteId);
            Assert.Equal(endereco, carrinho.EnderecoEntrega);
            Assert.Equal(dataCarrinho, carrinho.DataCarrinho);
            Assert.Single(carrinho.Items);
        }

        [Fact]
        public void DeveCriarCarrinhoComParametrolessConstructor()
        {
            var carrinho = new Carrinho();

            Assert.Equal(0, carrinho.Id);
            Assert.Equal(0, carrinho.ClienteId);
            Assert.Null(carrinho.EnderecoEntrega);
            Assert.Equal(default, carrinho.DataCarrinho);
            Assert.Empty(carrinho.Items);
        }

        [Fact]
        public void DeveInicializarItemsComoListaVaziaQuandoNulo()
        {
            var carrinho = new Carrinho(1, 10, null, DateTime.Now, null);

            Assert.NotNull(carrinho.Items);
            Assert.Empty(carrinho.Items);
        }
    }
}
