using aspnet_api.Domain.ValueObjects;

namespace aspnet_api.Domain.Entities;

public class Carrinho
{
    public long Id { get; set; }
    public long ClienteId { get; set; }
    public Endereco? EnderecoEntrega { get; set; }
    public DateTime DataCarrinho { get; set; }
    public List<CarrinhoItem> Items { get; set; } = new();

    public Carrinho()
    {
    }

    public Carrinho(long id, long clienteId, Endereco? enderecoEntrega, DateTime dataCarrinho, List<CarrinhoItem>? items)
    {
        Id = id;
        ClienteId = clienteId;
        EnderecoEntrega = enderecoEntrega;
        DataCarrinho = dataCarrinho;
        Items = items ?? new List<CarrinhoItem>();
    }
}
