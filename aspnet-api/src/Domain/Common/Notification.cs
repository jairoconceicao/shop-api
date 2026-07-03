namespace aspnet_api.Domain.Common;

public sealed record Notification(string Code, string Message, string? PropertyName = null);


