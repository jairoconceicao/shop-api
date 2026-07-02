namespace aspnet_api.Api.Contracts.Responses.Auth;

public sealed record LogoutResponse
{
    public string Jti { get; init; } = string.Empty;

    public DateTime RevogadaEm { get; init; }
}
