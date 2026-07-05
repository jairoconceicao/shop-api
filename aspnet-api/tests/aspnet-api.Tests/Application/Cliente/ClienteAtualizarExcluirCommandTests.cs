using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.Api.Contracts.Requests.Shared;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.Infrastructure.Repositories;
using aspnet_api.src.Infrastructure.Persistence;
using aspnet_api.src.Application.Cliente.Atualizar;
using aspnet_api.src.Application.Cliente.Excluir;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using DomainCliente = aspnet_api.Domain.Entities.Cliente;
using DomainCelular = aspnet_api.Domain.ValueObjects.Celular;
using DomainEndereco = aspnet_api.Domain.ValueObjects.Endereco;
using Xunit;

namespace aspnet_api.Tests.Application.Cliente;

public class ClienteAtualizarExcluirCommandTests
{
    public class Atualizar : ClienteAtualizarExcluirCommandTests
    {
        [Fact]
        public async Task DeveAtualizarClienteQuandoDadosForemValidos()
        {
            await using var context = CreateContext();
            context.Clientes.Add(CreateClienteExistente(1, "12345678901", "antigo@exemplo.com", "Cliente Antigo"));
            await context.SaveChangesAsync();

            var command = CreateAtualizarSut(context);
            var request = CreateValidUpdateRequest() with
            {
                Nome = "Cliente Atualizado",
                Email = "novo@exemplo.com"
            };

            var result = await command.Handle(new AtualizarClienteCommand(1, request));

            Assert.True(result.IsSuccess);
            Assert.Equal(1, result.Data!.ClienteId);
            Assert.Equal("Cliente atualizado com sucesso.", result.Message);

            var clienteAtualizado = await context.Clientes.SingleAsync(cliente => cliente.Id == 1);
            Assert.Equal("Cliente Atualizado", clienteAtualizado.Nome);
            Assert.Equal("novo@exemplo.com", clienteAtualizado.Email);
        }

        [Fact]
        public async Task DeveRetornarNotificacaoQuandoCpfJaExistirEmOutroCliente()
        {
            await using var context = CreateContext();
            context.Clientes.Add(CreateClienteExistente(1, "12345678901", "cliente1@exemplo.com", "Cliente Um"));
            context.Clientes.Add(CreateClienteExistente(2, "99999999999", "cliente2@exemplo.com", "Cliente Dois"));
            await context.SaveChangesAsync();

            var command = CreateAtualizarSut(context);
            var request = CreateValidUpdateRequest() with
            {
                Cpf = "99999999999"
            };

            var result = await command.Handle(new AtualizarClienteCommand(1, request));

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, notification => notification.Code == "CLIENTE_CPF_DUPLICADO");
        }

        [Fact]
        public async Task DevePermitirManterOCpfDoMesmoCliente()
        {
            await using var context = CreateContext();
            context.Clientes.Add(CreateClienteExistente(1, "12345678901", "cliente@exemplo.com", "Cliente Um"));
            await context.SaveChangesAsync();

            var command = CreateAtualizarSut(context);
            var request = CreateValidUpdateRequest() with
            {
                Cpf = "12345678901",
                Nome = "Nome Atualizado"
            };

            var result = await command.Handle(new AtualizarClienteCommand(1, request));

            Assert.True(result.IsSuccess);
        }

