using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.Api.Contracts.Requests.Shared;
using aspnet_api.Api.Contracts.Responses.Clientes;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Application.Abstractions.Security;
using aspnet_api.Domain.ValueObjects;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.Infrastructure.Repositories;
using aspnet_api.src.Application.Cliente.Registrar;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using DomainCliente = aspnet_api.Domain.Entities.Cliente;
using DomainUsuario = aspnet_api.Domain.Entities.Usuario;
using Xunit;

namespace aspnet_api.Tests.Application.Cliente.Registrar;

public class ClienteRegistrarCommandTests
{
    public class Handle : ClienteRegistrarCommandTests
    {
        [Fact]
        public async Task DeveCadastrarClienteQuandoDadosForemValidos()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);

            var result = await command.Handle(CreateValidRequest());

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.True(result.Data!.ClienteId > 0);
            Assert.Equal("Cliente cadastrado com sucesso.", result.Message);
            var cliente = await context.Clientes.SingleAsync();
            Assert.Equal(cliente.Id, result.Data.ClienteId);
            Assert.Equal(1, await context.Clientes.CountAsync());
            Assert.Equal(1, await context.Usuarios.CountAsync());
        }

        [Fact]
        public async Task DeveCriarUsuarioVinculadoAoClienteQuandoCadastroForBemSucedido()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);

            var result = await command.Handle(CreateValidRequest());

            Assert.True(result.IsSuccess);
            var cliente = await context.Clientes.SingleAsync();
            var usuario = await context.Usuarios.SingleAsync();
            Assert.Equal(cliente.Id, usuario.ClienteId);
            Assert.Equal("cliente@exemplo.com", usuario.Email);
            Assert.True(usuario.SenhaHash.Length > 0);
            Assert.NotEqual("Senha12345", usuario.SenhaHash);
        }

        [Fact]
        public async Task DeveRetornarNotificacaoQuandoCpfJaExistir()
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
        public async Task DeveRetornarNotificacaoQuandoEmailJaExistir()
        {
            await using var context = CreateContext();
            context.Clientes.Add(CreateExistingCliente());
            await context.SaveChangesAsync();

            var command = CreateSut(context);
            var request = CreateValidRequest() with { Email = "existente@exemplo.com" };

            var result = await command.Handle(request);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, notification => notification.Code == "CLIENTE_EMAIL_DUPLICADO");
        }

        [Fact]
        public async Task DeveRetornarNotificacaoQuandoUsuarioComEmailJaExistir()
        {
            await using var context = CreateContext();
            var clienteExistente = CreateExistingCliente();
            context.Clientes.Add(clienteExistente);
            context.Usuarios.Add(DomainUsuario.Create(
                clienteExistente.Id, "existente@exemplo.com", "hash-original"));
            await context.SaveChangesAsync();

            var command = CreateSut(context);
            var request = CreateValidRequest() with { Cpf = "99999999999", Email = "existente@exemplo.com" };

            var result = await command.Handle(request);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, notification => notification.Code == "USUARIO_EMAIL_DUPLICADO");
        }

        [Fact]
        public async Task DeveRetornarNotificacaoQuandoRequestForInvalido()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);

            var result = await command.Handle(CreateValidRequest() with { Email = "invalido" });

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, notification => notification.PropertyName == nameof(CreateClienteRequest.Email));
            Assert.Empty(context.Clientes);
        }

        [Fact]
        public async Task DeveRetornarNotificacaoQuandoSenhaForCurta()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);

            var result = await command.Handle(CreateValidRequest() with { Senha = "short" });

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, notification => notification.PropertyName == nameof(CreateClienteRequest.Senha));
        }

        [Fact]
        public async Task DeveLancarArgumentNullExceptionQuandoCommandForNulo()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);

            await Assert.ThrowsAsync<ArgumentNullException>(() => command.Handle(null!));
        }

        [Fact]
        public async Task DeveRetornarNotificacaoQuandoEnderecoForInvalido()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);
            var request = CreateValidRequest() with
            {
                Endereco = CreateValidEndereco() with { Logradouro = "" }
            };

            var result = await command.Handle(request);

            Assert.True(result.IsFailure);
            Assert.Empty(context.Clientes);
        }

        [Fact]
        public async Task DeveRetornarNotificacaoQuandoCelularForInvalido()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);
            var request = CreateValidRequest() with
            {
                Celular = CreateValidCelular() with { Ddd = "1" }
            };

            var result = await command.Handle(request);

            Assert.True(result.IsFailure);
            Assert.Empty(context.Clientes);
        }
    }

    private static ClienteRegistrarCommand CreateSut(ShopDbContext context)
    {
        IValidator<CreateClienteRequest> validator = new ClienteRegistrarCommandValidator();
        var clienteRepository = new ClienteRepository(context);
        var usuarioRepository = new UsuarioRepository(context);
        IPasswordHasher passwordHasher = new FakePasswordHasher();
        IUnitOfWork unitOfWork = context;

        return new ClienteRegistrarCommand(validator, clienteRepository, usuarioRepository, passwordHasher, unitOfWork);
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
            Senha = "SenhaSegura123",
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
        return DomainCliente.Reconstituir(
            1,
            "Cliente Existente",
            "12345678901",
            new DateTime(1990, 1, 1),
            new Endereco("Rua Existente", "1", null, "00000000", "Centro", "Sao Paulo", "SP"),
            new Celular("11", "988888888", true),
            "existente@exemplo.com");
    }

    private sealed class FakePasswordHasher : IPasswordHasher
    {
        public string Hash(string password) => $"HASH::{password}";

        public bool Verify(string password, string hash) => hash == $"HASH::{password}";
    }
}
