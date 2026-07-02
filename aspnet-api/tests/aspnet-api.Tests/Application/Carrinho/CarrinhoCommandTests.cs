using aspnet_api.Api.Contracts.Requests.Carrinhos;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Entities;
using aspnet_api.Domain.ValueObjects;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.Infrastructure.Repositories;
using aspnet_api.src.Application.Carrinho.AdicionarItem;
using aspnet_api.src.Application.Carrinho.AtualizarItem;
using aspnet_api.src.Application.Carrinho.Criar;
using aspnet_api.src.Application.Carrinho.ExcluirItem;
using aspnet_api.src.Application.Carrinho.Obter;
using DomainCarrinho = aspnet_api.Domain.Entities.Carrinho;
using DomainCliente = aspnet_api.Domain.Entities.Cliente;
using DomainProduto = aspnet_api.Domain.Entities.Produto;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace aspnet_api.Tests.Application.Carrinho;

public class CarrinhoCriarCommandTests
{
    public class Handle
    {
        [Fact]
        public async Task DeveCriarCarrinhoQuandoDadosValidos()
        {
            await using var context = CreateContext();
            var cliente = new DomainCliente(1, "Teste", "12345678901", new DateTime(1990, 1, 1), null, null, "teste@email.com");
            context.Clientes.Add(cliente);
            await context.SaveChangesAsync();

            var command = CreateSut(context);
            var request = new CreateCarrinhoRequest { ClienteId = 1 };

            var result = await command.Handle(request);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.True(result.Data!.CarrinhoId > 0);
            Assert.Equal("Carrinho criado com sucesso.", result.Message);
            Assert.Equal(1, await context.Carrinhos.CountAsync());
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoClienteNaoExistir()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);
            var request = new CreateCarrinhoRequest { ClienteId = 999 };

            var result = await command.Handle(request);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CLIENTE_NAO_ENCONTRADO");
            Assert.Equal("Cliente nao encontrado.", result.Message);
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoClienteIdInvalido()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);
            var request = new CreateCarrinhoRequest { ClienteId = 0 };

            var result = await command.Handle(request);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.PropertyName == nameof(CreateCarrinhoRequest.ClienteId));
        }

        [Fact]
        public async Task DeveLancarArgumentNullExceptionQuandoRequestForNulo()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);

            await Assert.ThrowsAsync<ArgumentNullException>(() => command.Handle(null!));
        }
    }

    private static CarrinhoCriarCommand CreateSut(ShopDbContext context)
    {
        IValidator<CreateCarrinhoRequest> validator = new CarrinhoCriarCommandValidator();
        var clienteRepository = new ClienteRepository(context);
        var carrinhoRepository = new CarrinhoRepository(context);
        IUnitOfWork unitOfWork = context;

        return new CarrinhoCriarCommand(validator, clienteRepository, carrinhoRepository, unitOfWork);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }
}

public class CarrinhoAdicionarItemCommandTests
{
    public class Handle
    {
        [Fact]
        public async Task DeveAdicionarItemAoCarrinhoQuandoDadosValidos()
        {
            await using var context = CreateContext();
            var carrinho = new DomainCarrinho(1, 1, null, DateTime.Now, new List<CarrinhoItem>());
            context.Carrinhos.Add(carrinho);

            var produto = new DomainProduto(1, "Produto Teste", "Descricao", "Modelo", 50.0m, null, null);
            context.Produtos.Add(produto);
            await context.SaveChangesAsync();

            var command = CreateSut(context);
            var request = new AddCarrinhoItemRequest { ProdutoId = 1, Quantidade = 2, ValorUnitario = 50.0m };

            var result = await command.Handle(request);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.True(result.Data!.ItemId > 0);
            Assert.Equal("Item adicionado ao carrinho com sucesso.", result.Message);
        }

