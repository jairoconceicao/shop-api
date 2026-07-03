using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.Api.Contracts.Requests.Shared;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Swashbuckle.AspNetCore.SwaggerUI;
using Xunit;

namespace aspnet_api.Tests.Api;

public class SwaggerUiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public SwaggerUiTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder => builder.UseEnvironment("Development"));
    }

    [Fact]
    public async Task Swagger_DeveExporInterfaceEDocumentoOpenApi()
    {
        var client = _factory.CreateClient();

        var swaggerResponse = await client.GetAsync("/swagger/index.html");
        Assert.Equal(HttpStatusCode.OK, swaggerResponse.StatusCode);

        var swaggerHtml = await swaggerResponse.Content.ReadAsStringAsync();
        Assert.Contains("swagger-ui-bundle.js", swaggerHtml);
        Assert.Contains("swagger-ui.css", swaggerHtml);

        var openApiResponse = await client.GetAsync("/openapi/v1.json");
        Assert.Equal(HttpStatusCode.OK, openApiResponse.StatusCode);
        Assert.Equal("application/json", openApiResponse.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public void EnablePersistAuthorization_DeveManterTokenNoSwaggerUi()
    {
        var options = new SwaggerUIOptions();

        options.EnablePersistAuthorization();

        Assert.True(options.ConfigObject.PersistAuthorization);
    }

    [Fact]
    public async Task OpenApi_DeveExporAutenticacaoBearerERotasProtegidas()
    {
        var client = _factory.CreateClient();

        var openApi = await GetOpenApiDocumentAsync(client);

        var securitySchemes = openApi.GetProperty("components").GetProperty("securitySchemes");
        Assert.True(securitySchemes.TryGetProperty("Bearer", out var bearerScheme));
        Assert.Equal("http", bearerScheme.GetProperty("type").GetString());
        Assert.Equal("bearer", bearerScheme.GetProperty("scheme").GetString());
        Assert.Equal("JWT", bearerScheme.GetProperty("bearerFormat").GetString());

        var login = GetOperation(openApi, "/auth/login", "post");
        Assert.False(login.TryGetProperty("security", out _));

        var clientePublico = GetOperation(openApi, "/cliente", "post");
        Assert.False(clientePublico.TryGetProperty("security", out _));

        var logout = GetOperation(openApi, "/auth/logout", "post");
        Assert.True(logout.TryGetProperty("security", out var logoutSecurity));
        Assert.Contains(logoutSecurity.EnumerateArray(), requirement => requirement.TryGetProperty("Bearer", out _));

        var clienteProtegido = GetOperation(openApi, "/cliente/{clienteId}", "get");
        Assert.True(clienteProtegido.TryGetProperty("security", out var clienteSecurity));
        Assert.Contains(clienteSecurity.EnumerateArray(), requirement => requirement.TryGetProperty("Bearer", out _));
    }

    [Fact]
    public async Task Clientes_V1_DeveReportarVersoesSuportadas()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/v1/cliente", CreateValidRequest());
        var responseBody = await response.Content.ReadAsStringAsync();

        Assert.True(response.StatusCode == HttpStatusCode.Created, responseBody);
        Assert.True(response.Headers.TryGetValues("api-supported-versions", out var values));
        Assert.Contains("1.0", values);
    }

    private static CreateClienteRequest CreateValidRequest()
    {
        return new CreateClienteRequest
        {
            Cpf = GenerateUniqueCpf(),
            Nome = "Cliente Teste",
            DataNascimento = DateOnly.FromDateTime(DateTime.Today).AddDays(-1),
            Email = GenerateUniqueEmail(),
            Senha = "SenhaSegura123",
            Endereco = new EnderecoRequest
            {
                Logradouro = "Rua Um",
                Numero = "123",
                Complemento = "Apto 10",
                Cep = "12345678",
                Bairro = "Centro",
                Cidade = "Sao Paulo",
                Uf = "SP"
            },
            Celular = new CelularRequest
            {
                Ddd = "11",
                Numero = "999999999",
                WhatsApp = true
            }
        };
    }

    private static string GenerateUniqueCpf()
    {
        return Random.Shared.NextInt64(10_000_000_000, 100_000_000_000).ToString();
    }

    private static string GenerateUniqueEmail()
    {
        return $"cliente-{Guid.NewGuid():N}@exemplo.com";
    }

    private static async Task<JsonElement> GetOpenApiDocumentAsync(HttpClient client)
    {
        var json = await client.GetStringAsync("/openapi/v1.json");
        using var document = JsonDocument.Parse(json);
        return document.RootElement.Clone();
    }

    private static JsonElement GetOperation(JsonElement openApiDocument, string pathSuffix, string method)
    {
        var path = openApiDocument.GetProperty("paths")
            .EnumerateObject()
            .Single(entry => entry.Name.EndsWith(pathSuffix, StringComparison.Ordinal))
            .Value;

        return path.GetProperty(method);
    }
}



