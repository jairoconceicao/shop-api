using System.Net;
using System.Net.Http.Json;
using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.Api.Contracts.Requests.Shared;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
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
    public async Task Clientes_V1_DeveReportarVersoesSuportadas()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/v1/cliente", CreateValidRequest());

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.True(response.Headers.TryGetValues("api-supported-versions", out var values));
        Assert.Contains("1.0", values);
    }

    private static CreateClienteRequest CreateValidRequest()
    {
        return new CreateClienteRequest
        {
            Cpf = "12345678901",
            Nome = "Cliente Teste",
            DataNascimento = DateOnly.FromDateTime(DateTime.Today).AddDays(-1),
            Email = "cliente@exemplo.com",
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
}
