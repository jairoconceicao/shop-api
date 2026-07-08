using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using aspnet_api.Api.Contracts.Responses.Shared;
using aspnet_api.Api.Middleware;
using aspnet_api.Application.Abstractions.Security;
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
    public class InvokeAsync : ValidacaoSessaoJwtMiddlewareTests
    {
        [Fact]
        public async Task DeveProsseguirQuandoSessaoEstiverAtiva()
        {
            await using var context = CreateContext();
            var sessao = SeedSessaoAtiva(context);
            RequestDelegate next = async httpContext =>
            {
                httpContext.Response.StatusCode = StatusCodes.Status204NoContent;
                await Task.CompletedTask;
            };
            var middleware = CreateSut(next);

            var httpContext = CreateHttpContext(sessao.Jti, sessao.UsuarioId);
            var provider = CreateSessaoAtualProvider(httpContext);

            await middleware.InvokeAsync(httpContext, provider, new SessaoRepository(context), new UnitOfWork(context), new FixedTimeProvider(DateTimeOffset.Now));

            Assert.Equal(StatusCodes.Status204NoContent, httpContext.Response.StatusCode);
            Assert.Null((await context.Sessoes.SingleAsync()).RevogadaEm);
        }

        [Fact]
        public async Task DeveRevogarESuspenderQuandoSessaoEstiverExpirada()
        {
            await using var context = CreateContext();
            var sessao = SeedSessaoExpirada(context);
            RequestDelegate next = async httpContext =>
            {
                httpContext.Response.StatusCode = StatusCodes.Status204NoContent;
                await Task.CompletedTask;
            };
            var middleware = CreateSut(next);

            var httpContext = CreateHttpContext(sessao.Jti, sessao.UsuarioId);
            var provider = CreateSessaoAtualProvider(httpContext);

            await middleware.InvokeAsync(httpContext, provider, new SessaoRepository(context), new UnitOfWork(context), new FixedTimeProvider(DateTimeOffset.Now));

            Assert.Equal(StatusCodes.Status401Unauthorized, httpContext.Response.StatusCode);

            var response = await ReadErrorResponseAsync(httpContext);
            Assert.Equal("AUTH_SESSAO_EXPIRADA", response.Error.Code);

            var sessaoAtualizada = await context.Sessoes.SingleAsync();
            Assert.NotNull(sessaoAtualizada.RevogadaEm);
        }

        [Fact]
        public async Task DeveSuspenderQuandoJtiNaoExistir()
        {
            await using var context = CreateContext();
            SeedSessaoAtiva(context);
            RequestDelegate next = async httpContext =>
            {
                httpContext.Response.StatusCode = StatusCodes.Status204NoContent;
                await Task.CompletedTask;
            };
            var middleware = CreateSut(next);

            var httpContext = CreateHttpContext("jti-inexistente", usuarioId: 1);
            var provider = CreateSessaoAtualProvider(httpContext);

            await middleware.InvokeAsync(httpContext, provider, new SessaoRepository(context), new UnitOfWork(context), new FixedTimeProvider(DateTimeOffset.Now));

            Assert.Equal(StatusCodes.Status401Unauthorized, httpContext.Response.StatusCode);

            var response = await ReadErrorResponseAsync(httpContext);
            Assert.Equal("AUTH_SESSAO_NAO_ENCONTRADA", response.Error.Code);

            var sessaoAtualizada = await context.Sessoes.SingleAsync();
            Assert.Null(sessaoAtualizada.RevogadaEm);
        }
    }

    private static ValidacaoSessaoJwtMiddleware CreateSut(RequestDelegate next)
    {
        return new ValidacaoSessaoJwtMiddleware(next);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }

    private static Sessao SeedSessaoAtiva(ShopDbContext context)
    {
        var sessao = Sessao.Create(1, Guid.NewGuid().ToString("N"), DateTime.Now.AddHours(1)).Data!;
        context.Sessoes.Add(sessao);
        context.SaveChanges();
        return sessao;
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

    private static ISessaoAtualProvider CreateSessaoAtualProvider(HttpContext httpContext)
    {
        return new HttpContextSessaoAtualProvider(new HttpContextAccessor
        {
            HttpContext = httpContext
        });
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
        private readonly DateTimeOffset _utcNow;

        public FixedTimeProvider(DateTimeOffset utcNow)
        {
            _utcNow = utcNow;
        }

        public override DateTimeOffset GetUtcNow() => _utcNow;
    }
}
