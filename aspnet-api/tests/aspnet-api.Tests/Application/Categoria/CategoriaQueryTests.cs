using aspnet_api.Domain.Entities;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.Infrastructure.Repositories;
using aspnet_api.src.Application.Categoria.Carregar;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace aspnet_api.Tests.Application.Categoria;

public class CategoriaCarregarQueryTests
{
    [Fact]
    public async Task DeveCarregarCategoriasOrdenadas()
    {
        await using var context = CreateContext();
        context.CategoriasProdutos.Add(CategoriaProduto.Reconstituir(2, "Video", "Categoria Video"));
        context.CategoriasProdutos.Add(CategoriaProduto.Reconstituir(1, "Audio", "Categoria Audio"));
        await context.SaveChangesAsync();

        var query = new CategoriaCarregarQuery(new CategoriaProdutoRepository(context));
        var result = await query.Handle(new CarregarCategoriasQuery());

        Assert.True(result.IsSuccess);
        Assert.Collection(
            result.Data!,
            categoria =>
            {
                Assert.Equal(1, categoria.CategoriaId);
                Assert.Equal("Audio", categoria.Titulo);
                Assert.Equal("Categoria Audio", categoria.Descricao);
            },
            categoria =>
            {
                Assert.Equal(2, categoria.CategoriaId);
                Assert.Equal("Video", categoria.Titulo);
                Assert.Equal("Categoria Video", categoria.Descricao);
            });
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }
}
