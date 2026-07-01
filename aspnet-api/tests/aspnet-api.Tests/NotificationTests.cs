using aspnet_api.Domain.Common;
using Xunit;

namespace aspnet_api.Tests.Domain.Common;

public class NotificationTests
{
    [Fact]
    public void DeveCriarNotificationComTodosOsCampos()
    {
        var notification = new Notification("CODE", "Mensagem", "Property");

        Assert.Equal("CODE", notification.Code);
        Assert.Equal("Mensagem", notification.Message);
        Assert.Equal("Property", notification.PropertyName);
    }

    [Fact]
    public void DeveCriarNotificationComPropertyNameNulo()
    {
        var notification = new Notification("CODE", "Mensagem");

        Assert.Equal("CODE", notification.Code);
        Assert.Equal("Mensagem", notification.Message);
        Assert.Null(notification.PropertyName);
    }

    [Fact]
    public void DeveSerUmRecordComEqualitySemantica()
    {
        var notification1 = new Notification("CODE", "Mensagem", "Property");
        var notification2 = new Notification("CODE", "Mensagem", "Property");

        Assert.Equal(notification1, notification2);
        Assert.Equal(notification1.GetHashCode(), notification2.GetHashCode());
    }

    [Fact]
    public void DeveSerDiferenteQuandoCodigosForemDiferentes()
    {
        var notification1 = new Notification("CODE1", "Mensagem");
        var notification2 = new Notification("CODE2", "Mensagem");

        Assert.NotEqual(notification1, notification2);
    }

    [Fact]
    public void DevePermitirDesconstrucao()
    {
        var notification = new Notification("CODE", "Mensagem", "Property");
        var (code, message, propertyName) = notification;

        Assert.Equal("CODE", code);
        Assert.Equal("Mensagem", message);
        Assert.Equal("Property", propertyName);
    }

    [Fact]
    public void DevePermitirWithExpressionParaCriarCopiaModificada()
    {
        var original = new Notification("CODE", "Mensagem Original", "Property");
        var modified = original with { Message = "Mensagem Modificada" };

        Assert.Equal("CODE", modified.Code);
        Assert.Equal("Mensagem Modificada", modified.Message);
        Assert.Equal("Property", modified.PropertyName);
        Assert.NotEqual(original, modified);
    }
}
