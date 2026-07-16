using aspnet_api.Domain.Common;

namespace aspnet_api.Domain.Entities;

public class Sessao
{
    public long Id { get; private set; }
    public long UsuarioId { get; private set; }
    public string Jti { get; private set; } = string.Empty;
    public DateTime CriadaEm { get; private set; }
    public DateTime ExpiraEm { get; private set; }
    public DateTime? RevogadaEm { get; private set; }

    public Sessao()
    {
    }

    public static Result<Sessao> Create(long usuarioId, string jti, DateTime expiraEm)
    {
        var notifications = Validate(usuarioId, jti, expiraEm);

        if (notifications.Count > 0)
        {
            return Result<Sessao>.Failure("Sessao invalida.", notifications);
        }

        var agora = DateTime.UtcNow;
        return Result<Sessao>.Success(new Sessao
        {
            Id = 0,
            UsuarioId = usuarioId,
            Jti = jti,
            CriadaEm = agora,
            ExpiraEm = expiraEm,
            RevogadaEm = null
        });
    }

    public static Sessao Reconstituir(long id, long usuarioId, string jti, DateTime criadaEm, DateTime expiraEm, DateTime? revogadaEm)
    {
        return new Sessao
        {
            Id = id,
            UsuarioId = usuarioId,
            Jti = jti,
            CriadaEm = criadaEm,
            ExpiraEm = expiraEm,
            RevogadaEm = revogadaEm
        };
    }

    public Result Revogar()
    {
        if (RevogadaEm is not null)
        {
            return Result.Failure("Sessao ja revogada.", new[]
            {
                new Notification("SESSAO_JA_REVOGADA", "Sessao ja foi revogada.", nameof(RevogadaEm))
            });
        }

        RevogadaEm = DateTime.UtcNow;
        return Result.Success("Sessao revogada com sucesso.");
    }

    public bool EstaAtiva(DateTime agora)
    {
        return RevogadaEm is null && agora < ExpiraEm;
    }

    private static List<Notification> Validate(long usuarioId, string jti, DateTime expiraEm)
    {
        var notifications = new List<Notification>();

        if (usuarioId <= 0)
        {
            notifications.Add(new Notification("SESSAO_USUARIO_OBRIGATORIO", "Usuario e obrigatorio.", nameof(UsuarioId)));
        }

        if (string.IsNullOrWhiteSpace(jti))
        {
            notifications.Add(new Notification("SESSAO_JTI_OBRIGATORIO", "Identificador do token e obrigatorio.", nameof(Jti)));
        }

        if (expiraEm <= DateTime.Now)
        {
            notifications.Add(new Notification("SESSAO_EXPIRACAO_INVALIDA", "Expiracao da sessao deve ser futura.", nameof(ExpiraEm)));
        }

        return notifications;
    }
}