        [Fact]
        public async Task DeveIncrementarQuantidadeQuandoItemJaExistir()
        {
            await using var context = CreateContext();
            var itemExistente = new CarrinhoItem(1, 1, 2.0m, 50.0m);
            var carrinho = new DomainCarrinho(1, 1, null, DateTime.Now, new List<CarrinhoItem> { itemExistente });
            context.Carrinhos.Add(carrinho);

            var produto = new DomainProduto(1, "Produto Teste", "Descricao", "Modelo", 50.0m, null, null);
            context.Produtos.Add(produto);
            await context.SaveChangesAsync();

            var command = CreateSut(context);
            var request = new AddCarrinhoItemRequest { ProdutoId = 1, Quantidade = 3, ValorUnitario = 50.0m };

            var result = await command.Handle(request);

            Assert.True(result.IsSuccess);
            Assert.Equal(itemExistente.Id, result.Data!.ItemId);
            var carrinhoAtualizado = await context.Carrinhos.FirstAsync();
            var item = carrinhoAtualizado.Items.First();
            Assert.Equal(5.0m, item.Quantidade);
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoCarrinhoNaoExistir()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);
            var request = new AddCarrinhoItemRequest { ProdutoId = 1, Quantidade = 2, ValorUnitario = 50.0m };

            var result = await command.Handle(request);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CARRINHO_NAO_ENCONTRADO");
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoProdutoNaoExistir()
        {
            await using var context = CreateContext();
            var carrinho = new DomainCarrinho(1, 1, null, DateTime.Now, new List<CarrinhoItem>());
            context.Carrinhos.Add(carrinho);
            await context.SaveChangesAsync();

            var command = CreateSut(context);
            var request = new AddCarrinhoItemRequest { ProdutoId = 999, Quantidade = 2, ValorUnitario = 50.0m };

            var result = await command.Handle(request);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "PRODUTO_NAO_ENCONTRADO");
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoDadosInvalidos()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);
            var request = new AddCarrinhoItemRequest { ProdutoId = 0, Quantidade = 2, ValorUnitario = 50.0m };

            var result = await command.Handle(request);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.PropertyName == nameof(AddCarrinhoItemRequest.ProdutoId));
        }

        [Fact]
        public async Task DeveLancarArgumentNullExceptionQuandoRequestForNulo()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);

            await Assert.ThrowsAsync<ArgumentNullException>(() => command.Handle(null!));
        }
    }

    private static CarrinhoAdicionarItemCommand CreateSut(ShopDbContext context)
    {
        IValidator<AddCarrinhoItemRequest> validator = new AddCarrinhoItemCommandValidator();
        var produtoRepository = new ProdutoRepository(context);
        var carrinhoRepository = new CarrinhoRepository(context);
        IUnitOfWork unitOfWork = context;

        return new CarrinhoAdicionarItemCommand(validator, produtoRepository, carrinhoRepository, unitOfWork);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }
}

public class CarrinhoAtualizarItemCommandTests
{
    public class Handle
    {
        [Fact]
        public async Task DeveAtualizarQuantidadeDoItemQuandoDadosValidos()
        {
            await using var context = CreateContext();
            var item = new CarrinhoItem(1, 1, 2.0m, 50.0m);
            var carrinho = new DomainCarrinho(1, 1, null, DateTime.Now, new List<CarrinhoItem> { item });
            context.Carrinhos.Add(carrinho);
            await context.SaveChangesAsync();

            var command = CreateSut(context);
            var cmd = new AtualizarCarrinhoItemCommand(1, new UpdateCarrinhoItemRequest { Quantidade = 5 });

            var result = await command.Handle(cmd);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.Equal(1, result.Data!.ItemId);
            Assert.Equal("Quantidade do item atualizada com sucesso.", result.Message);
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoItemNaoExistir()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);
            var cmd = new AtualizarCarrinhoItemCommand(999, new UpdateCarrinhoItemRequest { Quantidade = 5 });

