using System.Net;
using System.Text.Json;
using aspnet_api.Domain.Entities;
using aspnet_api.Tests.Api.Support;
using Xunit;

namespace aspnet_api.Tests.Api;

public class ProdutoEndpointsIntegrationTests : IClassFixture<TestApiFactory>
{
    private readonly TestApiFactory _factory;

    public ProdutoEndpointsIntegrationTests(TestApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task ProdutoEndpointsDevemExporCategoriaBuscaEConsultaPorCategoria()
    {
        await _factory.ResetDatabaseAsync();
        await ApiTestSupport.SeedAuthenticatedClienteAsync(_factory);
        await _factory.ExecuteDbContextAsync(async context =>
        {
            context.CategoriasProdutos.Add(CategoriaProduto.Reconstituir(1, "Audio", "Categoria Audio"));
            context.CategoriasProdutos.Add(CategoriaProduto.Reconstituir(2, "Video", "Categoria Video"));
            context.Produtos.Add(Produto.Reconstituir(1, 1, "Fone Gamer", "Headset", "HX", 199.90m, null, null));
            context.Produtos.Add(Produto.Reconstituir(2, 2, "Monitor", "Tela", "MX", 899.90m, null, null));
            context.Estoques.Add(Estoque.Reconstituir(1, "Fone", DateTime.Now, 1, 0, 10, 5));
            context.Estoques.Add(Estoque.Reconstituir(2, "Monitor", DateTime.Now, 2, 0, 10, 3));
            await Task.CompletedTask;
        });

        var client = await ApiTestSupport.CreateAuthenticatedClientAsync(_factory);

        var buscaResponse = await client.GetAsync("/api/v1/produto?searchword=Fone&page=1&size=10");
        Assert.Equal(HttpStatusCode.OK, buscaResponse.StatusCode);
        using var buscaDocument = JsonDocument.Parse(await buscaResponse.Content.ReadAsStringAsync());
        var buscaItem = buscaDocument.RootElement.GetProperty("pagination").GetProperty("data")[0];
        Assert.Equal("Audio", buscaItem.GetProperty("categoria").GetProperty("titulo").GetString());

        var categoriaResponse = await client.GetAsync("/api/v1/produto/categoria/1?page=1&size=10");
        Assert.Equal(HttpStatusCode.OK, categoriaResponse.StatusCode);

        var detalheResponse = await client.GetAsync("/api/v1/produto/1");
        Assert.Equal(HttpStatusCode.OK, detalheResponse.StatusCode);
        using var detalheDocument = JsonDocument.Parse(await detalheResponse.Content.ReadAsStringAsync());
        Assert.Equal("Audio", detalheDocument.RootElement.GetProperty("data").GetProperty("categoria").GetProperty("titulo").GetString());
    }
}
