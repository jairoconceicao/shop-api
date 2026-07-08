using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using aspnet_api.Application.Abstractions.Security;
using Microsoft.AspNetCore.Http;

namespace aspnet_api.Infrastructure.Security;

public sealed class HttpContextSessaoAtualProvider : ISessaoAtualProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public HttpContextSessaoAtualProvider(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? Jti => _httpContextAccessor.HttpContext?.User?.FindFirst(JwtRegisteredClaimNames.Jti)?.Value
        ?? _httpContextAccessor.HttpContext?.User?.FindFirst("jti")?.Value;

    public long? UsuarioId
    {
        get
        {
            var value = _httpContextAccessor.HttpContext?.User?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                ?? _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return long.TryParse(value, out var id) ? id : null;
        }
    }

    public long? ClienteId
    {
        get
        {
            var value = _httpContextAccessor.HttpContext?.User?.FindFirst("cliente_id")?.Value;
            return long.TryParse(value, out var id) ? id : null;
        }
    }
}
