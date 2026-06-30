using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.Api.Contracts.Requests.Shared;
using aspnet_api.src.Application.Cliente.Registrar;
using Xunit;

namespace aspnet_api.Tests.Application.Cliente.Registrar;

public class ClienteRegistrarCommandValidatorTests
{
    private readonly ClienteRegistrarCommandValidator _validator = new();

    [Fact]
    public void Validate_DeveAceitarRequestValido()
    {
        var result = _validator.Validate(CreateValidRequest());

        Assert.True(result.IsValid);
        Assert.Empty(result.Errors);
    }

    [Fact]
    public void Validate_DeveRejeitarCpfVazio()
    {
        var result = _validator.Validate(CreateValidRequest() with { Cpf = string.Empty });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.ErrorMessage == "CPF e obrigatorio.");
    }

    [Fact]
    public void Validate_DeveRejeitarCpfComFormatoInvalido()
    {
        var result = _validator.Validate(CreateValidRequest() with { Cpf = "123" });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.ErrorMessage == "CPF deve conter 11 digitos numericos.");
    }

    [Fact]
    public void Validate_DeveRejeitarNomeVazio()
    {
        var result = _validator.Validate(CreateValidRequest() with { Nome = string.Empty });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.ErrorMessage == "Nome e obrigatorio.");
    }

    [Fact]
    public void Validate_DeveRejeitarDataNascimentoFutura()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var result = _validator.Validate(CreateValidRequest() with { DataNascimento = today.AddDays(1) });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.ErrorMessage == "Data de nascimento nao pode ser futura.");
    }

    [Fact]
    public void Validate_DeveRejeitarEmailInvalido()
    {
        var result = _validator.Validate(CreateValidRequest() with { Email = "nao-e-email" });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.ErrorMessage == "Email deve ter um formato valido.");
    }

    [Fact]
    public void Validate_DeveRejeitarEnderecoNulo()
    {
        var result = _validator.Validate(CreateValidRequest() with { Endereco = null! });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.ErrorMessage == "Endereco e obrigatorio.");
    }

    [Fact]
    public void Validate_DeveRejeitarEnderecoComLogradouroVazio()
    {
        var result = _validator.Validate(CreateValidRequest() with
        {
            Endereco = CreateValidEndereco() with { Logradouro = string.Empty }
        });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.ErrorMessage == "Logradouro e obrigatorio.");
    }

    [Fact]
    public void Validate_DeveRejeitarCelularNulo()
    {
        var result = _validator.Validate(CreateValidRequest() with { Celular = null! });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.ErrorMessage == "Celular e obrigatorio.");
    }

    [Fact]
    public void Validate_DeveRejeitarCelularComDddInvalido()
    {
        var result = _validator.Validate(CreateValidRequest() with
        {
            Celular = CreateValidCelular() with { Ddd = "1" }
        });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.ErrorMessage == "DDD deve conter 2 digitos numericos.");
    }

    [Fact]
    public void Validate_DeveRejeitarCelularComNumeroMuitoGrande()
    {
        var result = _validator.Validate(CreateValidRequest() with
        {
            Celular = CreateValidCelular() with { Numero = new string('9', 31) }
        });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.ErrorMessage == "Numero de celular deve ter no maximo 30 caracteres.");
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
}
