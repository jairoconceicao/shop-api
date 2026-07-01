using aspnet_api.Application.Common;
using Xunit;

namespace aspnet_api.Tests.Application.Common;

public class PagedResultTests
{
    [Fact]
    public void DeveCriarPagedResultComDadosValidos()
    {
        var items = new List<string> { "Item1", "Item2" };
        var result = new PagedResult<string>(items, 1, 10, 25);

        Assert.Equal(items, result.Items);
        Assert.Equal(1, result.Page);
        Assert.Equal(10, result.Size);
        Assert.Equal(25, result.TotalItems);
    }

    [Fact]
    public void DeveCalcularTotalPagesCorretamente()
    {
        var items = new List<string> { "Item1", "Item2" };
        var result = new PagedResult<string>(items, 1, 10, 25);

        Assert.Equal(3, result.TotalPages);
    }

    [Fact]
    public void DeveCalcularTotalPagesComoZeroQuandoSizeForZero()
    {
        var items = new List<string> { "Item1" };
        var result = new PagedResult<string>(items, 1, 0, 10);

        Assert.Equal(0, result.TotalPages);
    }

    [Fact]
    public void DeveCalcularTotalPagesComoZeroQuandoSizeForNegativo()
    {
        var items = new List<string> { "Item1" };
        var result = new PagedResult<string>(items, 1, -1, 10);

        Assert.Equal(0, result.TotalPages);
    }

    [Fact]
    public void DeveCalcularTotalPagesComDivisaoExata()
    {
        var items = new List<string> { "Item1", "Item2" };
        var result = new PagedResult<string>(items, 1, 5, 20);

        Assert.Equal(4, result.TotalPages);
    }

    [Fact]
    public void DeveRetornarListaVaziaQuandoNaoHouverItens()
    {
        var result = new PagedResult<string>(Array.Empty<string>(), 1, 10, 0);

        Assert.Empty(result.Items);
        Assert.Equal(0, result.TotalPages);
    }

    [Fact]
    public void DeveSerUmRecordComEqualitySemantica()
    {
        var items = new List<string> { "Item1" };
        var result1 = new PagedResult<string>(items, 1, 10, 10);
        var result2 = new PagedResult<string>(items, 1, 10, 10);

        Assert.Equal(result1, result2);
    }
}
