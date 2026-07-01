using aspnet_api.Api.Contracts.Requests.Carrinhos;
using aspnet_api.Api.Contracts.Responses.Carrinhos;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Common;
using aspnet_api.Domain.Entities;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Common;
using FluentValidation;

namespace aspnet_api.src.Application.Carrinho.AdicionarItem;

public sealed class CarrinhoAdicionarItemCommand : IActionCommand<AddCarrinhoItemRequest, Result<AddCarrinhoItemResponse>>
{
    private readonly IValidator<AddCarrinhoItemRequest> _validator;
    private readonly IProdutoRepository _produtoRepository;
    private readonly ICarrinhoRepository _carrinhoRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CarrinhoAdicionarItemCommand(
        IValidator<AddCarrinhoItemRequest> validator,
        IProdutoRepository produtoRepository,
        ICarrinhoRepository carrinhoRepository,
        IUnitOfWork unitOfWork)
    {
        _validator = validator;
        _produtoRepository = produtoRepository;
        _carrinhoRepository = carrinhoRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AddCarrinhoItemResponse>> Handle(AddCarrinhoItemRequest command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Result<AddCarrinhoItemResponse>.Failure(
                "Dados invalidos para adicionar item ao carrinho.",
                validationResult.Errors.ToNotifications());
        }

        var carrinho = await _carrinhoRepository.GetLatestAsync();
        if (carrinho is null)
        {
            return Result<AddCarrinhoItemResponse>.Failure(
                "Carrinho nao encontrado.",
                new[]
                {
                    new Notification("CARRINHO_NAO_ENCONTRADO", "Carrinho nao encontrado.", null)
                });
        }

        var produto = await _produtoRepository.GetByIdAsync(command.ProdutoId);
        if (produto is null)
        {
            return Result<AddCarrinhoItemResponse>.Failure(
                "Produto nao encontrado.",
                new[]
                {
                    new Notification("PRODUTO_NAO_ENCONTRADO", "Produto nao encontrado.", nameof(command.ProdutoId))
                });
        }

        var itemExistente = carrinho.GetItemByProdutoId(command.ProdutoId);
        if (itemExistente is not null)
        {
            itemExistente.IncrementarQuantidade(command.Quantidade);
            itemExistente.AtualizarValorUnitario(command.ValorUnitario);
        }
        else
        {
            var itemId = await _carrinhoRepository.GetNextItemIdAsync();
            carrinho.AdicionarItem(new CarrinhoItem(itemId, command.ProdutoId, command.Quantidade, command.ValorUnitario));
        }

        await _unitOfWork.SaveChangesAsync();

        var item = carrinho.GetItemByProdutoId(command.ProdutoId)!;

        return Result<AddCarrinhoItemResponse>.Success(
            new AddCarrinhoItemResponse { ItemId = item.Id },
            "Item adicionado ao carrinho com sucesso.");
    }
}
