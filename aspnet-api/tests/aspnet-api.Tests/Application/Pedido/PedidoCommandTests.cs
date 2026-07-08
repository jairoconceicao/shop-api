using aspnet_api.Api.Contracts.Requests.Pedidos;
using aspnet_api.Api.Contracts.Requests.Shared;
using aspnet_api.Api.Contracts.Shared;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.Infrastructure.Repositories;
using aspnet_api.src.Infrastructure.Persistence;
using aspnet_api.src.Application.Pedido.Cancelar;
using aspnet_api.src.Application.Pedido.Consultar;
using aspnet_api.src.Application.Pedido.ConsultarPorId;
using aspnet_api.src.Application.Pedido.Criar;
using DomainPedido = aspnet_api.Domain.Entities.Pedido;
using DomainStatusPedido = aspnet_api.src.Domain.Enums.StatusPedido;
using DomainCliente = aspnet_api.Domain.Entities.Cliente;
using DomainCarrinho = aspnet_api.Domain.Entities.Carrinho;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace aspnet_api.Tests.Application.Pedido;

public class PedidoCriarCommandTests
{
    [Fact]
    public async Task DeveCriarPedidoQuandoClienteAutenticadoForODonoDoCarrinho()
    {
        await using var context = PedidoTestSupport.CreateContext();
        context.Clientes.Add(DomainCliente.Reconstituir(1, "Teste", "12345678901", DateOnly.FromDateTime(new DateTime(1990, 1, 1)), null, null, "teste@email.com"));
        context.Carrinhos.Add(DomainCarrinho.Reconstituir(1, 1, null, DateTime.Now, []));
        await context.SaveChangesAsync();

        var command = new PedidoCriarCommand(new PedidoCriarCommandValidator(), new ClienteRepository(context), new CarrinhoRepository(context), new PedidoRepository(context), new TestSessaoAtualProvider(1), new UnitOfWork(context));
        var result = await command.Handle(PedidoTestSupport.CreateValidRequest());

        Assert.True(result.IsSuccess);
    }
}

public class PedidoCancelarCommandTests
{
    [Fact]
    public async Task DeveNegarCancelamentoQuandoPedidoPertencerAOutroCliente()
    {
        await using var context = PedidoTestSupport.CreateContext();
        context.Pedidos.Add(DomainPedido.Reconstituir(1, DateTime.Now, 1, 1, null, src.Domain.Enums.FormaPagamento.Pix, DomainStatusPedido.Criado, []));
        await context.SaveChangesAsync();

        var command = new PedidoCancelarCommand(new CancelarPedidoCommandValidator(), new PedidoRepository(context), new TestSessaoAtualProvider(2), new UnitOfWork(context));
        var result = await command.Handle(new CancelarPedidoCommand(1, new UpdatePedidoStatusRequest { Status = PedidoStatus.Cancelado }));

        Assert.True(result.IsFailure);
        Assert.Contains(result.Notifications, notification => notification.Code == "AUTH_CLIENTE_ACESSO_NEGADO");
    }
}

public class PedidoConsultarQueryTests
{
    [Fact]
    public async Task DeveConsultarPedidosDoClienteAutenticado()
    {
        await using var context = PedidoTestSupport.CreateContext();
        context.Clientes.Add(DomainCliente.Reconstituir(1, "Teste", "12345678901", DateOnly.FromDateTime(new DateTime(1990, 1, 1)), null, null, "teste@email.com"));
        context.Pedidos.Add(DomainPedido.Reconstituir(1, DateTime.Now, 1, 1, null, src.Domain.Enums.FormaPagamento.Pix, DomainStatusPedido.Criado, []));
        await context.SaveChangesAsync();

        var query = new PedidoConsultarQuery(new ConsultarPedidosQueryValidator(), new ClienteRepository(context), new PedidoRepository(context), new TestSessaoAtualProvider(1));
        var result = await query.Handle(new PedidosQuery { Cpf = "12345678901", Page = 1, Size = 10 });

        Assert.True(result.IsSuccess);
        Assert.Single(result.Data!.Items);
    }
}

public class PedidoConsultarPorIdQueryTests
{
    [Fact]
    public async Task DeveNegarConsultaQuandoPedidoPertencerAOutroCliente()
    {
        await using var context = PedidoTestSupport.CreateContext();
        context.Pedidos.Add(DomainPedido.Reconstituir(1, DateTime.Now, 1, 1, null, src.Domain.Enums.FormaPagamento.Pix, DomainStatusPedido.Criado, []));
        await context.SaveChangesAsync();

        var query = new PedidoConsultarPorIdQuery(new ConsultarPedidoPorIdQueryValidator(), new PedidoRepository(context), new TestSessaoAtualProvider(2));
        var result = await query.Handle(new ConsultarPedidoPorIdQuery(1));

        Assert.True(result.IsFailure);
        Assert.Contains(result.Notifications, notification => notification.Code == "AUTH_CLIENTE_ACESSO_NEGADO");
    }
}

internal static class PedidoTestSupport
{
    public static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }

    public static CreatePedidoRequest CreateValidRequest()
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
            Items = [new PedidoItemRequest { ProdutoId = 1, Quantidade = 2, ValorUnitario = 50.0m }]
        };
    }
}
