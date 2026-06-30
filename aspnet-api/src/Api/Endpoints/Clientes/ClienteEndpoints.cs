using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.Api.Contracts.Responses.Clientes;
using aspnet_api.Api.Contracts.Responses.Shared;
using aspnet_api.Api.Endpoints.Shared;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Cliente.Atualizar;
using aspnet_api.src.Application.Cliente.Excluir;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace aspnet_api.Api.Endpoints.Clientes;

public static class ClienteEndpoints
{
    public static void MapClienteEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/cliente")
            .WithTags("Clientes");

        group.MapPost(string.Empty, RegistrarCliente)
            .Produces<ApiResponse<ClienteIdResponse>>(StatusCodes.Status201Created)
            .Produces<ApiErrorResponse>(StatusCodes.Status409Conflict)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound);

        group.MapPut("{clienteId:long}", AtualizarCliente)
            .Produces<ApiResponse<ClienteIdResponse>>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ApiErrorResponse>(StatusCodes.Status409Conflict)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity);

        group.MapDelete("{clienteId:long}", ExcluirCliente)
            .Produces<ApiResponse<ClienteIdResponse>>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity);
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
