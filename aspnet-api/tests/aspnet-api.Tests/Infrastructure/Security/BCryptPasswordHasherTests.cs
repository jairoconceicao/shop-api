using aspnet_api.Infrastructure.Security;
using Xunit;

namespace aspnet_api.Tests.Infrastructure.Security;

public class BCryptPasswordHasherTests
{
    private readonly BCryptPasswordHasher _hasher = new();

    [Fact]
    public void Hash_DeveGerarHashDiferenteParaMesmaSenha()
    {
        var hash1 = _hasher.Hash("Senha12345");
        var hash2 = _hasher.Hash("Senha12345");

        Assert.NotEqual(hash1, hash2);
        Assert.True(hash1.Length > 50);
    }

    [Fact]
    public void Verify_DeveRetornarTrueQuandoSenhaCorreta()
    {
        var hash = _hasher.Hash("Senha12345");

        Assert.True(_hasher.Verify("Senha12345", hash));
    }

    [Fact]
    public void Verify_DeveRetornarFalseQuandoSenhaIncorreta()
    {
        var hash = _hasher.Hash("Senha12345");

        Assert.False(_hasher.Verify("OutraSenha", hash));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Verify_DeveRetornarFalseQuandoEntradaInvalida(string? entrada)
    {
        var hash = _hasher.Hash("Senha12345");

        Assert.False(_hasher.Verify(entrada!, hash));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("hash-invalido")]
    public void Verify_DeveRetornarFalseQuandoHashInvalido(string? hash)
    {
        Assert.False(_hasher.Verify("Senha12345", hash!));
    }

    [Fact]
    public void Hash_DeveLancarExcecaoQuandoSenhaForVazia()
    {
        Assert.ThrowsAny<ArgumentException>(() => _hasher.Hash(""));
    }
}
