using aspnet_api.Api.Contracts.Responses.Produtos;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Common;
using aspnet_api.src.Application.Produto.Shared;
using FluentValidation;

namespace aspnet_api.src.Application.Produto.ConsultarPorId;

public sealed class ProdutoConsultarPorIdQuery : IActionCommand<ConsultarProdutoPorIdQuery, Result<ProdutoDetalheResponse>>
{
    private readonly IValidator<ConsultarProdutoPorIdQuery> _validator;
    private readonly IProdutoRepository _produtoRepository;
    private readonly IEstoqueRepository _estoqueRepository;

    public ProdutoConsultarPorIdQuery(
        IValidator<ConsultarProdutoPorIdQuery> validator,
        IProdutoRepository produtoRepository,
        IEstoqueRepository estoqueRepository)
    {
        _validator = validator;
        _produtoRepository = produtoRepository;
        _estoqueRepository = estoqueRepository;
    }

    public async Task<Result<ProdutoDetalheResponse>> Handle(ConsultarProdutoPorIdQuery command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Result<ProdutoDetalheResponse>.Failure(
                "Dados invalidos para a consulta do produto.",
                validationResult.Errors.ToNotifications());
        }

        var produto = await _produtoRepository.GetByIdAsync(command.ProdutoId);
        if (produto is null)
        {
            return Result<ProdutoDetalheResponse>.Failure(
                "Produto nao encontrado.",
                new[]
                {
                    new Notification("PRODUTO_NAO_ENCONTRADO", "Produto nao encontrado.", nameof(command.ProdutoId))
                });
        }

        var estoque = await _estoqueRepository.GetByProdutoIdAsync(command.ProdutoId);

        return Result<ProdutoDetalheResponse>.Success(
            produto.ToDetalheResponse(estoque?.QuantidadeAtual ?? 0m),
            "Produto consultado com sucesso.");
    }
}
