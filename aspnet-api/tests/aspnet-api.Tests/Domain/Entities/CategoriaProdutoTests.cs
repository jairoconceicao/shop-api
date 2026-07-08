using aspnet_api.Domain.Entities;
using Xunit;

namespace aspnet_api.Tests.Domain.Entities;

public class CategoriaProdutoTests
{
    public class Constructor
    {
        [Fact]
        public void DeveCriarCategoriaProdutoComTodosOsCampos()
        {
            var categoria = CategoriaProduto.Reconstituir(1, "Eletrônicos", "Produtos de tecnologia");

            Assert.Equal(1, categoria.Id);
            Assert.Equal("Eletrônicos", categoria.Titulo);
            Assert.Equal("Produtos de tecnologia", categoria.Descricao);
            Assert.NotNull(categoria.Produtos);
            Assert.Empty(categoria.Produtos);
        }

        [Fact]
        public void DeveCriarCategoriaProdutoComParametrolessConstructor()
        {
            var categoria = new CategoriaProduto();

            Assert.Equal(0, categoria.Id);
            Assert.Equal(string.Empty, categoria.Titulo);
            Assert.Null(categoria.Descricao);
            Assert.NotNull(categoria.Produtos);
            Assert.Empty(categoria.Produtos);
        }
    }
}
