using aspnet_api.Api.Contracts.Requests.Pedidos;
using FluentValidation;

namespace aspnet_api.src.Application.Pedido.Consultar;

public sealed class ConsultarPedidosQueryValidator : AbstractValidator<PedidosQuery>
{
    public ConsultarPedidosQueryValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;

        RuleFor(query => query.Cpf)
            .NotEmpty().WithMessage("CPF e obrigatorio.")
            .Matches(@"^\d{11}$").WithMessage("CPF deve conter 11 digitos numericos.");

        RuleFor(query => query.Page)
            .GreaterThan(0).WithMessage("Page deve ser maior que zero.");

        RuleFor(query => query.Size)
            .GreaterThan(0).WithMessage("Size deve ser maior que zero.");

        RuleFor(query => query)
            .Must(query => !query.DataInicio.HasValue || !query.DataFim.HasValue || query.DataInicio <= query.DataFim)
            .WithMessage("DataInicio deve ser menor ou igual a DataFim.");
    }
}
