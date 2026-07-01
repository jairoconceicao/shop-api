using FluentValidation;

namespace aspnet_api.src.Application.Produto.ConsultarPorId;

public sealed class ConsultarProdutoPorIdQueryValidator : AbstractValidator<ConsultarProdutoPorIdQuery>
{
    public ConsultarProdutoPorIdQueryValidator()
    {
        RuleFor(query => query.ProdutoId)
            .GreaterThan(0).WithMessage("ProdutoId e obrigatorio.");
    }
}
