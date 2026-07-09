using aspnet_api.Api.Contracts.Responses.Categorias;
using aspnet_api.Domain.Entities;

namespace aspnet_api.src.Application.Categoria.Shared;

public static class CategoriaResponseMapper
{
    public static CategoriaResponse ToResponse(this CategoriaProduto categoria)
    {
        return new CategoriaResponse
        {
            CategoriaId = categoria.Id,
            Titulo = categoria.Titulo,
            Descricao = categoria.Descricao
        };
    }
}
