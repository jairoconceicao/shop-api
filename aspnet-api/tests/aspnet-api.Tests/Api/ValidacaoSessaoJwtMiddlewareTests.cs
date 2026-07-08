using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using aspnet_api.Api.Contracts.Responses.Shared;
using aspnet_api.Api.Middleware;
using aspnet_api.Domain.Entities;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.Infrastructure.Repositories;
using aspnet_api.Infrastructure.Security;
using aspnet_api.src.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace aspnet_api.Tests.Api;

public class ValidacaoSessaoJwtMiddlewareTests
{
    [Fact]
    public async Task DeveRevogarESuspenderQuandoSessaoEstiverExpirada()
    {
        await using var context = CreateContext();
        var sessao = SeedSessaoExpirada(context);
        RequestDelegate next = httpContext =>
        {
            httpContext.Response.StatusCode = StatusCodes.Status204NoContent;
            return Task.CompletedTask;
        };

        var middleware = new ValidacaoSessaoJwtMiddleware(next);
        var httpContext = CreateHttpContext(sessao.Jti, sessao.UsuarioId);
        var provider = new HttpContextSessaoAtualProvider(new HttpContextAccessor { HttpContext = httpContext });

        await middleware.InvokeAsync(httpContext, provider, new SessaoRepository(context), new UnitOfWork(context), new FixedTimeProvider(DateTimeOffset.UtcNow));

        Assert.Equal(StatusCodes.Status401Unauthorized, httpContext.Response.StatusCode);
        var response = await ReadErrorResponseAsync(httpContext);
        Assert.Equal("AUTH_SESSAO_EXPIRADA", response.Error.Code);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }

    private static Sessao SeedSessaoExpirada(ShopDbContext context)
    {
        var sessao = Sessao.Reconstituir(1, 1, Guid.NewGuid().ToString("N"), DateTime.Now.AddHours(-2), DateTime.Now.AddMinutes(-5), null);
        context.Sessoes.Add(sessao);
        context.SaveChanges();
        return sessao;
    }

    private static HttpContext CreateHttpContext(string jti, long usuarioId)
    {
        var serviceProvider = new ServiceCollection()
            .AddOptions()
            .ConfigureHttpJsonOptions(_ => { })
            .BuildServiceProvider();

        var context = new DefaultHttpContext
        {
            RequestServices = serviceProvider,
            User = new ClaimsPrincipal(new ClaimsIdentity(
            [
                new Claim(JwtRegisteredClaimNames.Jti, jti),
                new Claim(JwtRegisteredClaimNames.Sub, usuarioId.ToString())
            ], "Bearer"))
        };

        context.Request.Headers.Authorization = $"Bearer token-{jti}";
        context.Response.Body = new MemoryStream();
        return context;
    }

    private static async Task<ApiErrorResponse> ReadErrorResponseAsync(HttpContext httpContext)
    {
        httpContext.Response.Body.Position = 0;
        using var reader = new StreamReader(httpContext.Response.Body, leaveOpen: true);
        var json = await reader.ReadToEndAsync();
        return JsonSerializer.Deserialize<ApiErrorResponse>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web)
        {
            PropertyNameCaseInsensitive = true
        })!;
    }

    private sealed class FixedTimeProvider : TimeProvider
    {
        private readonly DateTimeOffset _now;

        public FixedTimeProvider(DateTimeOffset now)
        {
            _now = now;
        }

        public override DateTimeOffset GetUtcNow() => _now;
    }
}
