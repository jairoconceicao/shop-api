using Asp.Versioning;
using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.Api.Contracts.Responses.Clientes;
using aspnet_api.Api.Contracts.Responses.Shared;
using aspnet_api.Api.Endpoints.Shared;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Cliente.Atualizar;
using aspnet_api.src.Application.Cliente.ConsultarPorCpf;
using aspnet_api.src.Application.Cliente.ConsultarPorId;
using aspnet_api.src.Application.Cliente.Excluir;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace aspnet_api.Api.Endpoints.Clientes;

public static class ClienteEndpoints
{
    private static readonly ApiVersion V1 = new(1, 0);

    public static void MapClienteEndpoints(this IEndpointRouteBuilder app)
    {
        var versionSet = app.NewApiVersionSet("Clientes")
            .HasApiVersion(V1)
            .ReportApiVersions()
            .Build();

        var group = app.MapGroup("/api/v{version:apiVersion}/cliente")
            .WithTags("Clientes")
            .RequireAuthorization()
            .WithApiVersionSet(versionSet);

        group.MapGet("{clienteId:long}", ConsultarClientePorId)
            .Produces<ApiResponse<ClienteDetalheResponse>>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity)
            .MapToApiVersion(V1);

        group.MapGet("cpf/{cpf}", ConsultarClientePorCpf)
            .Produces<ApiResponse<ClienteDetalheResponse>>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity)
            .MapToApiVersion(V1);

        group.MapPost(string.Empty, RegistrarCliente)
            .AllowAnonymous()
            .Produces<ApiResponse<ClienteIdResponse>>(StatusCodes.Status201Created)
            .Produces<ApiErrorResponse>(StatusCodes.Status409Conflict)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .MapToApiVersion(V1);

        group.MapPut("{clienteId:long}", AtualizarCliente)
            .Produces<ApiResponse<ClienteIdResponse>>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ApiErrorResponse>(StatusCodes.Status409Conflict)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity)
            .MapToApiVersion(V1);

        group.MapDelete("{clienteId:long}", ExcluirCliente)
            .Produces<ApiResponse<ClienteIdResponse>>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity)
            .MapToApiVersion(V1);
    }

    private static async Task<IResult> ConsultarClientePorId(
        long clienteId,
        IActionCommand<ConsultarClientePorIdQuery, Result<ClienteDetalheResponse>> command)
    {
        var result = await command.Handle(new ConsultarClientePorIdQuery(clienteId));
        return result.ToHttpResult();
    }

    private static async Task<IResult> ConsultarClientePorCpf(
        string cpf,
        IActionCommand<ConsultarClientePorCpfQuery, Result<ClienteDetalheResponse>> command)
    {
        var result = await command.Handle(new ConsultarClientePorCpfQuery(cpf));
        return result.ToHttpResult();
    }

    private static async Task<IResult> RegistrarCliente(
        CreateClienteRequest request,
        IActionCommand<CreateClienteRequest, Result<ClienteIdResponse>> command)
    {
        var result = await command.Handle(request);
        return result.ToHttpResult(StatusCodes.Status201Created);
    }

    private static async Task<IResult> AtualizarCliente(
        long clienteId,
        UpdateClienteRequest request,
        IActionCommand<AtualizarClienteCommand, Result<ClienteIdResponse>> command)
    {
        var result = await command.Handle(new AtualizarClienteCommand(clienteId, request));
        return result.ToHttpResult(StatusCodes.Status200OK);
    }

    private static async Task<IResult> ExcluirCliente(
        long clienteId,
        IActionCommand<ExcluirClienteCommand, Result<ClienteIdResponse>> command)
    {
        var result = await command.Handle(new ExcluirClienteCommand(clienteId));
        return result.ToHttpResult(StatusCodes.Status200OK);
    }
}
