using Asp.Versioning;
using aspnet_api.Api.Contracts.Requests.Carrinhos;
using aspnet_api.Api.Contracts.Responses.Carrinhos;
using aspnet_api.Api.Contracts.Responses.Shared;
using aspnet_api.Api.Endpoints.Shared;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Carrinho.AtualizarItem;
using aspnet_api.src.Application.Carrinho.ExcluirItem;
using aspnet_api.src.Application.Carrinho.Obter;
using Microsoft.AspNetCore.Mvc;

namespace aspnet_api.Api.Endpoints.Carrinhos;

public static class CarrinhoEndpoints
{
    private static readonly ApiVersion V1 = new(1, 0);

    public static void MapCarrinhoEndpoints(this IEndpointRouteBuilder app)
    {
        var versionSet = app.NewApiVersionSet("Carrinhos")
            .HasApiVersion(V1)
            .ReportApiVersions()
            .Build();

        var group = app.MapGroup("/api/v{version:apiVersion}/carrinho")
            .WithTags("Carrinhos")
            .RequireAuthorization()
            .WithApiVersionSet(versionSet);

        group.MapGet("{carrinhoId:long}", ObterCarrinho)
            .Produces<ApiResponse<CarrinhoResponse>>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity)
            .MapToApiVersion(V1);

        group.MapPost("criar", CriarCarrinho)
            .Produces<ApiResponse<CarrinhoCriadoResponse>>(StatusCodes.Status201Created)
            .Produces<ApiErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity)
            .MapToApiVersion(V1);

        group.MapPost("items", AdicionarItemAoCarrinho)
            .Produces<ApiResponse<AddCarrinhoItemResponse>>(StatusCodes.Status201Created)
            .Produces<ApiErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity)
            .MapToApiVersion(V1);

        group.MapPatch("items/{itemId:long}", EditarQuantidadeItemDoCarrinho)
            .Produces<ApiResponse<CarrinhoItemIdResponse>>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity)
            .MapToApiVersion(V1);

        group.MapDelete("items/{itemId:long}", ExcluirItemDoCarrinho)
            .Produces<ApiResponse<CarrinhoItemIdResponse>>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status401Unauthorized)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity)
            .MapToApiVersion(V1);
    }

    private static async Task<IResult> ObterCarrinho(
        long carrinhoId,
        [FromServices] IActionCommand<ObterCarrinhoQuery, Result<CarrinhoResponse>> command)
    {
        var result = await command.Handle(new ObterCarrinhoQuery(carrinhoId));
        return result.ToHttpResult();
    }

    private static async Task<IResult> CriarCarrinho(
        [FromServices] IActionCommand<CreateCarrinhoRequest, Result<CarrinhoCriadoResponse>> command)
    {
        var result = await command.Handle(new CreateCarrinhoRequest());
        return result.ToHttpResult(StatusCodes.Status201Created);
    }

    private static async Task<IResult> AdicionarItemAoCarrinho(
        AddCarrinhoItemRequest request,
        [FromServices] IActionCommand<AddCarrinhoItemRequest, Result<AddCarrinhoItemResponse>> command)
    {
        var result = await command.Handle(request);
        return result.ToHttpResult(StatusCodes.Status201Created);
    }

    private static async Task<IResult> EditarQuantidadeItemDoCarrinho(
        long itemId,
        UpdateCarrinhoItemRequest request,
        [FromServices] IActionCommand<AtualizarCarrinhoItemCommand, Result<CarrinhoItemIdResponse>> command)
    {
        var result = await command.Handle(new AtualizarCarrinhoItemCommand(itemId, request));
        return result.ToHttpResult();
    }

    private static async Task<IResult> ExcluirItemDoCarrinho(
        long itemId,
        [FromServices] IActionCommand<ExcluirCarrinhoItemCommand, Result<CarrinhoItemIdResponse>> command)
    {
        var result = await command.Handle(new ExcluirCarrinhoItemCommand(itemId));
        return result.ToHttpResult();
    }
}
