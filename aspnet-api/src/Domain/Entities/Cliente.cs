using aspnet_api.Domain.ValueObjects;

namespace aspnet_api.Domain.Entities;

public class Cliente
{
    public long Id { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string Cpf { get; private set; } = string.Empty;
    public DateOnly DataNascimento { get; private set; }
    public Endereco? Endereco { get; private set; }
    public Celular? Celular { get; private set; }
    public string Email { get; private set; } = string.Empty;

    public Cliente()
    {
    }

    public static Cliente Reconstituir(long id, string nome, string cpf, DateOnly dataNascimento, Endereco? endereco, Celular? celular, string email)
    {
        return new Cliente
        {
            Id = id,
            Nome = nome,
            Cpf = cpf,
            DataNascimento = dataNascimento,
            Endereco = endereco,
            Celular = celular,
            Email = email
        };
    }

    public static Cliente Create(string nome, string cpf, DateOnly dataNascimento, Endereco? endereco, Celular? celular, string email)
    {
        return new Cliente
        {
            Nome = nome,
            Cpf = cpf,
            DataNascimento = dataNascimento,
            Endereco = endereco,
            Celular = celular,
            Email = email
        };
    }

    public void AtualizarCom(Cliente cliente)
    {
        ArgumentNullException.ThrowIfNull(cliente);

        Nome = cliente.Nome;
        Cpf = cliente.Cpf;
        DataNascimento = cliente.DataNascimento;
        Endereco = cliente.Endereco;
        Celular = cliente.Celular;
        Email = cliente.Email;
    }
}
