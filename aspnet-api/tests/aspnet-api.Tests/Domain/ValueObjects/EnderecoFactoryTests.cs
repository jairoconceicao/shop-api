using aspnet_api.Domain.ValueObjects;
using Xunit;

namespace aspnet_api.Tests.Domain.ValueObjects;

public class EnderecoFactoryTests
{
    public class Create
    {
        [Fact]
        public void DeveRetornarSucessoQuandoDadosForemValidos()
        {
            var result = Endereco.Create(
                "Rua Teste",
                "123",
                "Apto 10",
                "12345678",
                "Centro",
                "Sao Paulo",
                "SP");

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.Equal("Rua Teste", result.Data!.Logradouro);
            Assert.Equal("123", result.Data.Numero);
            Assert.Equal("Apto 10", result.Data.Complemento);
            Assert.Equal("12345678", result.Data.Cep);
            Assert.Equal("Centro", result.Data.Bairro);
            Assert.Equal("Sao Paulo", result.Data.Cidade);
            Assert.Equal("SP", result.Data.Uf);
        }

        [Fact]
        public void DeveRetornarSucessoQuandoComplementoForNulo()
        {
            var result = Endereco.Create(
                "Rua Teste",
                "123",
                null,
                "12345678",
                "Centro",
                "Sao Paulo",
                "SP");

            Assert.True(result.IsSuccess);
            Assert.Null(result.Data!.Complemento);
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRetornarNotificacaoQuandoLogradouroForVazio(string logradouro)
        {
            var result = Endereco.Create(
                logradouro,
                "123",
                null,
                "12345678",
                "Centro",
                "Sao Paulo",
                "SP");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "ENDERECO_LOGRADOURO_OBRIGATORIO");
        }

        [Fact]
        public void DeveRetornarNotificacaoQuandoLogradouroForMuitoLongo()
        {
            var logradouroLongo = new string('A', 201);

            var result = Endereco.Create(
                logradouroLongo,
                "123",
                null,
                "12345678",
                "Centro",
                "Sao Paulo",
                "SP");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "ENDERECO_LOGRADOURO_TAMANHO_INVALIDO");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRetornarNotificacaoQuandoNumeroForVazio(string numero)
        {
            var result = Endereco.Create(
                "Rua Teste",
                numero,
                null,
                "12345678",
                "Centro",
                "Sao Paulo",
                "SP");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "ENDERECO_NUMERO_OBRIGATORIO");
        }

        [Fact]
        public void DeveRetornarNotificacaoQuandoNumeroForMuitoLongo()
        {
            var numeroLongo = new string('1', 51);

            var result = Endereco.Create(
                "Rua Teste",
                numeroLongo,
                null,
                "12345678",
                "Centro",
                "Sao Paulo",
                "SP");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "ENDERECO_NUMERO_TAMANHO_INVALIDO");
        }

        [Fact]
        public void DeveRetornarNotificacaoQuandoComplementoForMuitoLongo()
        {
            var complementoLongo = new string('A', 201);

            var result = Endereco.Create(
                "Rua Teste",
                "123",
                complementoLongo,
                "12345678",
                "Centro",
                "Sao Paulo",
                "SP");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "ENDERECO_COMPLEMENTO_TAMANHO_INVALIDO");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRetornarNotificacaoQuandoCepForVazio(string cep)
        {
            var result = Endereco.Create(
                "Rua Teste",
                "123",
                null,
                cep,
                "Centro",
                "Sao Paulo",
                "SP");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "ENDERECO_CEP_OBRIGATORIO");
        }

        [Fact]
        public void DeveRetornarNotificacaoQuandoCepForMuitoLongo()
        {
            var cepLongo = new string('1', 21);

            var result = Endereco.Create(
                "Rua Teste",
                "123",
                null,
                cepLongo,
                "Centro",
                "Sao Paulo",
                "SP");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "ENDERECO_CEP_TAMANHO_INVALIDO");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRetornarNotificacaoQuandoBairroForVazio(string bairro)
        {
            var result = Endereco.Create(
                "Rua Teste",
                "123",
                null,
                "12345678",
                bairro,
                "Sao Paulo",
                "SP");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "ENDERECO_BAIRRO_OBRIGATORIO");
        }

        [Fact]
        public void DeveRetornarNotificacaoQuandoBairroForMuitoLongo()
        {
            var bairroLongo = new string('A', 101);

            var result = Endereco.Create(
                "Rua Teste",
                "123",
                null,
                "12345678",
                bairroLongo,
                "Sao Paulo",
                "SP");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "ENDERECO_BAIRRO_TAMANHO_INVALIDO");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRetornarNotificacaoQuandoCidadeForVazia(string cidade)
        {
            var result = Endereco.Create(
                "Rua Teste",
                "123",
                null,
                "12345678",
                "Centro",
                cidade,
                "SP");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "ENDERECO_CIDADE_OBRIGATORIA");
        }

        [Fact]
        public void DeveRetornarNotificacaoQuandoCidadeForMuitoLonga()
        {
            var cidadeLonga = new string('A', 101);

            var result = Endereco.Create(
                "Rua Teste",
                "123",
                null,
                "12345678",
                "Centro",
                cidadeLonga,
                "SP");

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "ENDERECO_CIDADE_TAMANHO_INVALIDO");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRetornarNotificacaoQuandoUfForVazia(string uf)
        {
            var result = Endereco.Create(
                "Rua Teste",
                "123",
                null,
                "12345678",
                "Centro",
                "Sao Paulo",
                uf);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "ENDERECO_UF_OBRIGATORIA");
        }

        [Theory]
        [InlineData("S")]
        [InlineData("SPA")]
        public void DeveRetornarNotificacaoQuandoUfTiverTamanhoInvalido(string uf)
        {
            var result = Endereco.Create(
                "Rua Teste",
                "123",
                null,
                "12345678",
                "Centro",
                "Sao Paulo",
                uf);

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "ENDERECO_UF_TAMANHO_INVALIDO");
        }

        [Fact]
        public void DeveRetornarMultiplasNotificacoesQuandoVariosCamposForemInvalidos()
        {
            var result = Endereco.Create("", "", "", "", "", "", "");

            Assert.True(result.IsFailure);
            Assert.True(result.Notifications.Count >= 6);
        }
    }
}
