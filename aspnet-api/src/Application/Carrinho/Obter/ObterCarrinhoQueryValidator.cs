using FluentValidation;

namespace aspnet_api.src.Application.Carrinho.Obter;

public sealed class ObterCarrinhoQueryValidator : AbstractValidator<ObterCarrinhoQuery>
{
    public ObterCarrinhoQueryValidator()
    {
        RuleFor(query => query.CarrinhoId)
            .GreaterThan(0).WithMessage("CarrinhoId e obrigatorio.");
    }
}


