using aspnet_api.Api.Contracts.Responses.Carrinhos;
using CarrinhoEntity = aspnet_api.Domain.Entities.Carrinho;

namespace aspnet_api.src.Application.Carrinho.Shared;

public static class CarrinhoResponseMapper
{
    public static CarrinhoResponse ToResponse(this CarrinhoEntity carrinho)
    {
        ArgumentNullException.ThrowIfNull(carrinho);

        return new CarrinhoResponse
        {
            ClienteId = carrinho.ClienteId,
            CarrinhoId = carrinho.Id,
            DataCarrinho = carrinho.DataCarrinho,
            Items = carrinho.Items
                .Select(item => new CarrinhoItemResponse
                {
                    ItemId = item.Id,
                    ProdutoId = item.ProdutoId,
                    Quantidade = item.Quantidade,
                    ValorUnitario = item.ValorUnitario
                })
                .ToArray()
        };
    }
}


