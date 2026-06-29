namespace aspnet_api.Domain.Entities;

public class Produto
{
    public long Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string? Modelo { get; set; }
    public decimal Preco { get; set; }

    public Produto()
    {
    }

    public Produto(long id, string titulo, string? descricao, string? modelo, decimal preco)
    {
        Id = id;
        Titulo = titulo;
        Descricao = descricao;
        Modelo = modelo;
        Preco = preco;
    }
}
