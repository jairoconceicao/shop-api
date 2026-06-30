using aspnet_api.Domain.Common;
using Xunit;

namespace aspnet_api.Tests.Domain.Common;

public class ResultTests
{
    [Fact]
    public void Success_DeveMarcarResultadoComoBemSucedido()
    {
        var result = Result.Success("ok");

        Assert.True(result.IsSuccess);
        Assert.False(result.IsFailure);
        Assert.Equal("ok", result.Message);
        Assert.Empty(result.Notifications);
    }

    [Fact]
    public void Failure_DeveArmazenarNotificacoes()
    {
        var notification = new Notification("TEST_CODE", "Mensagem de teste", "Campo");

        var result = Result.Failure("Falha", new[] { notification });

        Assert.False(result.IsSuccess);
        Assert.True(result.IsFailure);
        Assert.Equal("Falha", result.Message);
        Assert.Single(result.Notifications);
        Assert.Equal(notification, result.Notifications.Single());
    }
}
