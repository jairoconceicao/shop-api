using aspnet_api.Api.Contracts.Requests.Pedidos;
using aspnet_api.Api.Contracts.Requests.Shared;
using aspnet_api.src.Application.Cliente.Shared;
using FluentValidation;

namespace aspnet_api.src.Application.Pedido.Criar;

public sealed class PedidoCriarCommandValidator : AbstractValidator<CreatePedidoRequest>
{
    public PedidoCriarCommandValidator()
    {
        RuleLevelCascadeMode = CascadeMode.Stop;

        RuleFor(request => request.ClienteId)
            .GreaterThan(0).WithMessage("ClienteId e obrigatorio.");

        RuleFor(request => request.CarrinhoId)
            .GreaterThan(0).WithMessage("CarrinhoId e obrigatorio.");

        RuleFor(request => request.EnderecoEntrega)
            .NotNull().WithMessage("EnderecoEntrega e obrigatorio.")
            .SetValidator(new EnderecoRequestValidator());

        RuleFor(request => request.DataPedido)
            .NotEmpty().WithMessage("DataPedido e obrigatoria.");

        RuleFor(request => request.FormaPagamento)
            .IsInEnum().WithMessage("FormaPagamento invalida.");

        RuleFor(request => request.Items)
            .NotEmpty().WithMessage("Items sao obrigatorios.");

        RuleForEach(request => request.Items)
            .SetValidator(new PedidoItemRequestValidator());
    }
}


