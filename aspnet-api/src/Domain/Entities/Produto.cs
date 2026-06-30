namespace aspnet_api.Domain.Entities;

public class Produto
{
    public long Id { get; private set; }
    public string Titulo { get; private set; } = string.Empty;
    public string? Descricao { get; private set; }
    public string? Modelo { get; private set; }
    public decimal Preco { get; private set; }
    public string? Foto { get; private set; }
    public string? Thumb { get; private set; }

    public Produto()
    {
    }

    public Produto(long id, string titulo, string? descricao, string? modelo, decimal preco, string foto, string thumb)
    {
        Id = id;
        Titulo = titulo;
        Descricao = descricao;
        Modelo = modelo;
        Preco = preco;
        Foto = foto;
        Thumb = thumb;
    }
}
