using aspnet_api.Api.Contracts.Responses.Categorias;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Categoria.Shared;

namespace aspnet_api.src.Application.Categoria.Carregar;

public sealed class CategoriaCarregarQuery : IActionCommand<CarregarCategoriasQuery, Result<IReadOnlyCollection<CategoriaResponse>>>
{
    private readonly ICategoriaProdutoRepository _categoriaProdutoRepository;

    public CategoriaCarregarQuery(ICategoriaProdutoRepository categoriaProdutoRepository)
    {
        _categoriaProdutoRepository = categoriaProdutoRepository;
    }

    public async Task<Result<IReadOnlyCollection<CategoriaResponse>>> Handle(CarregarCategoriasQuery command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var categorias = await _categoriaProdutoRepository.ListAsync();
        var response = categorias
            .Select(categoria => categoria.ToResponse())
            .ToArray();

        return Result<IReadOnlyCollection<CategoriaResponse>>.Success(
            response,
            "Categorias carregadas com sucesso.");
    }
}