            var result = await command.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "ITEM_CARRINHO_NAO_ENCONTRADO");
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoQuantidadeInvalida()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);
            var cmd = new AtualizarCarrinhoItemCommand(1, new UpdateCarrinhoItemRequest { Quantidade = 0 });

            var result = await command.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.PropertyName == nameof(UpdateCarrinhoItemRequest.Quantidade));
        }

        [Fact]
        public async Task DeveLancarArgumentNullExceptionQuandoCommandForNulo()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);

            await Assert.ThrowsAsync<ArgumentNullException>(() => command.Handle(null!));
        }
    }

    private static CarrinhoAtualizarItemCommand CreateSut(ShopDbContext context)
    {
        IValidator<AtualizarCarrinhoItemCommand> validator = new AtualizarCarrinhoItemCommandValidator();
        var carrinhoRepository = new CarrinhoRepository(context);
        IUnitOfWork unitOfWork = context;

        return new CarrinhoAtualizarItemCommand(validator, carrinhoRepository, unitOfWork);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }
}

public class CarrinhoExcluirItemCommandTests
{
    public class Handle
    {
        [Fact]
        public async Task DeveExcluirItemDoCarrinhoQuandoDadosValidos()
        {
            await using var context = CreateContext();
            var item = new CarrinhoItem(1, 1, 2.0m, 50.0m);
            var carrinho = new DomainCarrinho(1, 1, null, DateTime.Now, new List<CarrinhoItem> { item });
            context.Carrinhos.Add(carrinho);
            await context.SaveChangesAsync();

            var command = CreateSut(context);
            var cmd = new ExcluirCarrinhoItemCommand(1);

            var result = await command.Handle(cmd);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.Equal(1, result.Data!.ItemId);
            Assert.Equal("Item excluido do carrinho com sucesso.", result.Message);
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoItemNaoExistir()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);
            var cmd = new ExcluirCarrinhoItemCommand(999);

            var result = await command.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "ITEM_CARRINHO_NAO_ENCONTRADO");
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoItemIdInvalido()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);
            var cmd = new ExcluirCarrinhoItemCommand(0);

            var result = await command.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.PropertyName == nameof(ExcluirCarrinhoItemCommand.ItemId));
        }

        [Fact]
        public async Task DeveLancarArgumentNullExceptionQuandoCommandForNulo()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);

            await Assert.ThrowsAsync<ArgumentNullException>(() => command.Handle(null!));
        }
    }

    private static CarrinhoExcluirItemCommand CreateSut(ShopDbContext context)
    {
        IValidator<ExcluirCarrinhoItemCommand> validator = new ExcluirCarrinhoItemCommandValidator();
        var carrinhoRepository = new CarrinhoRepository(context);
        IUnitOfWork unitOfWork = context;

        return new CarrinhoExcluirItemCommand(validator, carrinhoRepository, unitOfWork);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }
}

public class CarrinhoObterQueryTests
{
    public class Handle
    {
        [Fact]
        public async Task DeveRetornarCarrinhoQuandoExistir()
        {
            await using var context = CreateContext();
            var carrinho = new DomainCarrinho(1, 1, null, DateTime.Now, new List<CarrinhoItem>());
            context.Carrinhos.Add(carrinho);
            await context.SaveChangesAsync();

            var query = CreateSut(context);
            var cmd = new ObterCarrinhoQuery(1);

            var result = await query.Handle(cmd);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.Equal(1, result.Data!.CarrinhoId);
            Assert.Equal("Carrinho consultado com sucesso.", result.Message);
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoCarrinhoNaoExistir()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);
            var cmd = new ObterCarrinhoQuery(999);

            var result = await query.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CARRINHO_NAO_ENCONTRADO");
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoCarrinhoIdInvalido()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);
            var cmd = new ObterCarrinhoQuery(0);

            var result = await query.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.PropertyName == nameof(ObterCarrinhoQuery.CarrinhoId));
        }

        [Fact]
        public async Task DeveLancarArgumentNullExceptionQuandoQueryForNula()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);

            await Assert.ThrowsAsync<ArgumentNullException>(() => query.Handle(null!));
        }
    }

    private static CarrinhoObterQuery CreateSut(ShopDbContext context)
    {
        IValidator<ObterCarrinhoQuery> validator = new ObterCarrinhoQueryValidator();
        var carrinhoRepository = new CarrinhoRepository(context);

        return new CarrinhoObterQuery(validator, carrinhoRepository);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }
}
