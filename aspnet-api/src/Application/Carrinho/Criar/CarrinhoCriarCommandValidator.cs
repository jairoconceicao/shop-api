using aspnet_api.Api.Contracts.Requests.Carrinhos;
using FluentValidation;

namespace aspnet_api.src.Application.Carrinho.Criar;

public sealed class CarrinhoCriarCommandValidator : AbstractValidator<CreateCarrinhoRequest>
{
    public CarrinhoCriarCommandValidator()
    {
    }
}
