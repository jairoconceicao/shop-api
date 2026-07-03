using aspnet_api.Domain.Common;
using Xunit;

namespace aspnet_api.Tests.Domain.Common;

public class ResultTests
{
    public class Success
    {
        [Fact]
        public void DeveMarcarResultadoComoBemSucedido()
        {
            var result = Result.Success("ok");

            Assert.True(result.IsSuccess);
            Assert.False(result.IsFailure);
            Assert.Equal("ok", result.Message);
            Assert.Empty(result.Notifications);
        }

        [Fact]
        public void DeveUsarMensagemPadraoQuandoNaoFornecida()
        {
            var result = Result.Success();

            Assert.True(result.IsSuccess);
            Assert.Equal("Operacao concluida com sucesso.", result.Message);
        }
    }

    public class Failure
    {
        [Fact]
        public void DeveArmazenarNotificacoes()
        {
            var notification = new Notification("TEST_CODE", "Mensagem de teste", "Campo");

            var result = Result.Failure("Falha", new[] { notification });

            Assert.False(result.IsSuccess);
            Assert.True(result.IsFailure);
            Assert.Equal("Falha", result.Message);
            Assert.Single(result.Notifications);
            Assert.Equal(notification, result.Notifications.Single());
        }

        [Fact]
        public void DeveCriarResultadoVazioQuandoNotificacoesForemNulas()
        {
            var result = Result.Failure("Falha");

            Assert.False(result.IsSuccess);
            Assert.True(result.IsFailure);
            Assert.Empty(result.Notifications);
        }

        [Fact]
        public void DeveArmazenarMultiplasNotificacoes()
        {
            var notifications = new[]
            {
                new Notification("CODE1", "Erro 1", "Prop1"),
                new Notification("CODE2", "Erro 2", "Prop2")
            };

            var result = Result.Failure("Falha", notifications);

            Assert.Equal(2, result.Notifications.Count);
        }
    }

    public class GenericResult
    {
        [Fact]
        public void Success_DeveRetornarDadosComSucesso()
        {
            var data = new { Id = 1, Nome = "Teste" };
            var result = Result<object>.Success(data, "Sucesso");

            Assert.True(result.IsSuccess);
            Assert.False(result.IsFailure);
            Assert.Equal(data, result.Data);
            Assert.Equal("Sucesso", result.Message);
            Assert.Empty(result.Notifications);
        }

        [Fact]
        public void Success_DeveUsarMensagemPadraoQuandoNaoFornecida()
        {
            var result = Result<string>.Success("dados");

            Assert.Equal("Operacao concluida com sucesso.", result.Message);
        }

        [Fact]
        public void Failure_DeveRetornarDadosNulos()
        {
            var result = Result<string>.Failure("Erro");

            Assert.True(result.IsFailure);
            Assert.Null(result.Data);
            Assert.Equal("Erro", result.Message);
        }

        [Fact]
        public void Failure_DeveArmazenarNotificacoes()
        {
            var notification = new Notification("CODE", "Erro", "Prop");
            var result = Result<int>.Failure("Erro", new[] { notification });

            Assert.Single(result.Notifications);
            Assert.Equal(notification, result.Notifications.Single());
        }

        [Fact]
        public void Failure_DeveCriarResultadoVazioQuandoNotificacoesForemNulas()
        {
            var result = Result<int>.Failure("Erro");

            Assert.Empty(result.Notifications);
        }

        [Fact]
        public void IsFailure_DeveSerVerdadeiroQuandoIsSuccessForFalso()
        {
            var result = Result<string>.Failure("Erro");

            Assert.True(result.IsFailure);
            Assert.False(result.IsSuccess);
        }
    }
}


