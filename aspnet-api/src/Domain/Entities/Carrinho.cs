using aspnet_api.Domain.ValueObjects;

namespace aspnet_api.Domain.Entities;

public class Carrinho
{
    public long Id { get; private set; }
    public long ClienteId { get; private set; }
    public Endereco? EnderecoEntrega { get; private set; }
    public DateTime DataCarrinho { get; private set; }
    public List<CarrinhoItem> Items { get; private set; } = [];

    public Carrinho()
    {
    }

    public Carrinho(long id, long clienteId, Endereco? enderecoEntrega, DateTime dataCarrinho, List<CarrinhoItem>? items)
    {
        Id = id;
        ClienteId = clienteId;
        EnderecoEntrega = enderecoEntrega;
        DataCarrinho = dataCarrinho;
        Items = items ?? [];
    }

    public CarrinhoItem? GetItemById(long itemId)
    {
        return Items.FirstOrDefault(item => item.Id == itemId);
    }

    public CarrinhoItem? GetItemByProdutoId(long produtoId)
    {
        return Items.FirstOrDefault(item => item.ProdutoId == produtoId);
    }

    public CarrinhoItem AdicionarItem(CarrinhoItem item)
    {
        ArgumentNullException.ThrowIfNull(item);

        Items.Add(item);
        return item;
    }

    public CarrinhoItem? AtualizarQuantidadeItem(long itemId, decimal quantidade)
    {
        var item = GetItemById(itemId);
        if (item is null)
        {
            return null;
        }

        item.AtualizarQuantidade(quantidade);
        return item;
    }

    public CarrinhoItem? RemoverItem(long itemId)
    {
        var item = GetItemById(itemId);
        if (item is null)
        {
            return null;
        }

        Items.Remove(item);
        return item;
    }
}
