namespace aspnet_api.Api.Contracts.Requests.Auth;

public sealed record LoginRequest
{
    public string Email { get; init; } = string.Empty;

    public string Senha { get; init; } = string.Empty;
}
