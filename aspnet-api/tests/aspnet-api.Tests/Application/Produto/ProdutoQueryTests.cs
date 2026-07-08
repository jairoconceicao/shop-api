using aspnet_api.Api.Contracts.Requests.Produtos;
using aspnet_api.Domain.Entities;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.Infrastructure.Repositories;
using aspnet_api.src.Application.Produto.CarregarCatalogo;
using aspnet_api.src.Application.Produto.ConsultarPorId;
using DomainProduto = aspnet_api.Domain.Entities.Produto;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace aspnet_api.Tests.Application.Produto;

public class ProdutoCarregarCatalogoQueryTests
{
    [Fact]
    public async Task DeveCarregarCatalogoQuandoDadosValidos()
    {
        await using var context = CreateContext();
        context.CategoriasProdutos.Add(CategoriaProduto.Reconstituir(1, "Categoria", "Descricao"));
        context.Produtos.Add(DomainProduto.Reconstituir(1, "Produto Teste", "Descricao", "Modelo", 99.99m, null!, null!));
        context.Estoques.Add(Estoque.Reconstituir(1, null, DateTime.Now, 1, 0m, 100m, 10.0m));
        await context.SaveChangesAsync();

        var query = new ProdutoCarregarCatalogoQuery(new CarregarCatalogoProdutosQueryValidator(), new ProdutoRepository(context), new EstoqueRepository(context));
        var result = await query.Handle(new ProdutosQuery { Page = 1, Size = 10 });

        Assert.True(result.IsSuccess);
        Assert.Single(result.Data!.Items);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }
}

public class ProdutoConsultarPorIdQueryTests
{
    [Fact]
    public async Task DeveConsultarProdutoPorIdQuandoExistir()
    {
        await using var context = CreateContext();
        context.CategoriasProdutos.Add(CategoriaProduto.Reconstituir(1, "Categoria", "Descricao"));
        context.Produtos.Add(DomainProduto.Reconstituir(1, "Produto Teste", "Descricao", "Modelo", 99.99m, null!, null!));
        context.Estoques.Add(Estoque.Reconstituir(1, null, DateTime.Now, 1, 0m, 100m, 10.0m));
        await context.SaveChangesAsync();

        var query = new ProdutoConsultarPorIdQuery(new ConsultarProdutoPorIdQueryValidator(), new ProdutoRepository(context), new EstoqueRepository(context));
        var result = await query.Handle(new ConsultarProdutoPorIdQuery(1));

        Assert.True(result.IsSuccess);
        Assert.Equal(1, result.Data!.ProdutoId);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }
}
