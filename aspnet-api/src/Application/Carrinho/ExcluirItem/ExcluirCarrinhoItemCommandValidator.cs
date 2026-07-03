using FluentValidation;

namespace aspnet_api.src.Application.Carrinho.ExcluirItem;

public sealed class ExcluirCarrinhoItemCommandValidator : AbstractValidator<ExcluirCarrinhoItemCommand>
{
    public ExcluirCarrinhoItemCommandValidator()
    {
        RuleFor(command => command.ItemId)
            .GreaterThan(0).WithMessage("ItemId e obrigatorio.");
    }
}


