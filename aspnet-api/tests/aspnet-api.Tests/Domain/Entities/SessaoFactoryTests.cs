using aspnet_api.Domain.Entities;
using Xunit;

namespace aspnet_api.Tests.Domain.Entities;

public class SessaoFactoryTests
{
    public class Create
    {
        [Fact]
        public void DeveRetornarSucessoQuandoDadosForemValidos()
        {
            var expiraEm = DateTime.UtcNow.AddHours(2);

            var result = Sessao.Create(1, Guid.NewGuid().ToString("N"), expiraEm);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.Equal(1, result.Data!.UsuarioId);
            Assert.Equal(expiraEm, result.Data.ExpiraEm);
            Assert.Null(result.Data.RevogadaEm);
            Assert.True(result.Data.EstaAtiva(DateTime.UtcNow));
        }

        [Fact]
        public void DeveRetornarNotificacaoQuandoUsuarioIdForInvalido()
        {
            var result = Sessao.Create(0, Guid.NewGuid().ToString("N"), DateTime.UtcNow.AddHours(1));

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "SESSAO_USUARIO_OBRIGATORIO");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRetornarNotificacaoQuandoJtiForVazio(string jti)
        {
            var result = Sessao.Create(1, jti, DateTime.UtcNow.AddHours(1));

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "SESSAO_JTI_OBRIGATORIO");
        }

        [Fact]
        public void DeveRetornarNotificacaoQuandoExpiracaoForPassada()
        {
            var result = Sessao.Create(1, Guid.NewGuid().ToString("N"), DateTime.UtcNow.AddMinutes(-1));

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "SESSAO_EXPIRACAO_INVALIDA");
        }
    }

    public class Revogar
    {
        [Fact]
        public void DeveRevogarSessaoAtiva()
        {
            var sessao = Sessao.Create(1, Guid.NewGuid().ToString("N"), DateTime.UtcNow.AddHours(1)).Data!;

            var result = sessao.Revogar();

            Assert.True(result.IsSuccess);
            Assert.NotNull(sessao.RevogadaEm);
            Assert.False(sessao.EstaAtiva(DateTime.UtcNow));
        }

        [Fact]
        public void DeveRetornarNotificacaoQuandoSessaoJaEstiverRevogada()
        {
            var sessao = Sessao.Create(1, Guid.NewGuid().ToString("N"), DateTime.UtcNow.AddHours(1)).Data!;
            sessao.Revogar();

            var result = sessao.Revogar();

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "SESSAO_JA_REVOGADA");
        }
    }

    public class EstaAtiva
    {
        [Fact]
        public void DeveRetornarFalsoQuandoExpirada()
        {
            var sessao = Sessao.Create(1, Guid.NewGuid().ToString("N"), DateTime.UtcNow.AddSeconds(1)).Data!;

            Assert.False(sessao.EstaAtiva(DateTime.UtcNow.AddHours(1)));
        }

        [Fact]
        public void DeveRetornarFalsoQuandoRevogada()
        {
            var sessao = Sessao.Create(1, Guid.NewGuid().ToString("N"), DateTime.UtcNow.AddHours(1)).Data!;
            sessao.Revogar();

            Assert.False(sessao.EstaAtiva(DateTime.UtcNow));
        }
    }
}


