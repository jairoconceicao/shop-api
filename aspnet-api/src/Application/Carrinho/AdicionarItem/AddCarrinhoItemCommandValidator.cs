using aspnet_api.Api.Contracts.Requests.Carrinhos;
using FluentValidation;

namespace aspnet_api.src.Application.Carrinho.AdicionarItem;

public sealed class AddCarrinhoItemCommandValidator : AbstractValidator<AddCarrinhoItemRequest>
{
    public AddCarrinhoItemCommandValidator()
    {
        RuleFor(request => request.ProdutoId)
            .GreaterThan(0).WithMessage("ProdutoId e obrigatorio.");

        RuleFor(request => request.Quantidade)
            .GreaterThan(0).WithMessage("Quantidade deve ser maior que zero.");

        RuleFor(request => request.ValorUnitario)
            .GreaterThan(0).WithMessage("ValorUnitario deve ser maior que zero.");
    }
}