        [Fact]
        public async Task DeveRetornarNotificacaoQuandoEmailJaExistirEmOutroCliente()
        {
            await using var context = CreateContext();
            context.Clientes.Add(CreateClienteExistente(1, "12345678901", "cliente1@exemplo.com", "Cliente Um"));
            context.Clientes.Add(CreateClienteExistente(2, "99999999999", "cliente2@exemplo.com", "Cliente Dois"));
            await context.SaveChangesAsync();

            var command = CreateAtualizarSut(context);
            var request = CreateValidUpdateRequest() with
            {
                Email = "cliente2@exemplo.com"
            };

            var result = await command.Handle(new AtualizarClienteCommand(1, request));

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, notification => notification.Code == "CLIENTE_EMAIL_DUPLICADO");
        }

        [Fact]
        public async Task DeveRetornarNotificacaoQuandoRequestForInvalido()
        {
            await using var context = CreateContext();
            context.Clientes.Add(CreateClienteExistente(1, "12345678901", "cliente@exemplo.com", "Cliente Um"));
            await context.SaveChangesAsync();

            var command = CreateAtualizarSut(context);
            var request = CreateValidUpdateRequest() with
            {
                Email = "invalido"
            };

            var result = await command.Handle(new AtualizarClienteCommand(1, request));

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, notification => notification.PropertyName == nameof(UpdateClienteRequest.Email));
        }

        [Fact]
        public async Task DeveRetornarNotificacaoQuandoClienteNaoForEncontrado()
        {
            await using var context = CreateContext();
            var command = CreateAtualizarSut(context);

            var result = await command.Handle(new AtualizarClienteCommand(99, CreateValidUpdateRequest()));

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, notification => notification.Code == "CLIENTE_NAO_ENCONTRADO");
        }

        [Fact]
        public async Task DeveLancarArgumentNullExceptionQuandoCommandForNulo()
        {
            await using var context = CreateContext();
            var command = CreateAtualizarSut(context);

            await Assert.ThrowsAsync<ArgumentNullException>(() => command.Handle(null!));
        }
    }

    public class Excluir : ClienteAtualizarExcluirCommandTests
    {
        [Fact]
        public async Task DeveRemoverClienteQuandoExistir()
        {
            await using var context = CreateContext();
            context.Clientes.Add(CreateClienteExistente(1, "12345678901", "cliente@exemplo.com", "Cliente Um"));
            await context.SaveChangesAsync();

            var command = CreateExcluirSut(context);

            var result = await command.Handle(new ExcluirClienteCommand(1));

            Assert.True(result.IsSuccess);
            Assert.Equal(1, result.Data!.ClienteId);
            Assert.Equal("Cliente excluido com sucesso.", result.Message);
            Assert.Empty(context.Clientes);
        }

        [Fact]
        public async Task DeveRetornarNotificacaoQuandoClienteNaoForEncontrado()
        {
            await using var context = CreateContext();
            var command = CreateExcluirSut(context);

            var result = await command.Handle(new ExcluirClienteCommand(99));

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, notification => notification.Code == "CLIENTE_NAO_ENCONTRADO");
        }

        [Fact]
        public async Task DeveLancarArgumentNullExceptionQuandoCommandForNulo()
        {
            await using var context = CreateContext();
            var command = CreateExcluirSut(context);

            await Assert.ThrowsAsync<ArgumentNullException>(() => command.Handle(null!));
        }

        [Fact]
        public async Task DeveRetornarNotificacaoQuandoClienteIdForInvalido()
        {
            await using var context = CreateContext();
            var command = CreateExcluirSut(context);

            var result = await command.Handle(new ExcluirClienteCommand(0));

            Assert.True(result.IsFailure);
        }
    }

    private static ClienteAtualizarCommand CreateAtualizarSut(ShopDbContext context)
    {
        IValidator<AtualizarClienteCommand> validator = new AtualizarClienteCommandValidator();
        var repository = new ClienteRepository(context);

        IUnitOfWork unitOfWork = new UnitOfWork(context);
        return new ClienteAtualizarCommand(validator, repository, unitOfWork);
    }

    private static ClienteExcluirCommand CreateExcluirSut(ShopDbContext context)
    {
        IValidator<ExcluirClienteCommand> validator = new ExcluirClienteCommandValidator();
        var repository = new ClienteRepository(context);

        IUnitOfWork unitOfWork = new UnitOfWork(context);
        return new ClienteExcluirCommand(validator, repository, unitOfWork);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }

    private static UpdateClienteRequest CreateValidUpdateRequest()
    {
        return new UpdateClienteRequest
        {
            Cpf = "12345678901",
            Nome = "Cliente Atual",
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

    private static DomainCliente CreateClienteExistente(long id, string cpf, string email, string nome)
    {
        return DomainCliente.Reconstituir(
            id,
            nome,
            cpf,
            DateOnly.FromDateTime(new DateTime(1990, 1, 1)),
            new DomainEndereco("Rua Existente", "1", null, "00000000", "Centro", "Sao Paulo", "SP"),
            new DomainCelular("11", "988888888", true),
            email);
    }
}



