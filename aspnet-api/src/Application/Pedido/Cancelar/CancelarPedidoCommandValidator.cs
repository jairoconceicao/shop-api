using aspnet_api.Api.Contracts.Shared;
using FluentValidation;

namespace aspnet_api.src.Application.Pedido.Cancelar;

public sealed class CancelarPedidoCommandValidator : AbstractValidator<CancelarPedidoCommand>
{
    public CancelarPedidoCommandValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;

        RuleFor(command => command.PedidoId)
            .GreaterThan(0).WithMessage("PedidoId e obrigatorio.");

        RuleFor(command => command.Request)
            .NotNull().WithMessage("Request e obrigatoria.");

        When(command => command.Request is not null, () =>
        {
            RuleFor(command => command.Request.Status)
                .Equal(PedidoStatus.Cancelado)
                .WithMessage("Status deve ser Cancelado.");
        });
    }
}


