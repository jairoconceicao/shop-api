using aspnet_api.src.Domain.Enums;
using System.ComponentModel;
using Xunit;

namespace aspnet_api.Tests.Domain.Enums;

public class StatusPedidoTests
{
    [Fact]
    public void DeveConterTodosOsStatusEsperados()
    {
        var valores = Enum.GetValues<StatusPedido>();

        Assert.Equal(5, valores.Length);
        Assert.Contains(StatusPedido.Criado, valores);
        Assert.Contains(StatusPedido.EmProcessamento, valores);
        Assert.Contains(StatusPedido.Processado, valores);
        Assert.Contains(StatusPedido.Cancelado, valores);
        Assert.Contains(StatusPedido.Devolvido, valores);
    }

    [Theory]
    [InlineData(StatusPedido.Criado, "Criado")]
    [InlineData(StatusPedido.EmProcessamento, "EmProcessamento")]
    [InlineData(StatusPedido.Processado, "Processado")]
    [InlineData(StatusPedido.Cancelado, "Cancelado")]
    [InlineData(StatusPedido.Devolvido, "Devolvido")]
    public void DeveTerDescriptionAttributeCorreto(StatusPedido status, string expectedDescription)
    {
        var field = typeof(StatusPedido).GetField(status.ToString())!;
        var attribute = (DescriptionAttribute?)field.GetCustomAttributes(typeof(DescriptionAttribute), false).FirstOrDefault();

        Assert.NotNull(attribute);
        Assert.Equal(expectedDescription, attribute.Description);
    }
}
