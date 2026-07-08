using FluentValidation;

namespace aspnet_api.src.Application.Cliente.AtualizarSenha;

public sealed class AtualizarSenhaClienteCommandValidator : AbstractValidator<AtualizarSenhaClienteCommand>
{
    public AtualizarSenhaClienteCommandValidator()
    {
        RuleFor(command => command.ClienteId)
            .GreaterThan(0).WithMessage("ClienteId deve ser maior que zero.");

        RuleFor(command => command.Request)
            .NotNull().WithMessage("Request e obrigatorio.");

        When(command => command.Request is not null, () =>
        {
            RuleFor(command => command.Request.SenhaAtual)
                .NotEmpty().WithMessage("SenhaAtual e obrigatoria.");

            RuleFor(command => command.Request.SenhaNova)
                .NotEmpty().WithMessage("SenhaNova e obrigatoria.")
                .MinimumLength(8).WithMessage("SenhaNova deve ter no minimo 8 caracteres.");
        });
    }
}
