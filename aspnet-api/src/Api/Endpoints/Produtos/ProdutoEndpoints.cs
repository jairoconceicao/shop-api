using Asp.Versioning;
using aspnet_api.Api.Contracts.Requests.Produtos;
using aspnet_api.Api.Contracts.Responses.Produtos;
using aspnet_api.Api.Contracts.Responses.Shared;
using aspnet_api.Api.Endpoints.Shared;
using aspnet_api.Application.Common;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Produto.CarregarCatalogo;
using aspnet_api.src.Application.Produto.ConsultarPorId;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace aspnet_api.Api.Endpoints.Produtos;

public static class ProdutoEndpoints
{
    private static readonly ApiVersion V1 = new(1, 0);

    public static void MapProdutoEndpoints(this IEndpointRouteBuilder app)
    {
        var versionSet = app.NewApiVersionSet("Produtos")
            .HasApiVersion(V1)
            .ReportApiVersions()
            .Build();

        var group = app.MapGroup("/api/v{version:apiVersion}/produto")
            .WithTags("Produtos")
            .WithApiVersionSet(versionSet);

        group.MapGet(string.Empty, CarregarCatalogoProdutos)
            .Produces<PagedResponse<ProdutoCatalogoItemResponse>>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity)
            .MapToApiVersion(V1);

        group.MapGet("{id:long}", ConsultarProdutoPorId)
            .Produces<ApiResponse<ProdutoDetalheResponse>>(StatusCodes.Status200OK)
            .Produces<ApiErrorResponse>(StatusCodes.Status404NotFound)
            .Produces<ApiErrorResponse>(StatusCodes.Status422UnprocessableEntity)
            .MapToApiVersion(V1);
    }

    private static async Task<IResult> CarregarCatalogoProdutos(
        [FromServices] IActionCommand<ProdutosQuery, Result<PagedResult<ProdutoCatalogoItemResponse>>> command,
        int page = 1,
        int size = 20)
    {
        var result = await command.Handle(new ProdutosQuery
        {
            Page = page,
            Size = size
        });

        return result.ToPagedHttpResult();
    }

    private static async Task<IResult> ConsultarProdutoPorId(
        long id,
        [FromServices] IActionCommand<ConsultarProdutoPorIdQuery, Result<ProdutoDetalheResponse>> command)
    {
        var result = await command.Handle(new ConsultarProdutoPorIdQuery(id));
        return result.ToHttpResult();
    }
}
