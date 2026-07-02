using aspnet_api.Api.Contracts.Requests.Pedidos;
using aspnet_api.Api.Contracts.Requests.Shared;
using aspnet_api.Api.Contracts.Shared;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Entities;
using aspnet_api.Domain.ValueObjects;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.Infrastructure.Repositories;
using aspnet_api.src.Application.Pedido.Cancelar;
using aspnet_api.src.Application.Pedido.Consultar;
using aspnet_api.src.Application.Pedido.ConsultarPorId;
using aspnet_api.src.Application.Pedido.Criar;
using DomainPedido = aspnet_api.Domain.Entities.Pedido;
using DomainStatusPedido = aspnet_api.src.Domain.Enums.StatusPedido;
using DomainCliente = aspnet_api.Domain.Entities.Cliente;
using DomainCarrinho = aspnet_api.Domain.Entities.Carrinho;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace aspnet_api.Tests.Application.Pedido;

public class PedidoCriarCommandTests
{
    public class Handle
    {
        [Fact]
        public async Task DeveCriarPedidoQuandoDadosValidos()
        {
            await using var context = CreateContext();
            var cliente = new DomainCliente(1, "Teste", "12345678901", new DateTime(1990, 1, 1), null, null, "teste@email.com");
            context.Clientes.Add(cliente);

            var carrinho = new DomainCarrinho(1, 1, null, DateTime.Now, new List<CarrinhoItem>());
            context.Carrinhos.Add(carrinho);
            await context.SaveChangesAsync();

            var command = CreateSut(context);
            var request = CreateValidRequest();

            var result = await command.Handle(request);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.True(result.Data!.PedidoId > 0);
            Assert.Equal("Pedido criado com sucesso.", result.Message);
            Assert.Equal(1, await context.Pedidos.CountAsync());
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoClienteNaoExistir()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);
            var request = CreateValidRequest() with { ClienteId = 999 };

            var result = await command.Handle(request);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CLIENTE_NAO_ENCONTRADO");
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoCarrinhoNaoExistir()
        {
            await using var context = CreateContext();
            var cliente = new DomainCliente(1, "Teste", "12345678901", new DateTime(1990, 1, 1), null, null, "teste@email.com");
            context.Clientes.Add(cliente);
            await context.SaveChangesAsync();

            var command = CreateSut(context);
            var request = CreateValidRequest() with { CarrinhoId = 999 };

            var result = await command.Handle(request);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CARRINHO_NAO_ENCONTRADO");
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoCarrinhoNaoPertencerAoCliente()
        {
            await using var context = CreateContext();
            var cliente = new DomainCliente(1, "Teste", "12345678901", new DateTime(1990, 1, 1), null, null, "teste@email.com");
            context.Clientes.Add(cliente);

            var carrinho = new DomainCarrinho(1, 2, null, DateTime.Now, new List<CarrinhoItem>());
            context.Carrinhos.Add(carrinho);
            await context.SaveChangesAsync();

            var command = CreateSut(context);
            var request = CreateValidRequest();

            var result = await command.Handle(request);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "PEDIDO_CARRINHO_CLIENTE_INVALIDO");
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoJaExistirPedidoParaOCarrinho()
        {
            await using var context = CreateContext();
            var cliente = new DomainCliente(1, "Teste", "12345678901", new DateTime(1990, 1, 1), null, null, "teste@email.com");
            context.Clientes.Add(cliente);

            var carrinho = new DomainCarrinho(1, 1, null, DateTime.Now, new List<CarrinhoItem>());
            context.Carrinhos.Add(carrinho);

            var endereco = new Endereco("Rua", "123", null, "12345678", "Centro", "Cidade", "SP");
            var pedidoExistente = new DomainPedido(1, DateTime.Now, 1, 1, endereco, src.Domain.Enums.FormaPagamento.Pix, DomainStatusPedido.Criado, new List<PedidoItem>());
            context.Pedidos.Add(pedidoExistente);
            await context.SaveChangesAsync();

            var command = CreateSut(context);
            var request = CreateValidRequest();

            var result = await command.Handle(request);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "PEDIDO_CONFLITO_CARRINHO");
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoDadosInvalidos()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);
            var request = CreateValidRequest() with { ClienteId = 0 };

