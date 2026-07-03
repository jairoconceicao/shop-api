using aspnet_api.Api.Contracts.Requests.Carrinhos;
using FluentValidation;

namespace aspnet_api.src.Application.Carrinho.Criar;

public sealed class CarrinhoCriarCommandValidator : AbstractValidator<CreateCarrinhoRequest>
{
    public CarrinhoCriarCommandValidator()
    {
        RuleFor(request => request.ClienteId)
            .GreaterThan(0).WithMessage("ClienteId e obrigatorio.");
    }
}


