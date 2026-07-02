using aspnet_api.Api.Contracts.Requests.Auth;
using FluentValidation;

namespace aspnet_api.src.Application.Auth.Autenticar;

public sealed class AutenticarCommandValidator : AbstractValidator<LoginRequest>
{
    public AutenticarCommandValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;

        RuleFor(command => command.Email)
            .NotEmpty().WithMessage("Email e obrigatorio.")
            .EmailAddress().WithMessage("Email deve ter um formato valido.")
            .MaximumLength(200).WithMessage("Email deve ter no maximo 200 caracteres.");

        RuleFor(command => command.Senha)
            .NotEmpty().WithMessage("Senha e obrigatoria.")
            .MinimumLength(8).WithMessage("Senha deve ter no minimo 8 caracteres.")
            .MaximumLength(200).WithMessage("Senha deve ter no maximo 200 caracteres.");
    }
}
