using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.src.Application.Cliente.Shared;
using FluentValidation;

namespace aspnet_api.src.Application.Cliente.Atualizar;

public sealed class AtualizarClienteCommandValidator : AbstractValidator<AtualizarClienteCommand>
{
    public AtualizarClienteCommandValidator()
    {
        RuleFor(command => command.ClienteId)
            .GreaterThan(0).WithMessage("ClienteId e obrigatorio.");

        RuleFor(command => command.Request)
            .NotNull().WithMessage("Request e obrigatorio.")
            .SetValidator(new ClienteAtualizarCommandValidator());
    }
}


