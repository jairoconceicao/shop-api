using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using aspnet_api.Api.Contracts.Requests.Auth;
using aspnet_api.Domain.Entities;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.Infrastructure.Security;
using aspnet_api.Tests.Api.Support;

namespace aspnet_api.Tests.Api;

internal static class ApiTestSupport
{
    public static async Task SeedAuthenticatedClienteAsync(TestApiFactory factory, long clienteId = 1, string email = "cliente1@exemplo.com", string senha = "SenhaSegura123")
    {
        await factory.ExecuteDbContextAsync(async context =>
        {
            var cliente = Cliente.Reconstituir(clienteId, "Cliente Teste", clienteId.ToString().PadLeft(11, '0'), DateOnly.FromDateTime(new DateTime(1990, 1, 1)), null, null, email);
            context.Clientes.Add(cliente);

            var hasher = new BCryptPasswordHasher();
            context.Usuarios.Add(Usuario.Create(clienteId, email, hasher.Hash(senha)));
            await Task.CompletedTask;
        });
    }

    public static async Task<string> LoginAndGetTokenAsync(HttpClient client, string email = "cliente1@exemplo.com", string senha = "SenhaSegura123")
    {
        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest { Email = email, Senha = senha });
        response.EnsureSuccessStatusCode();

        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return document.RootElement.GetProperty("data").GetProperty("token").GetString()!;
    }

    public static async Task<HttpClient> CreateAuthenticatedClientAsync(TestApiFactory factory, string email = "cliente1@exemplo.com", string senha = "SenhaSegura123")
    {
        var client = factory.CreateClient();
        var token = await LoginAndGetTokenAsync(client, email, senha);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }
}