            var result = await command.Handle(request);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.PropertyName == nameof(CreatePedidoRequest.ClienteId));
        }

        [Fact]
        public async Task DeveLancarArgumentNullExceptionQuandoRequestForNulo()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);

            await Assert.ThrowsAsync<ArgumentNullException>(() => command.Handle(null!));
        }
    }

    private static PedidoCriarCommand CreateSut(ShopDbContext context)
    {
        IValidator<CreatePedidoRequest> validator = new PedidoCriarCommandValidator();
        var clienteRepository = new ClienteRepository(context);
        var carrinhoRepository = new CarrinhoRepository(context);
        var pedidoRepository = new PedidoRepository(context);
        IUnitOfWork unitOfWork = context;

        return new PedidoCriarCommand(validator, clienteRepository, carrinhoRepository, pedidoRepository, unitOfWork);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }

    private static CreatePedidoRequest CreateValidRequest()
    {
        return new CreatePedidoRequest
        {
            ClienteId = 1,
            CarrinhoId = 1,
            DataPedido = DateTime.Now,
            FormaPagamento = FormaPagamento.Pix,
            EnderecoEntrega = new EnderecoRequest
            {
                Logradouro = "Rua Teste",
                Numero = "123",
                Complemento = "Apto 10",
                Cep = "12345678",
                Bairro = "Centro",
                Cidade = "Sao Paulo",
                Uf = "SP"
            },
            Items = new List<PedidoItemRequest>
            {
                new() { ProdutoId = 1, Quantidade = 2, ValorUnitario = 50.0m }
            }
        };
    }
}

public class PedidoCancelarCommandTests
{
    public class Handle
    {
        [Fact]
        public async Task DeveCancelarPedidoQuandoDadosValidos()
        {
            await using var context = CreateContext();
            var pedido = new DomainPedido(1, DateTime.Now, 1, 1, null, src.Domain.Enums.FormaPagamento.Pix, DomainStatusPedido.Criado, new List<PedidoItem>());
            context.Pedidos.Add(pedido);
            await context.SaveChangesAsync();

            var command = CreateSut(context);
            var cmd = new CancelarPedidoCommand(1, new UpdatePedidoStatusRequest { Status = PedidoStatus.Cancelado });

            var result = await command.Handle(cmd);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.Equal(1, result.Data!.PedidoId);
            Assert.Equal("Pedido cancelado com sucesso.", result.Message);
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoPedidoNaoExistir()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);
            var cmd = new CancelarPedidoCommand(999, new UpdatePedidoStatusRequest { Status = PedidoStatus.Cancelado });

            var result = await command.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "PEDIDO_NAO_ENCONTRADO");
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoPedidoIdInvalido()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);
            var cmd = new CancelarPedidoCommand(0, new UpdatePedidoStatusRequest { Status = PedidoStatus.Cancelado });

            var result = await command.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.PropertyName == nameof(CancelarPedidoCommand.PedidoId));
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoStatusNaoForCancelado()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);
            var cmd = new CancelarPedidoCommand(1, new UpdatePedidoStatusRequest { Status = PedidoStatus.Criado });

            var result = await command.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.PropertyName == nameof(UpdatePedidoStatusRequest.Status));
        }

        [Fact]
        public async Task DeveLancarArgumentNullExceptionQuandoCommandForNulo()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);

            await Assert.ThrowsAsync<ArgumentNullException>(() => command.Handle(null!));
        }
    }

    private static PedidoCancelarCommand CreateSut(ShopDbContext context)
    {
        IValidator<CancelarPedidoCommand> validator = new CancelarPedidoCommandValidator();
        var pedidoRepository = new PedidoRepository(context);
        IUnitOfWork unitOfWork = context;

        return new PedidoCancelarCommand(validator, pedidoRepository, unitOfWork);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }
}

public class PedidoConsultarQueryTests
{
    public class Handle
    {
        [Fact]
        public async Task DeveConsultarPedidosQuandoDadosValidos()
        {
            await using var context = CreateContext();
            var cliente = new DomainCliente(1, "Teste", "12345678901", new DateTime(1990, 1, 1), null, null, "teste@email.com");
            context.Clientes.Add(cliente);

            var pedido = new DomainPedido(1, DateTime.Now, 1, 1, null, src.Domain.Enums.FormaPagamento.Pix, DomainStatusPedido.Criado, new List<PedidoItem>());
            context.Pedidos.Add(pedido);
            await context.SaveChangesAsync();

            var query = CreateSut(context);
            var cmd = new PedidosQuery { Cpf = "12345678901", Page = 1, Size = 10 };

            var result = await query.Handle(cmd);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.Single(result.Data!.Items);
            Assert.Equal("Pedidos consultados com sucesso.", result.Message);
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoClienteNaoExistir()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);
            var cmd = new PedidosQuery { Cpf = "99999999999", Page = 1, Size = 10 };

            var result = await query.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CLIENTE_NAO_ENCONTRADO");
        }

