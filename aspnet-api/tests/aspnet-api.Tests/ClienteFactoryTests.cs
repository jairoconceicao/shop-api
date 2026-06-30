using aspnet_api.Domain.Entities;
using aspnet_api.Domain.ValueObjects;
using Xunit;

namespace aspnet_api.Tests.Domain.Entities;

public class ClienteFactoryTests
{
    [Fact]
    public void Create_DeveRetornarSucessoQuandoDadosForemValidos()
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
    }

    [Fact]
    public void Create_DeveRetornarNotificacaoQuandoCpfForInvalido()
    {
        var result = Cliente.Create(
            "Cliente Teste",
            "123",
            DateOnly.FromDateTime(DateTime.Today).AddDays(-1),
            CreateEnderecoValido(),
            CreateCelularValido(),
            "cliente@exemplo.com");

        Assert.True(result.IsFailure);
        Assert.Contains(result.Notifications, notification => notification.Code == "CLIENTE_CPF_INVALIDO");
    }

    [Fact]
    public void Create_DeveRetornarNotificacaoQuandoDataNascimentoForFutura()
    {
        var result = Cliente.Create(
            "Cliente Teste",
            "12345678901",
            DateOnly.FromDateTime(DateTime.Today).AddDays(1),
            CreateEnderecoValido(),
            CreateCelularValido(),
            "cliente@exemplo.com");

        Assert.True(result.IsFailure);
        Assert.Contains(result.Notifications, notification => notification.Code == "CLIENTE_DATA_NASCIMENTO_INVALIDA");
    }

    [Fact]
    public void Endereco_Create_DeveRetornarNotificacaoQuandoLogradouroForInvalido()
    {
        var result = Endereco.Create(
            string.Empty,
            "123",
            "Apto 10",
            "12345678",
            "Centro",
            "Sao Paulo",
            "SP");

        Assert.True(result.IsFailure);
        Assert.Contains(result.Notifications, notification => notification.Code == "ENDERECO_LOGRADOURO_OBRIGATORIO");
    }

    [Fact]
    public void Celular_Create_DeveRetornarNotificacaoQuandoDddForInvalido()
    {
        var result = Celular.Create("1", "999999999", true);

        Assert.True(result.IsFailure);
        Assert.Contains(result.Notifications, notification => notification.Code == "CELULAR_DDD_INVALIDO");
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
