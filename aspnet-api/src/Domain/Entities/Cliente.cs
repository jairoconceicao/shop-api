using aspnet_api.Domain.Common;
using aspnet_api.Domain.ValueObjects;
using System.ComponentModel.DataAnnotations;

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

    public static Result<Cliente> Create(string nome, string cpf, DateOnly dataNascimento, Endereco? endereco, Celular? celular, string email)
    {
        var notifications = Validate(nome, cpf, dataNascimento, endereco, celular, email);

        if (notifications.Count > 0)
        {
            return Result<Cliente>.Failure("Cliente invalido.", notifications);
        }

        return Result<Cliente>.Success(new Cliente(0, nome, cpf, dataNascimento.ToDateTime(TimeOnly.MinValue), endereco, celular, email));
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

    private static List<Notification> Validate(
        string nome,
        string cpf,
        DateOnly dataNascimento,
        Endereco? endereco,
        Celular? celular,
        string email)
    {
        var notifications = new List<Notification>();
        var today = DateOnly.FromDateTime(DateTime.Today);

        if (string.IsNullOrWhiteSpace(nome))
        {
            notifications.Add(new Notification("CLIENTE_NOME_OBRIGATORIO", "Nome e obrigatorio.", nameof(Nome)));
        }
        else if (nome.Length > 200)
        {
            notifications.Add(new Notification("CLIENTE_NOME_TAMANHO_INVALIDO", "Nome deve ter no maximo 200 caracteres.", nameof(Nome)));
        }

        if (string.IsNullOrWhiteSpace(cpf))
        {
            notifications.Add(new Notification("CLIENTE_CPF_OBRIGATORIO", "Cpf e obrigatorio.", nameof(Cpf)));
        }
        else if (cpf.Length != 11 || !cpf.All(char.IsDigit))
        {
            notifications.Add(new Notification("CLIENTE_CPF_INVALIDO", "Cpf deve conter 11 digitos numericos.", nameof(Cpf)));
        }

        if (dataNascimento > today)
        {
            notifications.Add(new Notification("CLIENTE_DATA_NASCIMENTO_INVALIDA", "Data de nascimento nao pode ser futura.", nameof(DataNascimento)));
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            notifications.Add(new Notification("CLIENTE_EMAIL_OBRIGATORIO", "Email e obrigatorio.", nameof(Email)));
        }
        else
        {
            if (email.Length > 200)
            {
                notifications.Add(new Notification("CLIENTE_EMAIL_TAMANHO_INVALIDO", "Email deve ter no maximo 200 caracteres.", nameof(Email)));
            }

            if (!new EmailAddressAttribute().IsValid(email))
            {
                notifications.Add(new Notification("CLIENTE_EMAIL_INVALIDO", "Email deve ter um formato valido.", nameof(Email)));
            }
        }

        if (endereco is null)
        {
            notifications.Add(new Notification("CLIENTE_ENDERECO_OBRIGATORIO", "Endereco e obrigatorio.", nameof(Endereco)));
        }

        if (celular is null)
        {
            notifications.Add(new Notification("CLIENTE_CELULAR_OBRIGATORIO", "Celular e obrigatorio.", nameof(Celular)));
        }

        return notifications;
    }
}
