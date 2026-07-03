using aspnet_api.Domain.Entities;
using Xunit;

namespace aspnet_api.Tests.Domain.Entities;

public class ProdutoTests
{
    public class Constructor
    {
        [Fact]
        public void DeveCriarProdutoComTodosOsCampos()
        {
            var produto = Produto.Reconstituir(1, "Titulo", "Descricao", "Modelo", 99.99m, "foto.jpg", "thumb.jpg");

            Assert.Equal(1, produto.Id);
            Assert.Equal("Titulo", produto.Titulo);
            Assert.Equal("Descricao", produto.Descricao);
            Assert.Equal("Modelo", produto.Modelo);
            Assert.Equal(99.99m, produto.Preco);
            Assert.Equal("foto.jpg", produto.Foto);
            Assert.Equal("thumb.jpg", produto.Thumb);
        }

        [Fact]
        public void DeveCriarProdutoComParametrolessConstructor()
        {
            var produto = new Produto();

            Assert.Equal(0, produto.Id);
            Assert.Equal(string.Empty, produto.Titulo);
            Assert.Null(produto.Descricao);
            Assert.Null(produto.Modelo);
            Assert.Equal(0m, produto.Preco);
            Assert.Null(produto.Foto);
            Assert.Null(produto.Thumb);
        }

        [Fact]
        public void DeveCriarProdutoUsandoConstructorComParametros()
        {
            var produto = Produto.Reconstituir(1, "Teste", null!, null!, 0m, null!, null!);

            Assert.Equal(1, produto.Id);
            Assert.Equal("Teste", produto.Titulo);
        }
    }
}



