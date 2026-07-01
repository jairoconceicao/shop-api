using aspnet_api.Domain.Entities;
using aspnet_api.Domain.ValueObjects;
using Xunit;

namespace aspnet_api.Tests.Domain.Entities;

public class ClienteFactoryTests
{
    public class Create
    {
        [Fact]
        public void DeveRetornarSucessoQuandoDadosForemValidos()
        {
            var result = Cliente.Create(
                "Cliente Teste",
                "12345678901",
                DateOnly.FromDateTime(DateTime.Today).AddDays(-1),
                CreateEnderecoValido(),
                CreateCelularValido(),
                "cliente@exemplo.com");

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.Equal("Cliente Teste", result.Data!.Nome);
            Assert.Equal("12345678901", result.Data.Cpf);
            Assert.Equal("cliente@exemplo.com", result.Data.Email);
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRetornarNotificacaoQuandoNomeForVazio(string nome)
        {
            var result = Cliente.Create(
                nome,
                "12345678901",
                DateOnly.FromDateTime(DateTime.Today).AddDays(-1),
                CreateEnderecoValido(),
                CreateCelularValido(),
                "cliente@exemplo.com");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CLIENTE_NOME_OBRIGATORIO");
        }

        [Fact]
        public void DeveRetornarNotificacaoQuandoNomeForMuitoLongo()
        {
            var nomeLongo = new string('A', 201);

            var result = Cliente.Create(
                nomeLongo,
                "12345678901",
                DateOnly.FromDateTime(DateTime.Today).AddDays(-1),
                CreateEnderecoValido(),
                CreateCelularValido(),
                "cliente@exemplo.com");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CLIENTE_NOME_TAMANHO_INVALIDO");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRetornarNotificacaoQuandoCpfForVazio(string cpf)
        {
            var result = Cliente.Create(
                "Cliente Teste",
                cpf,
                DateOnly.FromDateTime(DateTime.Today).AddDays(-1),
                CreateEnderecoValido(),
                CreateCelularValido(),
                "cliente@exemplo.com");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CLIENTE_CPF_OBRIGATORIO");
        }

        [Theory]
        [InlineData("123")]
        [InlineData("1234567890")]
        [InlineData("123456789012")]
        [InlineData("123456789AB")]
        public void DeveRetornarNotificacaoQuandoCpfForInvalido(string cpf)
        {
            var result = Cliente.Create(
                "Cliente Teste",
                cpf,
                DateOnly.FromDateTime(DateTime.Today).AddDays(-1),
                CreateEnderecoValido(),
                CreateCelularValido(),
                "cliente@exemplo.com");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CLIENTE_CPF_INVALIDO");
        }

        [Fact]
        public void DeveRetornarNotificacaoQuandoDataNascimentoForFutura()
        {
            var result = Cliente.Create(
                "Cliente Teste",
                "12345678901",
                DateOnly.FromDateTime(DateTime.Today).AddDays(1),
                CreateEnderecoValido(),
                CreateCelularValido(),
                "cliente@exemplo.com");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CLIENTE_DATA_NASCIMENTO_INVALIDA");
        }

        [Fact]
        public void DeveAceitarDataNascimentoNoDiaAtual()
        {
            var result = Cliente.Create(
                "Cliente Teste",
                "12345678901",
                DateOnly.FromDateTime(DateTime.Today),
                CreateEnderecoValido(),
                CreateCelularValido(),
                "cliente@exemplo.com");

            Assert.True(result.IsSuccess);
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRetornarNotificacaoQuandoEmailForVazio(string email)
        {
            var result = Cliente.Create(
                "Cliente Teste",
                "12345678901",
                DateOnly.FromDateTime(DateTime.Today).AddDays(-1),
                CreateEnderecoValido(),
                CreateCelularValido(),
                email);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CLIENTE_EMAIL_OBRIGATORIO");
        }

        [Fact]
        public void DeveRetornarNotificacaoQuandoEmailForMuitoLongo()
        {
            var emailLongo = new string('a', 190) + "@exemplo.com";

            var result = Cliente.Create(
                "Cliente Teste",
                "12345678901",
                DateOnly.FromDateTime(DateTime.Today).AddDays(-1),
                CreateEnderecoValido(),
                CreateCelularValido(),
                emailLongo);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CLIENTE_EMAIL_TAMANHO_INVALIDO");
        }

        [Theory]
        [InlineData("nao-e-email")]
        [InlineData("email@")]
        [InlineData("@email.com")]
        public void DeveRetornarNotificacaoQuandoEmailForInvalido(string email)
        {
            var result = Cliente.Create(
                "Cliente Teste",
                "12345678901",
                DateOnly.FromDateTime(DateTime.Today).AddDays(-1),
                CreateEnderecoValido(),
                CreateCelularValido(),
                email);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CLIENTE_EMAIL_INVALIDO");
        }

        [Fact]
        public void DeveRetornarNotificacaoQuandoEnderecoForNulo()
        {
            var result = Cliente.Create(
                "Cliente Teste",
                "12345678901",
                DateOnly.FromDateTime(DateTime.Today).AddDays(-1),
                null,
                CreateCelularValido(),
                "cliente@exemplo.com");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CLIENTE_ENDERECO_OBRIGATORIO");
        }

        [Fact]
        public void DeveRetornarNotificacaoQuandoCelularForNulo()
        {
            var result = Cliente.Create(
                "Cliente Teste",
                "12345678901",
                DateOnly.FromDateTime(DateTime.Today).AddDays(-1),
                CreateEnderecoValido(),
                null,
                "cliente@exemplo.com");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CLIENTE_CELULAR_OBRIGATORIO");
        }

        [Fact]
        public void DeveRetornarMultiplasNotificacoesQuandoVariosCamposForemInvalidos()
        {
            var result = Cliente.Create(
                "",
                "",
                DateOnly.FromDateTime(DateTime.Today).AddDays(1),
                null,
                null,
                "");

            Assert.True(result.IsFailure);
            Assert.True(result.Notifications.Count >= 5);
        }
    }

    public class AtualizarCom
    {
        [Fact]
        public void DeveAtualizarTodasAsPropriedades()
        {
            var clienteOriginal = Cliente.Create(
                "Original",
                "12345678901",
                DateOnly.FromDateTime(DateTime.Today).AddDays(-30),
                CreateEnderecoValido(),
                CreateCelularValido(),
                "original@exemplo.com").Data!;

            var novoEndereco = new Endereco("Nova Rua", "456", null, "87654321", "Novo Bairro", "Nova Cidade", "RJ");
            var novoCelular = new Celular("21", "988888888", false);
            var clienteNovo = Cliente.Create(
                "Novo",
                "98765432100",
                DateOnly.FromDateTime(DateTime.Today).AddDays(-20),
                novoEndereco,
                novoCelular,
                "novo@exemplo.com").Data!;

            clienteOriginal.AtualizarCom(clienteNovo);

            Assert.Equal("Novo", clienteOriginal.Nome);
            Assert.Equal("98765432100", clienteOriginal.Cpf);
            Assert.Equal("novo@exemplo.com", clienteOriginal.Email);
        }

        [Fact]
        public void DeveLancarArgumentNullExceptionQuandoClienteForNulo()
        {
            var cliente = Cliente.Create(
                "Teste",
                "12345678901",
                DateOnly.FromDateTime(DateTime.Today).AddDays(-1),
                CreateEnderecoValido(),
                CreateCelularValido(),
                "teste@exemplo.com").Data!;

            Assert.Throws<ArgumentNullException>(() => cliente.AtualizarCom(null!));
        }
    }

    private static Endereco CreateEnderecoValido()
    {
        return new Endereco("Rua Um", "123", "Apto 10", "12345678", "Centro", "Sao Paulo", "SP");
    }

    private static Celular CreateCelularValido()
    {
        return new Celular("11", "999999999", true);
    }
}
