using aspnet_api.Api.Contracts.Requests.Produtos;
using aspnet_api.Api.Contracts.Responses.Produtos;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Application.Common;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Common;
using aspnet_api.src.Application.Produto.Shared;
using FluentValidation;

namespace aspnet_api.src.Application.Produto.CarregarCatalogo;

public sealed class ProdutoCarregarCatalogoQuery : IActionCommand<ProdutosQuery, Result<PagedResult<ProdutoCatalogoItemResponse>>>
{
    private readonly IValidator<ProdutosQuery> _validator;
    private readonly IProdutoRepository _produtoRepository;
    private readonly IEstoqueRepository _estoqueRepository;

    public ProdutoCarregarCatalogoQuery(
        IValidator<ProdutosQuery> validator,
        IProdutoRepository produtoRepository,
        IEstoqueRepository estoqueRepository)
    {
        _validator = validator;
        _produtoRepository = produtoRepository;
        _estoqueRepository = estoqueRepository;
    }

    public async Task<Result<PagedResult<ProdutoCatalogoItemResponse>>> Handle(ProdutosQuery command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Result<PagedResult<ProdutoCatalogoItemResponse>>.Failure(
                "Dados invalidos para o carregamento do catalogo de produtos.",
                validationResult.Errors.ToNotifications());
        }

        var pagedProdutos = await _produtoRepository.GetPagedAsync(command.Page, command.Size, command.Searchword, command.CategoriaId);
        var items = new List<ProdutoCatalogoItemResponse>(pagedProdutos.Items.Count);

        foreach (var produto in pagedProdutos.Items)
        {
            var estoque = await _estoqueRepository.GetByProdutoIdAsync(produto.Id);
            items.Add(produto.ToCatalogoItemResponse(estoque?.QuantidadeAtual ?? 0m));
        }

        return Result<PagedResult<ProdutoCatalogoItemResponse>>.Success(
            new PagedResult<ProdutoCatalogoItemResponse>(items, pagedProdutos.Page, pagedProdutos.Size, pagedProdutos.TotalItems),
            "Catalogo de produtos carregado com sucesso.");
    }
}
