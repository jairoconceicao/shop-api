using aspnet_api.Api.Contracts.Requests.Produtos;
using aspnet_api.Application.Abstractions.Repositories;
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
    public class Handle
    {
        [Fact]
        public async Task DeveCarregarCatalogoQuandoDadosValidos()
        {
            await using var context = CreateContext();
            var produto = DomainProduto.Reconstituir(1, "Produto Teste", "Descricao", "Modelo", 99.99m, null!, null!);
            context.Produtos.Add(produto);

            var estoque = Estoque.Reconstituir(1, null, DateTime.Now, 1, 0m, 100m, 10.0m);
            context.Estoques.Add(estoque);
            await context.SaveChangesAsync();

            var query = CreateSut(context);
            var cmd = new ProdutosQuery { Page = 1, Size = 10 };

            var result = await query.Handle(cmd);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.Single(result.Data!.Items);
            Assert.Equal("Catalogo de produtos carregado com sucesso.", result.Message);
        }

        [Fact]
        public async Task DeveRetornarListaVaziaQuandoNaoHouverProdutos()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);
            var cmd = new ProdutosQuery { Page = 1, Size = 10 };

            var result = await query.Handle(cmd);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.Empty(result.Data!.Items);
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoDadosInvalidos()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);
            var cmd = new ProdutosQuery { Page = 0, Size = 10 };

            var result = await query.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.PropertyName == nameof(ProdutosQuery.Page));
        }

        [Fact]
        public async Task DeveLancarArgumentNullExceptionQuandoQueryForNula()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);

            await Assert.ThrowsAsync<ArgumentNullException>(() => query.Handle(null!));
        }
    }

    private static ProdutoCarregarCatalogoQuery CreateSut(ShopDbContext context)
    {
        IValidator<ProdutosQuery> validator = new CarregarCatalogoProdutosQueryValidator();
        var produtoRepository = new ProdutoRepository(context);
        var estoqueRepository = new EstoqueRepository(context);

        return new ProdutoCarregarCatalogoQuery(validator, produtoRepository, estoqueRepository);
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
    public class Handle
    {
        [Fact]
        public async Task DeveConsultarProdutoPorIdQuandoExistir()
        {
            await using var context = CreateContext();
            var produto = DomainProduto.Reconstituir(1, "Produto Teste", "Descricao", "Modelo", 99.99m, null!, null!);
            context.Produtos.Add(produto);

            var estoque = Estoque.Reconstituir(1, null, DateTime.Now, 1, 0m, 100m, 10.0m);
            context.Estoques.Add(estoque);
            await context.SaveChangesAsync();

            var query = CreateSut(context);
            var cmd = new ConsultarProdutoPorIdQuery(1);

            var result = await query.Handle(cmd);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.Equal(1, result.Data!.ProdutoId);
            Assert.Equal("Produto consultado com sucesso.", result.Message);
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoProdutoNaoExistir()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);
            var cmd = new ConsultarProdutoPorIdQuery(999);

            var result = await query.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "PRODUTO_NAO_ENCONTRADO");
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoProdutoIdInvalido()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);
            var cmd = new ConsultarProdutoPorIdQuery(0);

            var result = await query.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.PropertyName == nameof(ConsultarProdutoPorIdQuery.ProdutoId));
        }

        [Fact]
        public async Task DeveLancarArgumentNullExceptionQuandoQueryForNula()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);

            await Assert.ThrowsAsync<ArgumentNullException>(() => query.Handle(null!));
        }
    }

    private static ProdutoConsultarPorIdQuery CreateSut(ShopDbContext context)
    {
        IValidator<ConsultarProdutoPorIdQuery> validator = new ConsultarProdutoPorIdQueryValidator();
        var produtoRepository = new ProdutoRepository(context);
        var estoqueRepository = new EstoqueRepository(context);

        return new ProdutoConsultarPorIdQuery(validator, produtoRepository, estoqueRepository);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }
}



