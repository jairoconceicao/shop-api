using aspnet_api.Domain.ValueObjects;
using Xunit;

namespace aspnet_api.Tests.Domain.ValueObjects;

public class CelularFactoryTests
{
    public class Create
    {
        [Fact]
        public void DeveRetornarSucessoQuandoDadosForemValidos()
        {
            var result = Celular.Create("11", "999999999", true);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.Equal("11", result.Data!.Ddd);
            Assert.Equal("999999999", result.Data.Numero);
            Assert.True(result.Data.WhatsApp);
        }

        [Fact]
        public void DeveRetornarSucessoQuandoWhatsAppForFalso()
        {
            var result = Celular.Create("11", "999999999", false);

            Assert.True(result.IsSuccess);
            Assert.False(result.Data!.WhatsApp);
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRetornarNotificacaoQuandoDddForVazio(string ddd)
        {
            var result = Celular.Create(ddd, "999999999", true);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CELULAR_DDD_OBRIGATORIO");
        }

        [Theory]
        [InlineData("1")]
        [InlineData("123")]
        [InlineData("1A")]
        [InlineData("AB")]
        public void DeveRetornarNotificacaoQuandoDddForInvalido(string ddd)
        {
            var result = Celular.Create(ddd, "999999999", true);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CELULAR_DDD_INVALIDO");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRetornarNotificacaoQuandoNumeroForVazio(string numero)
        {
            var result = Celular.Create("11", numero, true);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CELULAR_NUMERO_OBRIGATORIO");
        }

        [Fact]
        public void DeveRetornarNotificacaoQuandoNumeroForMuitoLongo()
        {
            var numeroLongo = new string('9', 31);

            var result = Celular.Create("11", numeroLongo, true);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "CELULAR_NUMERO_TAMANHO_INVALIDO");
        }

        [Fact]
        public void DeveRetornarMultiplasNotificacoesQuandoDddENumeroForemInvalidos()
        {
            var result = Celular.Create("", "", true);

            Assert.True(result.IsFailure);
            Assert.Equal(2, result.Notifications.Count);
        }
    }
}
