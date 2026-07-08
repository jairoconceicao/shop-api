using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using aspnet_api.Domain.Entities;
using aspnet_api.Tests.Api.Support;
using Xunit;

namespace aspnet_api.Tests.Api;

public class CarrinhoEndpointsIntegrationTests : IClassFixture<TestApiFactory>
{
    private readonly TestApiFactory _factory;

    public CarrinhoEndpointsIntegrationTests(TestApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task CarrinhoDevePermitirFluxoCompletoDoClienteAutenticado()
    {
        await _factory.ResetDatabaseAsync();
        await ApiTestSupport.SeedAuthenticatedClienteAsync(_factory);
        await _factory.ExecuteDbContextAsync(async context =>
        {
            context.CategoriasProdutos.Add(CategoriaProduto.Reconstituir(1, "Perifericos", "Categoria"));
            context.Produtos.Add(Produto.Reconstituir(1, "Mouse", "Mouse gamer", "MG", 99.90m, null, null));
            await Task.CompletedTask;
        });

        var client = await ApiTestSupport.CreateAuthenticatedClientAsync(_factory);
        var criarResponse = await client.PostAsJsonAsync("/api/v1/carrinho/criar", new { clienteId = 1 });
        Assert.Equal(HttpStatusCode.Created, criarResponse.StatusCode);
        using var criarDocument = JsonDocument.Parse(await criarResponse.Content.ReadAsStringAsync());
        var carrinhoId = criarDocument.RootElement.GetProperty("data").GetProperty("carrinhoId").GetInt64();

        var addResponse = await client.PostAsJsonAsync("/api/v1/carrinho/items", new { produtoId = 1, quantidade = 2, valorUnitario = 99.90m });
        Assert.Equal(HttpStatusCode.Created, addResponse.StatusCode);
        using var addDocument = JsonDocument.Parse(await addResponse.Content.ReadAsStringAsync());
        var itemId = addDocument.RootElement.GetProperty("data").GetProperty("itemId").GetInt64();

        var patchResponse = await client.PatchAsJsonAsync($"/api/v1/carrinho/items/{itemId}", new { quantidade = 3 });
        Assert.Equal(HttpStatusCode.OK, patchResponse.StatusCode);

        var getResponse = await client.GetAsync($"/api/v1/carrinho/{carrinhoId}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        var deleteResponse = await client.DeleteAsync($"/api/v1/carrinho/items/{itemId}");
        Assert.Equal(HttpStatusCode.OK, deleteResponse.StatusCode);
    }
}
