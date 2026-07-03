using aspnet_api.Api.Contracts.Requests.Carrinhos;
using FluentValidation;

namespace aspnet_api.src.Application.Carrinho.AtualizarItem;

public sealed class AtualizarCarrinhoItemCommandValidator : AbstractValidator<AtualizarCarrinhoItemCommand>
{
    public AtualizarCarrinhoItemCommandValidator()
    {
        RuleFor(command => command.ItemId)
            .GreaterThan(0).WithMessage("ItemId e obrigatorio.");

        RuleFor(command => command.Request)
            .NotNull().WithMessage("Requisicao e obrigatoria.")
            .SetValidator(new UpdateCarrinhoItemRequestValidator());
    }
}

public sealed class UpdateCarrinhoItemRequestValidator : AbstractValidator<UpdateCarrinhoItemRequest>
{
    public UpdateCarrinhoItemRequestValidator()
    {
        RuleFor(request => request.Quantidade)
            .GreaterThan(0).WithMessage("Quantidade deve ser maior que zero.");
    }
}