        [Fact]
        public async Task DeveFiltrarPedidosPorDataInicio()
        {
            await using var context = CreateContext();
            var cliente = new DomainCliente(1, "Teste", "12345678901", new DateTime(1990, 1, 1), null, null, "teste@email.com");
            context.Clientes.Add(cliente);

            var pedidoAntigo = new DomainPedido(1, DateTime.Now.AddDays(-10), 1, 1, null, src.Domain.Enums.FormaPagamento.Pix, DomainStatusPedido.Criado, new List<PedidoItem>());
            var pedidoRecente = new DomainPedido(2, DateTime.Now, 1, 1, null, src.Domain.Enums.FormaPagamento.Pix, DomainStatusPedido.Criado, new List<PedidoItem>());
            context.Pedidos.AddRange(pedidoAntigo, pedidoRecente);
            await context.SaveChangesAsync();

            var query = CreateSut(context);
            var cmd = new PedidosQuery { Cpf = "12345678901", Page = 1, Size = 10, DataInicio = DateTime.Now.AddDays(-5) };

            var result = await query.Handle(cmd);

            Assert.True(result.IsSuccess);
            Assert.Single(result.Data!.Items);
        }

        [Fact]
        public async Task DeveFiltrarPedidosPorDataFim()
        {
            await using var context = CreateContext();
            var cliente = new DomainCliente(1, "Teste", "12345678901", new DateTime(1990, 1, 1), null, null, "teste@email.com");
            context.Clientes.Add(cliente);

            var pedidoAntigo = new DomainPedido(1, DateTime.Now.AddDays(-10), 1, 1, null, src.Domain.Enums.FormaPagamento.Pix, DomainStatusPedido.Criado, new List<PedidoItem>());
            var pedidoRecente = new DomainPedido(2, DateTime.Now, 1, 1, null, src.Domain.Enums.FormaPagamento.Pix, DomainStatusPedido.Criado, new List<PedidoItem>());
            context.Pedidos.AddRange(pedidoAntigo, pedidoRecente);
            await context.SaveChangesAsync();

            var query = CreateSut(context);
            var cmd = new PedidosQuery { Cpf = "12345678901", Page = 1, Size = 10, DataFim = DateTime.Now.AddDays(-5) };

            var result = await query.Handle(cmd);

            Assert.True(result.IsSuccess);
            Assert.Single(result.Data!.Items);
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoDadosInvalidos()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);
            var cmd = new PedidosQuery { Cpf = "12345678901", Page = 0, Size = 10 };

            var result = await query.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.PropertyName == nameof(PedidosQuery.Page));
        }

        [Fact]
        public async Task DeveLancarArgumentNullExceptionQuandoQueryForNula()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);

            await Assert.ThrowsAsync<ArgumentNullException>(() => query.Handle(null!));
        }
    }

    private static PedidoConsultarQuery CreateSut(ShopDbContext context)
    {
        IValidator<PedidosQuery> validator = new ConsultarPedidosQueryValidator();
        var clienteRepository = new ClienteRepository(context);
        var pedidoRepository = new PedidoRepository(context);

        return new PedidoConsultarQuery(validator, clienteRepository, pedidoRepository);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }
}

public class PedidoConsultarPorIdQueryTests
{
    public class Handle
    {
        [Fact]
        public async Task DeveConsultarPedidoPorIdQuandoExistir()
        {
            await using var context = CreateContext();
            var pedido = new DomainPedido(1, DateTime.Now, 1, 1, null, src.Domain.Enums.FormaPagamento.Pix, DomainStatusPedido.Criado, new List<PedidoItem>());
            context.Pedidos.Add(pedido);
            await context.SaveChangesAsync();

            var query = CreateSut(context);
            var cmd = new ConsultarPedidoPorIdQuery(1);

            var result = await query.Handle(cmd);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.Equal(1, result.Data!.PedidoId);
            Assert.Equal("Pedido consultado com sucesso.", result.Message);
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoPedidoNaoExistir()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);
            var cmd = new ConsultarPedidoPorIdQuery(999);

            var result = await query.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "PEDIDO_NAO_ENCONTRADO");
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoPedidoIdInvalido()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);
            var cmd = new ConsultarPedidoPorIdQuery(0);

            var result = await query.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.PropertyName == nameof(ConsultarPedidoPorIdQuery.PedidoId));
        }

        [Fact]
        public async Task DeveLancarArgumentNullExceptionQuandoQueryForNula()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);

            await Assert.ThrowsAsync<ArgumentNullException>(() => query.Handle(null!));
        }
    }

    private static PedidoConsultarPorIdQuery CreateSut(ShopDbContext context)
    {
        IValidator<ConsultarPedidoPorIdQuery> validator = new ConsultarPedidoPorIdQueryValidator();
        var pedidoRepository = new PedidoRepository(context);

        return new PedidoConsultarPorIdQuery(validator, pedidoRepository);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }
}
