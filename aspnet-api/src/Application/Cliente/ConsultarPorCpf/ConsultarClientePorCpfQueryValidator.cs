using FluentValidation;

namespace aspnet_api.src.Application.Cliente.ConsultarPorCpf;

public sealed class ConsultarClientePorCpfQueryValidator : AbstractValidator<ConsultarClientePorCpfQuery>
{
    public ConsultarClientePorCpfQueryValidator()
    {
        RuleFor(query => query.Cpf)
            .NotEmpty().WithMessage("CPF e obrigatorio.")
            .Matches(@"^\d{11}$").WithMessage("CPF deve conter 11 digitos numericos.");
    }
}


