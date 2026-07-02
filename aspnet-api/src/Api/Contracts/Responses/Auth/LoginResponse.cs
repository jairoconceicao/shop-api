namespace aspnet_api.Api.Contracts.Responses.Auth;

public sealed record LoginResponse
{
    public string Token { get; init; } = string.Empty;

    public string Tipo { get; init; } = "Bearer";

    public DateTime ExpiraEm { get; init; }

    public long UsuarioId { get; init; }

    public long ClienteId { get; init; }

    public string Email { get; init; } = string.Empty;
}
