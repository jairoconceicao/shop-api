using aspnet_api.Domain.Common;
using System.ComponentModel.DataAnnotations;

namespace aspnet_api.Domain.Entities;

public class Usuario
{
    public long Id { get; private set; }
    public long ClienteId { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public string SenhaHash { get; private set; } = string.Empty;
    public DateTime CriadoEm { get; private set; }
    public DateTime? AtualizadoEm { get; private set; }

    public Usuario()
    {
    }

    public Usuario(long id, long clienteId, string email, string senhaHash, DateTime criadoEm, DateTime? atualizadoEm)
    {
        Id = id;
        ClienteId = clienteId;
        Email = email;
        SenhaHash = senhaHash;
        CriadoEm = criadoEm;
        AtualizadoEm = atualizadoEm;
    }

    public static Result<Usuario> Create(long clienteId, string email, string senhaHash)
    {
        var notifications = Validate(clienteId, email, senhaHash);

        if (notifications.Count > 0)
        {
            return Result<Usuario>.Failure("Usuario invalido.", notifications);
        }

        var agora = DateTime.UtcNow;
        return Result<Usuario>.Success(new Usuario(0, clienteId, email.Trim().ToLowerInvariant(), senhaHash, agora, null));
    }

    public Result AtualizarSenha(string senhaHash)
    {
        if (string.IsNullOrWhiteSpace(senhaHash))
        {
            return Result.Failure("Senha invalida.", new[]
            {
                new Notification("USUARIO_SENHA_OBRIGATORIA", "Senha e obrigatoria.", nameof(SenhaHash))
            });
        }

        SenhaHash = senhaHash;
        AtualizadoEm = DateTime.UtcNow;
        return Result.Success("Senha atualizada com sucesso.");
    }

    private static List<Notification> Validate(long clienteId, string email, string senhaHash)
    {
        var notifications = new List<Notification>();

        if (clienteId <= 0)
        {
            notifications.Add(new Notification("USUARIO_CLIENTE_OBRIGATORIO", "Cliente e obrigatorio.", nameof(ClienteId)));
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            notifications.Add(new Notification("USUARIO_EMAIL_OBRIGATORIO", "Email e obrigatorio.", nameof(Email)));
        }
        else
        {
            if (email.Length > 200)
            {
                notifications.Add(new Notification("USUARIO_EMAIL_TAMANHO_INVALIDO", "Email deve ter no maximo 200 caracteres.", nameof(Email)));
            }

            if (!new EmailAddressAttribute().IsValid(email))
            {
                notifications.Add(new Notification("USUARIO_EMAIL_INVALIDO", "Email deve ter um formato valido.", nameof(Email)));
            }
        }

        if (string.IsNullOrWhiteSpace(senhaHash))
        {
            notifications.Add(new Notification("USUARIO_SENHA_OBRIGATORIA", "Senha e obrigatoria.", nameof(SenhaHash)));
        }

        return notifications;
    }
}
