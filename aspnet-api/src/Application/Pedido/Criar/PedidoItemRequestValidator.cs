using aspnet_api.Api.Contracts.Requests.Pedidos;
using FluentValidation;

namespace aspnet_api.src.Application.Pedido.Criar;

public sealed class PedidoItemRequestValidator : AbstractValidator<PedidoItemRequest>
{
    public PedidoItemRequestValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;

        RuleFor(item => item.ProdutoId)
            .GreaterThan(0).WithMessage("ProdutoId e obrigatorio.");

        RuleFor(item => item.Quantidade)
            .GreaterThan(0).WithMessage("Quantidade deve ser maior que zero.");

        RuleFor(item => item.ValorUnitario)
            .GreaterThan(0).WithMessage("ValorUnitario deve ser maior que zero.");
    }
}
