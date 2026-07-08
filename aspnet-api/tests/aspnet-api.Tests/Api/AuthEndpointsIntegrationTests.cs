using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using aspnet_api.Tests.Api.Support;
using Xunit;

namespace aspnet_api.Tests.Api;

public class AuthEndpointsIntegrationTests : IClassFixture<TestApiFactory>
{
    private readonly TestApiFactory _factory;

    public AuthEndpointsIntegrationTests(TestApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task LoginELogoutDevemSeguirOContratoDaApi()
    {
        await _factory.ResetDatabaseAsync();
        await ApiTestSupport.SeedAuthenticatedClienteAsync(_factory);

        var client = _factory.CreateClient();
        var loginResponse = await client.PostAsJsonAsync("/api/v1/auth/login", new { email = "cliente1@exemplo.com", senha = "SenhaSegura123" });

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        using var loginDocument = JsonDocument.Parse(await loginResponse.Content.ReadAsStringAsync());
        var loginData = loginDocument.RootElement.GetProperty("data");
        Assert.Equal("Bearer", loginData.GetProperty("tipo").GetString());
        Assert.Equal(1, loginData.GetProperty("clienteId").GetInt64());
        Assert.False(string.IsNullOrWhiteSpace(loginData.GetProperty("token").GetString()));

        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", loginData.GetProperty("token").GetString());
        var logoutResponse = await client.PostAsync("/api/v1/auth/logout", null);

        Assert.Equal(HttpStatusCode.OK, logoutResponse.StatusCode);

        using var logoutDocument = JsonDocument.Parse(await logoutResponse.Content.ReadAsStringAsync());
        Assert.False(string.IsNullOrWhiteSpace(logoutDocument.RootElement.GetProperty("data").GetProperty("jti").GetString()));
    }
}
