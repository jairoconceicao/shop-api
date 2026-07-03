using aspnet_api.Domain.Entities;
using Xunit;

namespace aspnet_api.Tests.Domain.Entities;

public class UsuarioFactoryTests
{
    public class Create
    {
        [Fact]
        public void DeveCriarUsuarioComOsDadosInformados()
        {
            var usuario = Usuario.Create(1, "usuario@exemplo.com", "HASH::segura");

            Assert.NotNull(usuario);
            Assert.Equal(1, usuario.ClienteId);
            Assert.Equal("usuario@exemplo.com", usuario.Email);
            Assert.Equal("HASH::segura", usuario.SenhaHash);
            Assert.Equal(0, usuario.Id);
        }

        [Fact]
        public void DeveNormalizarEmailParaMinusculo()
        {
            var usuario = Usuario.Create(1, "USUARIO@EXEMPLO.COM", "HASH::segura");

            Assert.Equal("usuario@exemplo.com", usuario.Email);
        }
    }

    public class AtualizarSenha
    {
        [Fact]
        public void DeveAtualizarHashEAtualizadoEm()
        {
            var usuario = Usuario.Create(1, "usuario@exemplo.com", "HASH::antiga");

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
            var usuario = Usuario.Create(1, "usuario@exemplo.com", "HASH::antiga");

            var result = usuario.AtualizarSenha(senhaHash);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "USUARIO_SENHA_OBRIGATORIA");
        }
    }
}
