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

    public class GetItemById
    {
        [Fact]
        public void DeveRetornarItemQuandoExistir()
        {
            var items = new List<CarrinhoItem>
            {
                new(1, 10, 2.0m, 50.0m),
                new(2, 20, 1.0m, 30.0m)
            };
            var carrinho = new Carrinho(1, 10, null, DateTime.Now, items);

            var result = carrinho.GetItemById(2);

            Assert.NotNull(result);
            Assert.Equal(2, result.Id);
            Assert.Equal(20, result.ProdutoId);
        }

        [Fact]
        public void DeveRetornarNullQuandoItemNaoExistir()
        {
            var items = new List<CarrinhoItem>
            {
                new(1, 10, 2.0m, 50.0m)
            };
            var carrinho = new Carrinho(1, 10, null, DateTime.Now, items);

            var result = carrinho.GetItemById(99);

            Assert.Null(result);
        }

        [Fact]
        public void DeveRetornarNullQuandoListaVazia()
        {
            var carrinho = new Carrinho(1, 10, null, DateTime.Now, new List<CarrinhoItem>());

            var result = carrinho.GetItemById(1);

            Assert.Null(result);
        }
    }

    public class GetItemByProdutoId
    {
        [Fact]
        public void DeveRetornarItemQuandoProdutoExistir()
        {
            var items = new List<CarrinhoItem>
            {
                new(1, 10, 2.0m, 50.0m),
                new(2, 20, 1.0m, 30.0m)
            };
            var carrinho = new Carrinho(1, 10, null, DateTime.Now, items);

            var result = carrinho.GetItemByProdutoId(20);

            Assert.NotNull(result);
            Assert.Equal(20, result.ProdutoId);
            Assert.Equal(2, result.Id);
        }

        [Fact]
        public void DeveRetornarNullQuandoProdutoNaoExistir()
        {
            var items = new List<CarrinhoItem>
            {
                new(1, 10, 2.0m, 50.0m)
            };
            var carrinho = new Carrinho(1, 10, null, DateTime.Now, items);

            var result = carrinho.GetItemByProdutoId(99);

            Assert.Null(result);
        }

        [Fact]
        public void DeveRetornarNullQuandoListaVazia()
        {
            var carrinho = new Carrinho(1, 10, null, DateTime.Now, new List<CarrinhoItem>());

            var result = carrinho.GetItemByProdutoId(10);

            Assert.Null(result);
        }
    }

    public class AdicionarItem
    {
        [Fact]
        public void DeveAdicionarItemAoCarrinho()
        {
            var carrinho = new Carrinho(1, 10, null, DateTime.Now, new List<CarrinhoItem>());
            var item = new CarrinhoItem(1, 10, 2.0m, 50.0m);

            var result = carrinho.AdicionarItem(item);

            Assert.Single(carrinho.Items);
            Assert.Same(item, result);
            Assert.Contains(item, carrinho.Items);
        }

        [Fact]
        public void DeveLancarArgumentNullExceptionQuandoItemForNull()
        {
            var carrinho = new Carrinho(1, 10, null, DateTime.Now, new List<CarrinhoItem>());

            Assert.Throws<ArgumentNullException>(() => carrinho.AdicionarItem(null!));
        }
    }

    public class AtualizarQuantidadeItem
    {
        [Fact]
        public void DeveAtualizarQuantidadeDoItem()
        {
            var items = new List<CarrinhoItem>
            {
                new(1, 10, 2.0m, 50.0m)
            };
            var carrinho = new Carrinho(1, 10, null, DateTime.Now, items);

            var result = carrinho.AtualizarQuantidadeItem(1, 5.0m);

            Assert.NotNull(result);
            Assert.Equal(5.0m, result.Quantidade);
            Assert.Equal(5.0m, items[0].Quantidade);
        }

        [Fact]
        public void DeveRetornarNullQuandoItemNaoExistir()
        {
            var items = new List<CarrinhoItem>
            {
                new(1, 10, 2.0m, 50.0m)
            };
            var carrinho = new Carrinho(1, 10, null, DateTime.Now, items);

            var result = carrinho.AtualizarQuantidadeItem(99, 5.0m);

            Assert.Null(result);
        }

        [Fact]
        public void DeveRetornarNullQuandoListaVazia()
        {
            var carrinho = new Carrinho(1, 10, null, DateTime.Now, new List<CarrinhoItem>());

            var result = carrinho.AtualizarQuantidadeItem(1, 5.0m);

            Assert.Null(result);
        }
    }

    public class RemoverItem
    {
        [Fact]
        public void DeveRemoverItemDoCarrinho()
        {
            var items = new List<CarrinhoItem>
            {
                new(1, 10, 2.0m, 50.0m),
                new(2, 20, 1.0m, 30.0m)
            };
            var carrinho = new Carrinho(1, 10, null, DateTime.Now, items);

            var result = carrinho.RemoverItem(1);

            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Single(carrinho.Items);
            Assert.DoesNotContain(result, carrinho.Items);
        }

        [Fact]
        public void DeveRetornarNullQuandoItemNaoExistir()
        {
            var items = new List<CarrinhoItem>
            {
                new(1, 10, 2.0m, 50.0m)
            };
            var carrinho = new Carrinho(1, 10, null, DateTime.Now, items);

            var result = carrinho.RemoverItem(99);

            Assert.Null(result);
            Assert.Single(carrinho.Items);
        }

        [Fact]
        public void DeveRetornarNullQuandoListaVazia()
        {
            var carrinho = new Carrinho(1, 10, null, DateTime.Now, new List<CarrinhoItem>());

            var result = carrinho.RemoverItem(1);

            Assert.Null(result);
        }
    }
}
