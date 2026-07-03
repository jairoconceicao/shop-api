using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.Api.Contracts.Requests.Shared;
using FluentValidation;

namespace aspnet_api.src.Application.Cliente.Shared;

public abstract class ClienteUpsertRequestValidator<TRequest> : AbstractValidator<TRequest>
    where TRequest : ClienteUpsertRequest
{
    protected ClienteUpsertRequestValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;

        RuleFor(command => command.Cpf)
            .NotEmpty().WithMessage("CPF e obrigatorio.")
            .Matches(@"^\d{11}$").WithMessage("CPF deve conter 11 digitos numericos.");

        RuleFor(command => command.Nome)
            .NotEmpty().WithMessage("Nome e obrigatorio.")
            .MaximumLength(200).WithMessage("Nome deve ter no maximo 200 caracteres.");

        RuleFor(command => command.DataNascimento)
            .NotEmpty().WithMessage("Data de nascimento e obrigatoria.")
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("Data de nascimento nao pode ser futura.");

        RuleFor(command => command.Email)
            .NotEmpty().WithMessage("Email e obrigatorio.")
            .EmailAddress().WithMessage("Email deve ter um formato valido.")
            .MaximumLength(200).WithMessage("Email deve ter no maximo 200 caracteres.");

        RuleFor(command => command.Endereco)
            .NotNull().WithMessage("Endereco e obrigatorio.")
            .SetValidator(new EnderecoRequestValidator());

        RuleFor(command => command.Celular)
            .NotNull().WithMessage("Celular e obrigatorio.")
            .SetValidator(new CelularRequestValidator());

        if (typeof(TRequest) == typeof(CreateClienteRequest))
        {
            RuleFor(command => ((CreateClienteRequest)(object)command).Senha)
                .NotEmpty().WithMessage("Senha e obrigatoria.")
                .MinimumLength(8).WithMessage("Senha deve ter no minimo 8 caracteres.")
                .MaximumLength(200).WithMessage("Senha deve ter no maximo 200 caracteres.");
        }
    }
}

public sealed class EnderecoRequestValidator : AbstractValidator<EnderecoRequest>
{
    public EnderecoRequestValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;

        RuleFor(endereco => endereco.Logradouro)
            .NotEmpty().WithMessage("Logradouro e obrigatorio.")
            .MaximumLength(200).WithMessage("Logradouro deve ter no maximo 200 caracteres.");

        RuleFor(endereco => endereco.Numero)
            .NotEmpty().WithMessage("Numero e obrigatorio.")
            .MaximumLength(50).WithMessage("Numero deve ter no maximo 50 caracteres.");

        RuleFor(endereco => endereco.Complemento)
            .MaximumLength(200).WithMessage("Complemento deve ter no maximo 200 caracteres.");

        RuleFor(endereco => endereco.Cep)
            .NotEmpty().WithMessage("CEP e obrigatorio.")
            .MaximumLength(20).WithMessage("CEP deve ter no maximo 20 caracteres.");

        RuleFor(endereco => endereco.Bairro)
            .NotEmpty().WithMessage("Bairro e obrigatorio.")
            .MaximumLength(100).WithMessage("Bairro deve ter no maximo 100 caracteres.");

        RuleFor(endereco => endereco.Cidade)
            .NotEmpty().WithMessage("Cidade e obrigatoria.")
            .MaximumLength(100).WithMessage("Cidade deve ter no maximo 100 caracteres.");

        RuleFor(endereco => endereco.Uf)
            .NotEmpty().WithMessage("UF e obrigatoria.")
            .Length(2).WithMessage("UF deve ter 2 caracteres.");
    }
}

public sealed class CelularRequestValidator : AbstractValidator<CelularRequest>
{
    public CelularRequestValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;

        RuleFor(celular => celular.Ddd)
            .NotEmpty().WithMessage("DDD e obrigatorio.")
            .Matches(@"^\d{2}$").WithMessage("DDD deve conter 2 digitos numericos.");

        RuleFor(celular => celular.Numero)
            .NotEmpty().WithMessage("Numero de celular e obrigatorio.")
            .MaximumLength(30).WithMessage("Numero de celular deve ter no maximo 30 caracteres.");
    }
}


