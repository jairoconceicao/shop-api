using aspnet_api.Domain.Entities;
using Xunit;

namespace aspnet_api.Tests.Domain.Entities;

public class UsuarioFactoryTests
{
    public class Create
    {
        [Fact]
        public void DeveRetornarSucessoQuandoDadosForemValidos()
        {
            var result = Usuario.Create(1, "usuario@exemplo.com", "HASH::segura");

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.Equal(1, result.Data!.ClienteId);
            Assert.Equal("usuario@exemplo.com", result.Data.Email);
            Assert.Equal("HASH::segura", result.Data.SenhaHash);
        }

        [Fact]
        public void DeveNormalizarEmailParaMinusculo()
        {
            var result = Usuario.Create(1, "USUARIO@EXEMPLO.COM", "HASH::segura");

            Assert.True(result.IsSuccess);
            Assert.Equal("usuario@exemplo.com", result.Data!.Email);
        }

        [Fact]
        public void DeveRetornarNotificacaoQuandoClienteIdForInvalido()
        {
            var result = Usuario.Create(0, "usuario@exemplo.com", "HASH::segura");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "USUARIO_CLIENTE_OBRIGATORIO");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRetornarNotificacaoQuandoEmailForVazio(string email)
        {
            var result = Usuario.Create(1, email, "HASH::segura");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "USUARIO_EMAIL_OBRIGATORIO");
        }

        [Fact]
        public void DeveRetornarNotificacaoQuandoEmailForMuitoLongo()
        {
            var emailLongo = new string('a', 190) + "@exemplo.com";
            var result = Usuario.Create(1, emailLongo, "HASH::segura");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "USUARIO_EMAIL_TAMANHO_INVALIDO");
        }

        [Theory]
        [InlineData("nao-e-email")]
        [InlineData("email@")]
        [InlineData("@email.com")]
        public void DeveRetornarNotificacaoQuandoEmailForInvalido(string email)
        {
            var result = Usuario.Create(1, email, "HASH::segura");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "USUARIO_EMAIL_INVALIDO");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRetornarNotificacaoQuandoSenhaHashForVazio(string senhaHash)
        {
            var result = Usuario.Create(1, "usuario@exemplo.com", senhaHash);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "USUARIO_SENHA_OBRIGATORIA");
        }
    }

    public class AtualizarSenha
    {
        [Fact]
        public void DeveAtualizarHashEAtualizadoEm()
        {
            var usuario = Usuario.Create(1, "usuario@exemplo.com", "HASH::antiga").Data!;

            var result = usuario.AtualizarSenha("HASH::nova");

            Assert.True(result.IsSuccess);
            Assert.Equal("HASH::nova", usuario.SenhaHash);
            Assert.NotNull(usuario.AtualizadoEm);
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRetornarNotificacaoQuandoSenhaHashForVazio(string senhaHash)
        {
            var usuario = Usuario.Create(1, "usuario@exemplo.com", "HASH::antiga").Data!;

            var result = usuario.AtualizarSenha(senhaHash);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "USUARIO_SENHA_OBRIGATORIA");
        }
    }
}
