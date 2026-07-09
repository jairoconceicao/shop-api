using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using aspnet_api.Domain.Entities;
using aspnet_api.Tests.Api.Support;
using Xunit;

namespace aspnet_api.Tests.Api;

public class PedidoEndpointsIntegrationTests : IClassFixture<TestApiFactory>
{
    private readonly TestApiFactory _factory;

    public PedidoEndpointsIntegrationTests(TestApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task PedidoDevePermitirCriarConsultarListarECancelar()
    {
        await _factory.ResetDatabaseAsync();
        await ApiTestSupport.SeedAuthenticatedClienteAsync(_factory);
        await _factory.ExecuteDbContextAsync(async context =>
        {
            context.Carrinhos.Add(Carrinho.Reconstituir(1, 1, null, DateTime.Now, []));
            await Task.CompletedTask;
        });

        var client = await ApiTestSupport.CreateAuthenticatedClientAsync(_factory);
        var criarResponse = await client.PostAsJsonAsync("/api/v1/pedido", new
        {
            formaPagamento = "Pix",
            dataPedido = DateTime.Now,
            enderecoEntrega = new { logradouro = "Rua Teste", numero = "123", complemento = "Apto", cep = "12345678", bairro = "Centro", cidade = "Sao Paulo", uf = "SP" },
            items = new[] { new { itemId = 1, produtoId = 1, quantidade = 2, valorUnitario = 10.0m } }
        });

        Assert.Equal(HttpStatusCode.Created, criarResponse.StatusCode);
        using var criarDocument = JsonDocument.Parse(await criarResponse.Content.ReadAsStringAsync());
        var pedidoId = criarDocument.RootElement.GetProperty("data").GetProperty("pedidoId").GetInt64();

        var getResponse = await client.GetAsync($"/api/v1/pedido/{pedidoId}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        var listResponse = await client.GetAsync("/api/v1/pedido?cpf=00000000001&page=1&size=10");
        Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);

        var cancelResponse = await client.PatchAsJsonAsync($"/api/v1/pedido/{pedidoId}", new { status = "Cancelado" });
        Assert.Equal(HttpStatusCode.OK, cancelResponse.StatusCode);
    }
}
