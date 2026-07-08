using System.Net;
using System.Net.Http.Json;
using aspnet_api.Tests.Api.Support;
using Xunit;

namespace aspnet_api.Tests.Api;

public class ClienteEndpointsIntegrationTests : IClassFixture<TestApiFactory>
{
    private readonly TestApiFactory _factory;

    public ClienteEndpointsIntegrationTests(TestApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task PutSenhaDeveAtualizarSenhaDoClienteAutenticado()
    {
        await _factory.ResetDatabaseAsync();
        await ApiTestSupport.SeedAuthenticatedClienteAsync(_factory);

        var client = await ApiTestSupport.CreateAuthenticatedClientAsync(_factory);
        var response = await client.PutAsJsonAsync("/api/v1/cliente/1/senha", new { senhaAtual = "SenhaSegura123", senhaNova = "NovaSenha123" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var relogin = _factory.CreateClient();
        var loginResponse = await relogin.PostAsJsonAsync("/api/v1/auth/login", new { email = "cliente1@exemplo.com", senha = "NovaSenha123" });
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
    }

    [Fact]
    public async Task GetClienteDeveRetornar403QuandoClienteAutenticadoNaoForODono()
    {
        await _factory.ResetDatabaseAsync();
        await ApiTestSupport.SeedAuthenticatedClienteAsync(_factory, 1, "cliente1@exemplo.com", "SenhaSegura123");
        await ApiTestSupport.SeedAuthenticatedClienteAsync(_factory, 2, "cliente2@exemplo.com", "SenhaSegura123");

        var client = await ApiTestSupport.CreateAuthenticatedClientAsync(_factory, "cliente2@exemplo.com", "SenhaSegura123");
        var response = await client.GetAsync("/api/v1/cliente/1");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
