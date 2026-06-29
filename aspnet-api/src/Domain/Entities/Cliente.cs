using aspnet_api.Domain.ValueObjects;

namespace aspnet_api.Domain.Entities;

public class Cliente
{
    public long Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public DateTime DataNascimento { get; set; }
    public Endereco? Endereco { get; set; }
    public Celular? Celular { get; set; }
    public string Email { get; set; } = string.Empty;

    public Cliente()
    {
    }

    public Cliente(long id, string nome, DateTime dataNascimento, Endereco? endereco, Celular? celular, string email)
    {
        Id = id;
        Nome = nome;
        DataNascimento = dataNascimento;
        Endereco = endereco;
        Celular = celular;
        Email = email;
    }
}
