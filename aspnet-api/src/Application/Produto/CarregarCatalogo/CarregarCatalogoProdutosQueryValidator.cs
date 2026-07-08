using aspnet_api.Api.Contracts.Requests.Produtos;
using FluentValidation;

namespace aspnet_api.src.Application.Produto.CarregarCatalogo;

public sealed class CarregarCatalogoProdutosQueryValidator : AbstractValidator<ProdutosQuery>
{
    public CarregarCatalogoProdutosQueryValidator()
    {
        RuleFor(query => query.Page)
            .GreaterThan(0).WithMessage("Page deve ser maior que zero.");

        RuleFor(query => query.Size)
            .GreaterThan(0).WithMessage("Size deve ser maior que zero.");

        RuleFor(query => query.CategoriaId)
            .GreaterThan(0)
            .When(query => query.CategoriaId.HasValue)
            .WithMessage("CategoriaId deve ser maior que zero.");
    }
}
