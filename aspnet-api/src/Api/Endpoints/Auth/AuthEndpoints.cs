using Asp.Versioning;
using aspnet_api.Api.Contracts.Requests.Auth;
using aspnet_api.Api.Contracts.Responses.Auth;
using aspnet_api.Api.Contracts.Responses.Shared;
using aspnet_api.Api.Endpoints.Shared;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Auth.Autenticar;
using aspnet_api.src.Application.Auth.Encerrar;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace aspnet_api.Api.Endpoints.Auth;

public static class AuthEndpoints
{
    private static readonly ApiVersion V1 = new(1, 0);

    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var versionSet = app.NewApiVersionSet("Auth")
            .HasApiVersion(V1)
            .ReportApiVersions()
            .Build();

        var group = app.MapGroup("/api/v{version:apiVersion}/auth")
            .WithTags("Auth")
            .WithApiVersionSet(versionSet);

        group.MapPost("login", Login)
            .AllowAnonymous()
            .Produces<ApiResponse<LoginResponse>>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity)
            .MapToApiVersion(V1);

        group.MapPost("logout", Logout)
            .RequireAuthorization()
            .Produces<ApiResponse<LogoutResponse>>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity)
            .MapToApiVersion(V1);
    }

    private static async Task<IResult> Login(
        LoginRequest request,
        IActionCommand<LoginRequest, Result<LoginResponse>> command)
    {
        var result = await command.Handle(request);
        return result.ToHttpResult(StatusCodes.Status200OK);
    }

    private static async Task<IResult> Logout(
        IActionCommand<EncerrarSessaoCommandInput, Result<LogoutResponse>> command)
    {
        var result = await command.Handle(new EncerrarSessaoCommandInput());
        return result.ToHttpResult(StatusCodes.Status200OK);
    }
}


