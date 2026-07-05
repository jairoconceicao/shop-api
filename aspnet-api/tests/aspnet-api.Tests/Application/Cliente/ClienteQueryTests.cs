using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.ValueObjects;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.Infrastructure.Repositories;
using aspnet_api.src.Application.Cliente.ConsultarPorCpf;
using aspnet_api.src.Application.Cliente.ConsultarPorId;
using DomainCliente = aspnet_api.Domain.Entities.Cliente;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace aspnet_api.Tests.Application.Cliente;

public class ClienteConsultarPorIdQueryTests
{
    public class Handle
    {
        [Fact]
        public async Task DeveConsultarClientePorIdQuandoExistir()
        {
            await using var context = CreateContext();
            var cliente = DomainCliente.Reconstituir(1, "Teste", "12345678901", DateOnly.FromDateTime(new DateTime(1990, 1, 1)), null, null, "teste@email.com");
            context.Clientes.Add(cliente);
            await context.SaveChangesAsync();

            var query = CreateSut(context);
            var cmd = new ConsultarClientePorIdQuery(1);

            var result = await query.Handle(cmd);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.Equal(1, result.Data!.ClienteId);
            Assert.Equal("Cliente consultado com sucesso.", result.Message);
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoClienteNaoExistir()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);
            var cmd = new ConsultarClientePorIdQuery(999);

            var result = await query.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CLIENTE_NAO_ENCONTRADO");
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoClienteIdInvalido()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);
            var cmd = new ConsultarClientePorIdQuery(0);

            var result = await query.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.PropertyName == nameof(ConsultarClientePorIdQuery.ClienteId));
        }

        [Fact]
        public async Task DeveLancarArgumentNullExceptionQuandoQueryForNula()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);

            await Assert.ThrowsAsync<ArgumentNullException>(() => query.Handle(null!));
        }
    }

    private static ClienteConsultarPorIdQuery CreateSut(ShopDbContext context)
    {
        IValidator<ConsultarClientePorIdQuery> validator = new ConsultarClientePorIdQueryValidator();
        var clienteRepository = new ClienteRepository(context);

        return new ClienteConsultarPorIdQuery(validator, clienteRepository);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }
}

public class ClienteConsultarPorCpfQueryTests
{
    public class Handle
    {
        [Fact]
        public async Task DeveConsultarClientePorCpfQuandoExistir()
        {
            await using var context = CreateContext();
            var cliente = DomainCliente.Reconstituir(1, "Teste", "12345678901", DateOnly.FromDateTime(new DateTime(1990, 1, 1)), null, null, "teste@email.com");
            context.Clientes.Add(cliente);
            await context.SaveChangesAsync();

            var query = CreateSut(context);
            var cmd = new ConsultarClientePorCpfQuery("12345678901");

            var result = await query.Handle(cmd);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.Equal("12345678901", result.Data!.Cpf);
            Assert.Equal("Cliente consultado com sucesso.", result.Message);
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoClienteNaoExistirPorCpf()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);
            var cmd = new ConsultarClientePorCpfQuery("99999999999");

            var result = await query.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CLIENTE_NAO_ENCONTRADO");
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoCpfInvalido()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);
            var cmd = new ConsultarClientePorCpfQuery("");

            var result = await query.Handle(cmd);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.PropertyName == nameof(ConsultarClientePorCpfQuery.Cpf));
        }

        [Fact]
        public async Task DeveLancarArgumentNullExceptionQuandoQueryForNula()
        {
            await using var context = CreateContext();
            var query = CreateSut(context);

            await Assert.ThrowsAsync<ArgumentNullException>(() => query.Handle(null!));
        }
    }

    private static ClienteConsultarPorCpfQuery CreateSut(ShopDbContext context)
    {
        IValidator<ConsultarClientePorCpfQuery> validator = new ConsultarClientePorCpfQueryValidator();
        var clienteRepository = new ClienteRepository(context);

        return new ClienteConsultarPorCpfQuery(validator, clienteRepository);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }
}



