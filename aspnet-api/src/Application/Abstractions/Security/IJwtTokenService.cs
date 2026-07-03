namespace aspnet_api.Application.Abstractions.Security;

public sealed record JwtDescriptor(
    long UsuarioId,
    long ClienteId,
    string Email);

public interface IJwtTokenService
{
    JwtToken Gerar(JwtDescriptor descriptor, TimeSpan duracao);
}

public sealed record JwtToken(string Token, string Jti, DateTime ExpiraEm);


