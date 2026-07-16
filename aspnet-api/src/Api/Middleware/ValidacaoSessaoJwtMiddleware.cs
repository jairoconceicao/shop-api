using System.Net.Http.Headers;
using aspnet_api.Api.Contracts.Responses.Shared;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Application.Abstractions.Security;
using Microsoft.AspNetCore.Http;

namespace aspnet_api.Api.Middleware;

public sealed class ValidacaoSessaoJwtMiddleware
{
    private readonly RequestDelegate _next;

    public ValidacaoSessaoJwtMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(
        HttpContext context,
        ISessaoAtualProvider sessaoAtualProvider,
        ISessaoRepository sessaoRepository,
        IUnitOfWork unitOfWork,
        TimeProvider timeProvider)
    {
        if (!HasBearerAuthorization(context.Request.Headers.Authorization))
        {
            await _next(context);
            return;
        }

        if (context.User.Identity?.IsAuthenticated != true)
        {
            await _next(context);
            return;
        }

        var jti = sessaoAtualProvider.Jti;
        if (string.IsNullOrWhiteSpace(jti))
        {
            await RejectAsync(context, "AUTH_SESSAO_NAO_IDENTIFICADA", "Token nao possui identificador de sessao.", "jti");
            return;
        }

        var usuarioId = sessaoAtualProvider.UsuarioId;
        if (usuarioId is null)
        {
            await RejectAsync(context, "AUTH_SESSAO_NAO_IDENTIFICADA", "Token nao possui usuario associado.", "sub");
            return;
        }

        var sessao = await sessaoRepository.GetByJtiAsync(jti, context.RequestAborted);
        if (sessao is null || sessao.UsuarioId != usuarioId.Value)
        {
            await RejectAsync(context, "AUTH_SESSAO_NAO_ENCONTRADA", "Sessao nao encontrada para o token informado.", "jti");
            return;
        }

        var agora = timeProvider.GetUtcNow().DateTime;
        if (sessao.EstaAtiva(agora))
        {
            await _next(context);
            return;
        }

        if (sessao.RevogadaEm is null)
        {
            var revogarResult = sessao.Revogar();
            if (revogarResult.IsSuccess)
            {
                sessaoRepository.Update(sessao);
                await unitOfWork.SaveChangesAsync(context.RequestAborted);
            }
        }

        await RejectAsync(context, "AUTH_SESSAO_EXPIRADA", "Sessao expirada.", "jti");
    }

    private static bool HasBearerAuthorization(string? authorization)
    {
        return AuthenticationHeaderValue.TryParse(authorization, out var header)
            && string.Equals(header.Scheme, "Bearer", StringComparison.OrdinalIgnoreCase)
            && !string.IsNullOrWhiteSpace(header.Parameter);
    }

    private static async Task RejectAsync(HttpContext context, string code, string message, string propertyName)
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;

        await context.Response.WriteAsJsonAsync(new ApiErrorResponse
        {
            Error = new ApiError
            {
                Code = code,
                Message = message,
                Details = new[]
                {
                    new ApiNotificationResponse
                    {
                        Code = code,
                        Message = message,
                        PropertyName = propertyName
                    }
                }
            }
        });
    }
}