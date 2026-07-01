using aspnet_api.Api.Contracts.Requests.Carrinhos;
using aspnet_api.Api.Contracts.Responses.Carrinhos;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Common;
using FluentValidation;

namespace aspnet_api.src.Application.Carrinho.AtualizarItem;

public sealed record AtualizarCarrinhoItemCommand(long ItemId, UpdateCarrinhoItemRequest Request);

public sealed class CarrinhoAtualizarItemCommand : IActionCommand<AtualizarCarrinhoItemCommand, Result<CarrinhoItemIdResponse>>
{
    private readonly IValidator<AtualizarCarrinhoItemCommand> _validator;
    private readonly ICarrinhoRepository _carrinhoRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CarrinhoAtualizarItemCommand(
        IValidator<AtualizarCarrinhoItemCommand> validator,
        ICarrinhoRepository carrinhoRepository,
        IUnitOfWork unitOfWork)
    {
        _validator = validator;
        _carrinhoRepository = carrinhoRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CarrinhoItemIdResponse>> Handle(AtualizarCarrinhoItemCommand command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Result<CarrinhoItemIdResponse>.Failure(
                "Dados invalidos para a atualizacao do item do carrinho.",
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

        var item = carrinho.AtualizarQuantidadeItem(command.ItemId, command.Request.Quantidade);
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
            "Quantidade do item atualizada com sucesso.");
    }
}
