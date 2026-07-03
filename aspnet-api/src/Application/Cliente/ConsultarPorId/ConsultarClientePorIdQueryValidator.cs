using FluentValidation;

namespace aspnet_api.src.Application.Cliente.ConsultarPorId;

public sealed class ConsultarClientePorIdQueryValidator : AbstractValidator<ConsultarClientePorIdQuery>
{
    public ConsultarClientePorIdQueryValidator()
    {
        RuleFor(query => query.ClienteId)
            .GreaterThan(0).WithMessage("ClienteId e obrigatorio.");
    }
}


