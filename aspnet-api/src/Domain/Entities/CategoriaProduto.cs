namespace aspnet_api.Domain.Entities;

public class CategoriaProduto
{
    public long Id { get; private set; }
    public string Titulo { get; private set; } = string.Empty;
    public string? Descricao { get; private set; }
    public List<Produto> Produtos { get; private set; } = [];

    public CategoriaProduto()
    {
    }

    public static CategoriaProduto Reconstituir(long id, string titulo, string? descricao)
    {
        return new CategoriaProduto
        {
            Id = id,
            Titulo = titulo,
            Descricao = descricao
        };
    }
}
