using aspnet_api.Api.Contracts.Responses.Carrinhos;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Common;
using FluentValidation;

namespace aspnet_api.src.Application.Carrinho.ExcluirItem;

public sealed record ExcluirCarrinhoItemCommand(long ItemId);

public sealed class CarrinhoExcluirItemCommand : IActionCommand<ExcluirCarrinhoItemCommand, Result<CarrinhoItemIdResponse>>
{
    private readonly IValidator<ExcluirCarrinhoItemCommand> _validator;
    private readonly ICarrinhoRepository _carrinhoRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CarrinhoExcluirItemCommand(
        IValidator<ExcluirCarrinhoItemCommand> validator,
        ICarrinhoRepository carrinhoRepository,
        IUnitOfWork unitOfWork)
    {
        _validator = validator;
        _carrinhoRepository = carrinhoRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CarrinhoItemIdResponse>> Handle(ExcluirCarrinhoItemCommand command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Result<CarrinhoItemIdResponse>.Failure(
                "Dados invalidos para a exclusao do item do carrinho.",
                validationResult.Errors.ToNotifications());
        }

        var carrinho = await _carrinhoRepository.GetByItemIdAsync(command.ItemId);
        if (carrinho is null)
        {
            return Result<CarrinhoItemIdResponse>.Failure(
                "Item do carrinho nao encontrado.",
                new[]
                {
                    new Notification("ITEM_CARRINHO_NAO_ENCONTRADO", "Item do carrinho nao encontrado.", nameof(command.ItemId))
                });
        }

        var item = carrinho.RemoverItem(command.ItemId);
        if (item is null)
        {
            return Result<CarrinhoItemIdResponse>.Failure(
                "Item do carrinho nao encontrado.",
                new[]
                {
                    new Notification("ITEM_CARRINHO_NAO_ENCONTRADO", "Item do carrinho nao encontrado.", nameof(command.ItemId))
                });
        }

        await _unitOfWork.SaveChangesAsync();

        return Result<CarrinhoItemIdResponse>.Success(
            new CarrinhoItemIdResponse
            {
                ItemId = item.Id,
                ProdutoId = item.ProdutoId
            },
            "Item excluido do carrinho com sucesso.");
    }
}
