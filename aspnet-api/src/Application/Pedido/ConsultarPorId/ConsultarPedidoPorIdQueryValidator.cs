using FluentValidation;

namespace aspnet_api.src.Application.Pedido.ConsultarPorId;

public sealed class ConsultarPedidoPorIdQueryValidator : AbstractValidator<ConsultarPedidoPorIdQuery>
{
    public ConsultarPedidoPorIdQueryValidator()
    {
        RuleFor(query => query.PedidoId)
            .GreaterThan(0).WithMessage("PedidoId e obrigatorio.");
    }
}


