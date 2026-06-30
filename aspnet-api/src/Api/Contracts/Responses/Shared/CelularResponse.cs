namespace aspnet_api.Api.Contracts.Responses.Shared;

public sealed record CelularResponse
{
    public string Ddd { get; init; } = string.Empty;

    public string Numero { get; init; } = string.Empty;

    public bool WhatsApp { get; init; }
}
