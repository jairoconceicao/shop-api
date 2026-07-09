using System.Net;
using System.Text.Json;
using aspnet_api.Domain.Entities;
using aspnet_api.Tests.Api.Support;
using Xunit;

namespace aspnet_api.Tests.Api;

public class CategoriaEndpointsIntegrationTests : IClassFixture<TestApiFactory>
{
    private readonly TestApiFactory _factory;

    public CategoriaEndpointsIntegrationTests(TestApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CategoriaEndpointsDevemRetornarApiResponseComColecaoEmData()
    {
        await _factory.ResetDatabaseAsync();
        await _factory.ExecuteDbContextAsync(async context =>
        {
            context.CategoriasProdutos.Add(CategoriaProduto.Reconstituir(2, "Video", "Categoria Video"));
            context.CategoriasProdutos.Add(CategoriaProduto.Reconstituir(1, "Audio", "Categoria Audio"));
            await Task.CompletedTask;
        });

        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/v1/categoria");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = document.RootElement;

        Assert.True(root.GetProperty("status").GetBoolean());
        Assert.Equal("Categorias carregadas com sucesso.", root.GetProperty("message").GetString());

        var data = root.GetProperty("data");
        Assert.Equal(JsonValueKind.Array, data.ValueKind);
        Assert.Equal(2, data.GetArrayLength());
        Assert.Equal(1, data[0].GetProperty("categoriaId").GetInt64());
        Assert.Equal("Audio", data[0].GetProperty("titulo").GetString());
        Assert.Equal("Categoria Audio", data[0].GetProperty("descricao").GetString());
    }
}
