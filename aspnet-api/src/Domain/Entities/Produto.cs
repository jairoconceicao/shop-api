namespace aspnet_api.Domain.Entities;

public class Produto
{
    public long Id { get; private set; }
    public long CategoriaProdutoId { get; private set; } = 1;
    public CategoriaProduto? CategoriaProduto { get; private set; }
    public string Titulo { get; private set; } = string.Empty;
    public string? Descricao { get; private set; }
    public string? Modelo { get; private set; }
    public decimal Preco { get; private set; }
    public string? Foto { get; private set; }
    public string? Thumb { get; private set; }

    public Produto()
    {
    }

    public static Produto Reconstituir(long id, string titulo, string? descricao, string? modelo, decimal preco, string? foto, string? thumb)
    {
        return Reconstituir(id, 1, titulo, descricao, modelo, preco, foto, thumb);
    }

    public static Produto Reconstituir(long id, long categoriaProdutoId, string titulo, string? descricao, string? modelo, decimal preco, string? foto, string? thumb)
    {
        return new Produto
        {
            Id = id,
            CategoriaProdutoId = categoriaProdutoId,
            Titulo = titulo,
            Descricao = descricao,
            Modelo = modelo,
            Preco = preco,
            Foto = foto,
            Thumb = thumb
        };
    }
}
