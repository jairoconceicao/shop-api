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
}
