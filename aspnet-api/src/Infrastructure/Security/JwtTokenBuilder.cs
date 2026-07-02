using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace aspnet_api.Infrastructure.Security;

internal sealed class JwtTokenBuilder
{
    private readonly JwtOptions _options;
    private string _subject = string.Empty;
    private string _jti = string.Empty;
    private string _email = string.Empty;
    private string _clienteId = string.Empty;
    private string _emissor = string.Empty;
    private string _audience = string.Empty;
    private DateTime _emissao = DateTime.UtcNow;
    private DateTime _expiracao = DateTime.UtcNow.AddHours(1);

    public JwtTokenBuilder(JwtOptions options)
    {
        _options = options;
    }

    public JwtTokenBuilder ComSubject(string subject) { _subject = subject; return this; }

    public JwtTokenBuilder ComJti(string jti) { _jti = jti; return this; }

    public JwtTokenBuilder ComEmail(string email) { _email = email; return this; }

    public JwtTokenBuilder ComClienteId(long clienteId) { _clienteId = clienteId.ToString(); return this; }

    public JwtTokenBuilder ComEmissor(string emissor) { _emissor = emissor; return this; }

    public JwtTokenBuilder ComAudience(string audience) { _audience = audience; return this; }

    public JwtTokenBuilder ComEmissao(DateTime emissao) { _emissao = emissao; return this; }

    public JwtTokenBuilder ComExpiracao(DateTime expiracao) { _expiracao = expiracao; return this; }

    public string Build()
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, _subject),
            new(JwtRegisteredClaimNames.Jti, _jti),
            new(JwtRegisteredClaimNames.Email, _email),
            new("cliente_id", _clienteId)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _emissor,
            audience: _audience,
            claims: claims,
            notBefore: _emissao,
            expires: _expiracao,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
