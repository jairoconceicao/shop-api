namespace aspnet_api.Api.Contracts.Requests.Shared;

public sealed record CelularRequest
{
    public string Ddd { get; init; } = string.Empty;

    public string Numero { get; init; } = string.Empty;

    public bool WhatsApp { get; init; }
}
