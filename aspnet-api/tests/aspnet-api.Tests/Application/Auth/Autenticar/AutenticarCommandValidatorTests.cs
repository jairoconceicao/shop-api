using aspnet_api.Api.Contracts.Requests.Auth;
using aspnet_api.src.Application.Auth.Autenticar;
using Xunit;

namespace aspnet_api.Tests.Application.Auth.Autenticar;

public class AutenticarCommandValidatorTests
{
    private readonly AutenticarCommandValidator _validator = new();

    [Fact]
    public void DeveAceitarRequestValido()
    {
        var result = _validator.Validate(new LoginRequest
        {
            Email = "cliente@exemplo.com",
            Senha = "SenhaValida123"
        });

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void DeveRejeitarEmailVazio(string email)
    {
        var result = _validator.Validate(new LoginRequest
        {
            Email = email,
            Senha = "SenhaValida123"
        });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == "Email e obrigatorio.");
    }

    [Theory]
    [InlineData("nao-e-email")]
    [InlineData("email@")]
    public void DeveRejeitarEmailComFormatoInvalido(string email)
    {
        var result = _validator.Validate(new LoginRequest
        {
            Email = email,
            Senha = "SenhaValida123"
        });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == "Email deve ter um formato valido.");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void DeveRejeitarSenhaVazia(string senha)
    {
        var result = _validator.Validate(new LoginRequest
        {
            Email = "cliente@exemplo.com",
            Senha = senha
        });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == "Senha e obrigatoria.");
    }

    [Theory]
    [InlineData("1234567")]
    [InlineData("curta")]
    public void DeveRejeitarSenhaComMenosDe8Caracteres(string senha)
    {
        var result = _validator.Validate(new LoginRequest
        {
            Email = "cliente@exemplo.com",
            Senha = senha
        });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == "Senha deve ter no minimo 8 caracteres.");
    }
}


