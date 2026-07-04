using aspnet_api.Domain.Common;

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

    public static Usuario Create(long clienteId, string email, string senhaHash)
    {
        var agora = DateTime.UtcNow;
        return new Usuario
        {
            ClienteId = clienteId,
            Email = email.Trim().ToLowerInvariant(),
            SenhaHash = senhaHash,
            CriadoEm = agora,
            AtualizadoEm = null
        };
    }

    public static Usuario Reconstituir(long id, long clienteId, string email, string senhaHash, DateTime criadoEm, DateTime? atualizadoEm)
    {
        return new Usuario
        {
            Id = id,
            ClienteId = clienteId,
            Email = email,
            SenhaHash = senhaHash,
            CriadoEm = criadoEm,
            AtualizadoEm = atualizadoEm
        };
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
}
