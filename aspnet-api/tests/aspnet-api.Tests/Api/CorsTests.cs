using System.Net;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace aspnet_api.Tests.Api;

public class CorsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public CorsTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder => builder.UseEnvironment("Development"));
    }

    [Fact]
    public async Task Preflight_DevePermitirOrigemDoFrontendLocal()
    {
        var client = _factory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Options, "/api/v1/auth/login");
        request.Headers.TryAddWithoutValidation("Origin", "http://localhost:5173");
        request.Headers.TryAddWithoutValidation("Access-Control-Request-Method", "POST");

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.True(response.Headers.TryGetValues("Access-Control-Allow-Origin", out var allowOrigins));
        Assert.Contains("http://localhost:5173", allowOrigins);
        Assert.True(response.Headers.TryGetValues("Access-Control-Allow-Methods", out var allowMethods));
        Assert.Contains("POST", string.Join(',', allowMethods), StringComparison.OrdinalIgnoreCase);
    }
}
