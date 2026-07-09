using aspnet_api.Api.Contracts.Requests.Carrinhos;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.Infrastructure.Repositories;
using aspnet_api.src.Infrastructure.Persistence;
using aspnet_api.src.Application.Carrinho.AdicionarItem;
using aspnet_api.src.Application.Carrinho.AtualizarItem;
using aspnet_api.src.Application.Carrinho.Criar;
using aspnet_api.src.Application.Carrinho.ExcluirItem;
using aspnet_api.src.Application.Carrinho.Obter;
using DomainCarrinho = aspnet_api.Domain.Entities.Carrinho;
using DomainCliente = aspnet_api.Domain.Entities.Cliente;
using DomainProduto = aspnet_api.Domain.Entities.Produto;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace aspnet_api.Tests.Application.Carrinho;

public class CarrinhoCriarCommandTests
{
    [Fact]
    public async Task DeveCriarCarrinhoQuandoClienteAutenticadoForODono()
    {
        await using var context = CarrinhoTestSupport.CreateContext();
        context.Clientes.Add(DomainCliente.Reconstituir(1, "Teste", "12345678901", DateOnly.FromDateTime(new DateTime(1990, 1, 1)), null, null, "teste@email.com"));
        await context.SaveChangesAsync();

        var command = new CarrinhoCriarCommand(new CarrinhoCriarCommandValidator(), new ClienteRepository(context), new CarrinhoRepository(context), new TestSessaoAtualProvider(1), new UnitOfWork(context));
        var result = await command.Handle(new CreateCarrinhoRequest());

        Assert.True(result.IsSuccess);
    }
}

public class CarrinhoAdicionarItemCommandTests
{
    [Fact]
    public async Task DeveAdicionarItemNoCarrinhoDoClienteAutenticado()
    {
        await using var context = CarrinhoTestSupport.CreateContext();
        context.Carrinhos.Add(DomainCarrinho.Reconstituir(1, 1, null, DateTime.Now, []));
        context.CategoriasProdutos.Add(aspnet_api.Domain.Entities.CategoriaProduto.Reconstituir(1, "Categoria", "Descricao"));
        context.Produtos.Add(DomainProduto.Reconstituir(1, "Produto Teste", "Descricao", "Modelo", 50.0m, null!, null!));
        await context.SaveChangesAsync();

        var command = new CarrinhoAdicionarItemCommand(new AddCarrinhoItemCommandValidator(), new ProdutoRepository(context), new CarrinhoRepository(context), new TestSessaoAtualProvider(1), new UnitOfWork(context));
        var result = await command.Handle(new AddCarrinhoItemRequest { ProdutoId = 1, Quantidade = 2, ValorUnitario = 50.0m });

        Assert.True(result.IsSuccess);
    }
}

public class CarrinhoAtualizarItemCommandTests
{
    [Fact]
    public async Task DeveNegarAtualizacaoQuandoItemPertencerAOutroCliente()
    {
        await using var context = CarrinhoTestSupport.CreateContext();
        var item = aspnet_api.Domain.Entities.CarrinhoItem.Reconstituir(1, 1, 2.0m, 50.0m);
        context.Carrinhos.Add(DomainCarrinho.Reconstituir(1, 1, null, DateTime.Now, [item]));
        await context.SaveChangesAsync();

        var command = new CarrinhoAtualizarItemCommand(new AtualizarCarrinhoItemCommandValidator(), new CarrinhoRepository(context), new TestSessaoAtualProvider(2), new UnitOfWork(context));
        var result = await command.Handle(new AtualizarCarrinhoItemCommand(1, new UpdateCarrinhoItemRequest { Quantidade = 5 }));

        Assert.True(result.IsFailure);
        Assert.Contains(result.Notifications, notification => notification.Code == "AUTH_CLIENTE_ACESSO_NEGADO");
    }
}

public class CarrinhoExcluirItemCommandTests
{
    [Fact]
    public async Task DeveExcluirItemQuandoClienteAutenticadoForODono()
    {
        await using var context = CarrinhoTestSupport.CreateContext();
        var item = aspnet_api.Domain.Entities.CarrinhoItem.Reconstituir(1, 1, 2.0m, 50.0m);
        context.Carrinhos.Add(DomainCarrinho.Reconstituir(1, 1, null, DateTime.Now, [item]));
        await context.SaveChangesAsync();

        var command = new CarrinhoExcluirItemCommand(new ExcluirCarrinhoItemCommandValidator(), new CarrinhoRepository(context), new TestSessaoAtualProvider(1), new UnitOfWork(context));
        var result = await command.Handle(new ExcluirCarrinhoItemCommand(1));

        Assert.True(result.IsSuccess);
    }
}

public class CarrinhoObterQueryTests
{
    [Fact]
    public async Task DeveRetornarFalhaQuandoCarrinhoPertencerAOutroCliente()
    {
        await using var context = CarrinhoTestSupport.CreateContext();
        context.Carrinhos.Add(DomainCarrinho.Reconstituir(1, 1, null, DateTime.Now, []));
        await context.SaveChangesAsync();

        var query = new CarrinhoObterQuery(new ObterCarrinhoQueryValidator(), new CarrinhoRepository(context), new TestSessaoAtualProvider(2));
        var result = await query.Handle(new ObterCarrinhoQuery(1));

        Assert.True(result.IsFailure);
        Assert.Contains(result.Notifications, notification => notification.Code == "AUTH_CLIENTE_ACESSO_NEGADO");
    }
}

internal static class CarrinhoTestSupport
{
    public static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }
}
