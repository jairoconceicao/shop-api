using aspnet_api.Api.Contracts.Responses.Carrinhos;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Carrinho.Shared;
using aspnet_api.src.Application.Common;
using FluentValidation;

namespace aspnet_api.src.Application.Carrinho.Obter;

public sealed class CarrinhoObterQuery : IActionCommand<ObterCarrinhoQuery, Result<CarrinhoResponse>>
{
    private readonly IValidator<ObterCarrinhoQuery> _validator;
    private readonly ICarrinhoRepository _carrinhoRepository;

    public CarrinhoObterQuery(
        IValidator<ObterCarrinhoQuery> validator,
        ICarrinhoRepository carrinhoRepository)
    {
        _validator = validator;
        _carrinhoRepository = carrinhoRepository;
    }

    public async Task<Result<CarrinhoResponse>> Handle(ObterCarrinhoQuery command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Result<CarrinhoResponse>.Failure(
                "Dados invalidos para a consulta do carrinho.",
                validationResult.Errors.ToNotifications());
        }

        var carrinho = await _carrinhoRepository.GetByIdAsync(command.CarrinhoId);
        if (carrinho is null)
        {
            return Result<CarrinhoResponse>.Failure(
                "Carrinho nao encontrado.",
                new[]
                {
                    new Notification("CARRINHO_NAO_ENCONTRADO", "Carrinho nao encontrado.", nameof(command.CarrinhoId))
                });
        }

        return Result<CarrinhoResponse>.Success(
            carrinho.ToResponse(),
            "Carrinho consultado com sucesso.");
    }
}


