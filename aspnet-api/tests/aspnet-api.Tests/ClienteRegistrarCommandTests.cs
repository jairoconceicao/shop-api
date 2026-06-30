using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.Api.Contracts.Requests.Shared;
using aspnet_api.Api.Contracts.Responses.Clientes;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Domain.ValueObjects;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.Infrastructure.Repositories;
using aspnet_api.src.Application.Cliente.Registrar;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using DomainCliente = aspnet_api.Domain.Entities.Cliente;
using Xunit;

namespace aspnet_api.Tests.Application.Cliente.Registrar;

public class ClienteRegistrarCommandTests
{
    [Fact]
    public async Task Handle_DeveCadastrarClienteQuandoDadosForemValidos()
    {
        await using var context = CreateContext();
        var command = CreateSut(context);

        var result = await command.Handle(CreateValidRequest());

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Data);
        Assert.True(result.Data!.ClienteId > 0);
        Assert.Equal(1, await context.Clientes.CountAsync());
    }

    [Fact]
    public async Task Handle_DeveRetornarNotificacaoQuandoCpfJaExistir()
    {
        await using var context = CreateContext();
        context.Clientes.Add(CreateExistingCliente());
        await context.SaveChangesAsync();

        var command = CreateSut(context);

        var result = await command.Handle(CreateValidRequest());

        Assert.True(result.IsFailure);
        Assert.Contains(result.Notifications, notification => notification.Code == "CLIENTE_CPF_DUPLICADO");
        Assert.Equal(1, await context.Clientes.CountAsync());
    }

    [Fact]
    public async Task Handle_DeveRetornarNotificacaoQuandoRequestForInvalido()
    {
        await using var context = CreateContext();
        var command = CreateSut(context);

        var result = await command.Handle(CreateValidRequest() with { Email = "invalido" });

        Assert.True(result.IsFailure);
        Assert.Contains(result.Notifications, notification => notification.PropertyName == nameof(CreateClienteRequest.Email));
        Assert.Empty(context.Clientes);
    }

    private static ClienteRegistrarCommand CreateSut(ShopDbContext context)
    {
        IValidator<CreateClienteRequest> validator = new ClienteRegistrarCommandValidator();
        var repository = new ClienteRepository(context);
        IUnitOfWork unitOfWork = context;

        return new ClienteRegistrarCommand(validator, repository, unitOfWork);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }

    private static CreateClienteRequest CreateValidRequest()
    {
        return new CreateClienteRequest
        {
            Cpf = "12345678901",
            Nome = "Cliente Teste",
            DataNascimento = DateOnly.FromDateTime(DateTime.Today).AddDays(-1),
            Email = "cliente@exemplo.com",
            Endereco = CreateValidEndereco(),
            Celular = CreateValidCelular()
        };
    }

    private static EnderecoRequest CreateValidEndereco()
    {
        return new EnderecoRequest
        {
            Logradouro = "Rua Um",
            Numero = "123",
            Complemento = "Apto 10",
            Cep = "12345678",
            Bairro = "Centro",
            Cidade = "Sao Paulo",
            Uf = "SP"
        };
    }

    private static CelularRequest CreateValidCelular()
    {
        return new CelularRequest
        {
            Ddd = "11",
            Numero = "999999999",
            WhatsApp = true
        };
    }

    private static DomainCliente CreateExistingCliente()
    {
        return new DomainCliente(
            1,
            "Cliente Existente",
            "12345678901",
            new DateTime(1990, 1, 1),
            new Endereco("Rua Existente", "1", null, "00000000", "Centro", "Sao Paulo", "SP"),
            new Celular("11", "988888888", true),
            "existente@exemplo.com");
    }
}
