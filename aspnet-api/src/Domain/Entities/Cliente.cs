using aspnet_api.Domain.ValueObjects;

namespace aspnet_api.Domain.Entities;

public class Cliente
{
    public long Id { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string Cpf { get; private set; } = string.Empty; 
    public DateTime DataNascimento { get; private set; }
    public Endereco? Endereco { get; private set; }
    public Celular? Celular { get; private set; }
    public string Email { get; private set; } = string.Empty;

    public Cliente()
    {
    }

    public Cliente(long id, string nome, string cpf, DateTime dataNascimento, Endereco? endereco, Celular? celular, string email)
    {
        Id = id;
        Nome = nome;
        Cpf = cpf;
        DataNascimento = dataNascimento;
        Endereco = endereco;
        Celular = celular;
        Email = email;
    }
}
