using aspnet_api.Domain.Enums;
using Xunit;

namespace aspnet_api.Tests.Domain.Enums;

public class MovimentoTipoTests
{
    [Fact]
    public void DeveConterTodosOsTiposEsperados()
    {
        var valores = Enum.GetValues<MovimentoTipo>();

        Assert.Equal(2, valores.Length);
        Assert.Contains(MovimentoTipo.IN, valores);
        Assert.Contains(MovimentoTipo.OU, valores);
    }

    [Fact]
    public void DeveConverterStringParaMovimentoTipo()
    {
        var entrada = Enum.Parse<MovimentoTipo>("IN");
        var saida = Enum.Parse<MovimentoTipo>("OU");

        Assert.Equal(MovimentoTipo.IN, entrada);
        Assert.Equal(MovimentoTipo.OU, saida);
    }
}


