using FluentValidation;

namespace aspnet_api.src.Application.Cliente.Excluir;

public sealed class ExcluirClienteCommandValidator : AbstractValidator<ExcluirClienteCommand>
{
    public ExcluirClienteCommandValidator()
    {
        RuleFor(command => command.ClienteId)
            .GreaterThan(0).WithMessage("ClienteId e obrigatorio.");
    }
}


