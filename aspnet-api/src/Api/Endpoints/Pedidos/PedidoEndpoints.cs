using Asp.Versioning;
using aspnet_api.Api.Contracts.Requests.Pedidos;
using aspnet_api.Api.Contracts.Responses.Pedidos;
using aspnet_api.Api.Contracts.Responses.Shared;
using aspnet_api.Api.Endpoints.Shared;
using aspnet_api.Application.Common;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Pedido.Cancelar;
using aspnet_api.src.Application.Pedido.Criar;
using aspnet_api.src.Application.Pedido.Consultar;
using aspnet_api.src.Application.Pedido.ConsultarPorId;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace aspnet_api.Api.Endpoints.Pedidos;

public static class PedidoEndpoints
{
    private static readonly ApiVersion V1 = new(1, 0);

    public static void MapPedidoEndpoints(this IEndpointRouteBuilder app)
    {
        var versionSet = app.NewApiVersionSet("Pedidos")
            .HasApiVersion(V1)
            .ReportApiVersions()
            .Build();

        var group = app.MapGroup("/api/v{version:apiVersion}/pedido")
            .WithTags("Pedidos")
            .RequireAuthorization()
            .WithApiVersionSet(versionSet);

        group.MapPost(string.Empty, CriarPedido)
            .Produces<ApiResponse<PedidoCriadoResponse>>(StatusCodes.Status201Created)
            .Produces<ApiErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ApiErrorResponse>(StatusCodes.Status409Conflict)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity)
            .MapToApiVersion(V1);

        group.MapGet("{pedidoId:long}", ConsultarPedidoPorId)
            .Produces<ApiResponse<PedidoResponse>>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity)
            .MapToApiVersion(V1);

        group.MapGet(string.Empty, ConsultarPedidos)
            .Produces<PagedResponse<PedidoResponse>>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity)
            .MapToApiVersion(V1);

        group.MapPatch("{pedidoId:long}", CancelarPedido)
            .Produces<ApiResponse<PedidoCanceladoResponse>>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity)
            .MapToApiVersion(V1);
    }

    private static async Task<IResult> CriarPedido(
        CreatePedidoRequest request,
        [FromServices] IActionCommand<CreatePedidoRequest, Result<PedidoCriadoResponse>> command)
    {
        var result = await command.Handle(request);
        return result.ToHttpResult(StatusCodes.Status201Created);
    }

    private static async Task<IResult> ConsultarPedidoPorId(
        long pedidoId,
        [FromServices] IActionCommand<ConsultarPedidoPorIdQuery, Result<PedidoResponse>> command)
    {
        var result = await command.Handle(new ConsultarPedidoPorIdQuery(pedidoId));
        return result.ToHttpResult();
    }

    private static async Task<IResult> ConsultarPedidos(
        [FromQuery] string cpf,
        [FromQuery] DateTime? dataInicio,
        [FromQuery] DateTime? dataFim,
        [FromServices] IActionCommand<PedidosQuery, Result<PagedResult<PedidoResponse>>> command,
        int page = 1,
        int size = 20)
    {
        var result = await command.Handle(new PedidosQuery
        {
            Cpf = cpf,
            DataInicio = dataInicio,
            DataFim = dataFim,
            Page = page,
            Size = size
        });

        return result.ToPagedHttpResult();
    }

    private static async Task<IResult> CancelarPedido(
        long pedidoId,
        UpdatePedidoStatusRequest request,
        [FromServices] IActionCommand<CancelarPedidoCommand, Result<PedidoCanceladoResponse>> command)
    {
        var result = await command.Handle(new CancelarPedidoCommand(pedidoId, request));
        return result.ToHttpResult();
    }
}


