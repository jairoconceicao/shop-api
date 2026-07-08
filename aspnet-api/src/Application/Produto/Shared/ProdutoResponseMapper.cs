using aspnet_api.Api.Contracts.Responses.Produtos;
using ProdutoEntity = aspnet_api.Domain.Entities.Produto;

namespace aspnet_api.src.Application.Produto.Shared;

public static class ProdutoResponseMapper
{
    public static ProdutoCatalogoItemResponse ToCatalogoItemResponse(this ProdutoEntity produto, decimal estoqueAtual)
    {
        ArgumentNullException.ThrowIfNull(produto);

        return new ProdutoCatalogoItemResponse
        {
            ProdutoId = produto.Id,
            Titulo = produto.Titulo,
            Thumb = produto.Thumb,
            Preco = produto.Preco,
            Estoque = estoqueAtual,
            Categoria = produto.CategoriaProduto is null
                ? null
                : new CategoriaProdutoResponse
                {
                    Id = produto.CategoriaProduto.Id,
                    Titulo = produto.CategoriaProduto.Titulo
                }
        };
    }

    public static ProdutoDetalheResponse ToDetalheResponse(this ProdutoEntity produto, decimal estoqueAtual)
    {
        ArgumentNullException.ThrowIfNull(produto);

        return new ProdutoDetalheResponse
        {
            ProdutoId = produto.Id,
            Titulo = produto.Titulo,
            Descricao = produto.Descricao,
            Modelo = produto.Modelo,
            Foto = produto.Foto,
            Preco = produto.Preco,
            Estoque = estoqueAtual,
            Categoria = produto.CategoriaProduto is null
                ? null
                : new CategoriaProdutoResponse
                {
                    Id = produto.CategoriaProduto.Id,
                    Titulo = produto.CategoriaProduto.Titulo
                }
        };
    }
}
