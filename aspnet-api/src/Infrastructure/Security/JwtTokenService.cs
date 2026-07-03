using aspnet_api.Application.Abstractions.Security;
using Microsoft.Extensions.Options;

namespace aspnet_api.Infrastructure.Security;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = string.Empty;

    public string Audience { get; set; } = string.Empty;

    public string Secret { get; set; } = string.Empty;

    public int ExpiracaoEmHoras { get; set; } = 8;
}

public sealed class JwtTokenService : IJwtTokenService
{
    private readonly JwtOptions _options;
    private readonly TimeProvider _timeProvider;

    public JwtTokenService(IOptions<JwtOptions> options, TimeProvider timeProvider)
    {
        _options = options.Value;
        _timeProvider = timeProvider;

        if (string.IsNullOrWhiteSpace(_options.Secret) || _options.Secret.Length < 32)
        {
            throw new InvalidOperationException("Configuracao JWT: Secret deve ter no minimo 32 caracteres.");
        }

        if (string.IsNullOrWhiteSpace(_options.Issuer))
        {
            throw new InvalidOperationException("Configuracao JWT: Issuer e obrigatorio.");
        }

        if (string.IsNullOrWhiteSpace(_options.Audience))
        {
            throw new InvalidOperationException("Configuracao JWT: Audience e obrigatorio.");
        }
    }

    public JwtToken Gerar(JwtDescriptor descriptor, TimeSpan duracao)
    {
        ArgumentNullException.ThrowIfNull(descriptor);

        var agora = _timeProvider.GetUtcNow().UtcDateTime;
        var expiraEm = agora.Add(duracao);
        var jti = Guid.NewGuid().ToString("N");

        var token = new JwtTokenBuilder(_options)
            .ComSubject(descriptor.UsuarioId.ToString())
            .ComJti(jti)
            .ComEmail(descriptor.Email)
            .ComClienteId(descriptor.ClienteId)
            .ComEmissor(_options.Issuer)
            .ComAudience(_options.Audience)
            .ComEmissao(agora)
            .ComExpiracao(expiraEm)
            .Build();

        return new JwtToken(token, jti, expiraEm);
    }
}


