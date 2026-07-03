using aspnet_api.Domain.Entities;
using aspnet_api.Domain.ValueObjects;
using Xunit;

namespace aspnet_api.Tests.Domain.Entities;

public class ClienteFactoryTests
{
    public class Create
    {
        [Fact]
        public void DeveCriarClienteComOsDadosInformados()
        {
            var cliente = Cliente.Create(
                "Cliente Teste",
                "12345678901",
                DateOnly.FromDateTime(DateTime.Today).AddDays(-1),
                CreateEnderecoValido(),
                CreateCelularValido(),
                "cliente@exemplo.com");

            Assert.NotNull(cliente);
            Assert.Equal("Cliente Teste", cliente.Nome);
            Assert.Equal("12345678901", cliente.Cpf);
            Assert.Equal("cliente@exemplo.com", cliente.Email);
            Assert.Equal(DateTime.Today.AddDays(-1), cliente.DataNascimento.Date);
        }

        [Fact]
        public void DevePermitirValoresSemValidacaoNaFactory()
        {
            var cliente = Cliente.Create(
                "",
                "",
                DateOnly.FromDateTime(DateTime.Today).AddDays(1),
                null,
                null,
                "");

            Assert.NotNull(cliente);
            Assert.Equal(string.Empty, cliente.Nome);
            Assert.Equal(string.Empty, cliente.Cpf);
            Assert.Equal(DateTime.Today.AddDays(1), cliente.DataNascimento.Date);
            Assert.Null(cliente.Endereco);
            Assert.Null(cliente.Celular);
            Assert.Equal(string.Empty, cliente.Email);
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
                "original@exemplo.com");

            var novoEndereco = new Endereco("Nova Rua", "456", null, "87654321", "Novo Bairro", "Nova Cidade", "RJ");
            var novoCelular = new Celular("21", "988888888", false);
            var clienteNovo = Cliente.Create(
                "Novo",
                "98765432100",
                DateOnly.FromDateTime(DateTime.Today).AddDays(-20),
                novoEndereco,
                novoCelular,
                "novo@exemplo.com");

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
                "teste@exemplo.com");

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

public class ClienteConstructorContractTests
{
    [Fact]
    public void DevePossuirApenasUmConstrutorPublicoSemParametros()
    {
        var constructors = typeof(Cliente).GetConstructors();

        Assert.Single(constructors);
        Assert.Empty(constructors[0].GetParameters());
    }
}
