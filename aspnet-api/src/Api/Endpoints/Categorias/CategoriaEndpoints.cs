using Asp.Versioning;
using aspnet_api.Api.Contracts.Responses.Categorias;
using aspnet_api.Api.Contracts.Responses.Shared;
using aspnet_api.Api.Endpoints.Shared;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Categoria.Carregar;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace aspnet_api.Api.Endpoints.Categorias;

public static class CategoriaEndpoints
{
    private static readonly ApiVersion V1 = new(1, 0);

    public static void MapCategoriaEndpoints(this IEndpointRouteBuilder app)
    {
        var versionSet = app.NewApiVersionSet("Categorias")
            .HasApiVersion(V1)
            .ReportApiVersions()
            .Build();

        app.MapGroup("/api/v{version:apiVersion}/categoria")
            .WithTags("Categorias")
            .WithApiVersionSet(versionSet)
            .MapGet(string.Empty, CarregarCategorias)
            .AllowAnonymous()
            .Produces<ApiResponse<IReadOnlyCollection<CategoriaResponse>>>(StatusCodes.Status200OK)
            .MapToApiVersion(V1);
    }

    private static async Task<IResult> CarregarCategorias(
        IActionCommand<CarregarCategoriasQuery, Result<IReadOnlyCollection<CategoriaResponse>>> command)
    {
        var result = await command.Handle(new CarregarCategoriasQuery());
        return result.ToHttpResult();
    }
}
