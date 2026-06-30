namespace aspnet_api.Api.Contracts.Responses.Shared;

public sealed record ApiNotificationResponse
{
    public string Code { get; init; } = string.Empty;

    public string Message { get; init; } = string.Empty;

    public string? PropertyName { get; init; }
}
