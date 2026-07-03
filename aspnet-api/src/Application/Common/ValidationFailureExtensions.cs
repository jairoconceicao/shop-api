using aspnet_api.Domain.Common;
using FluentValidation.Results;

namespace aspnet_api.src.Application.Common;

public static class ValidationFailureExtensions
{
    public static IReadOnlyCollection<Notification> ToNotifications(this IEnumerable<ValidationFailure> failures)
    {
        return failures
            .Select(failure => new Notification(
                string.IsNullOrWhiteSpace(failure.ErrorCode) ? "VALIDATION_ERROR" : failure.ErrorCode,
                failure.ErrorMessage,
                NormalizePropertyName(failure.PropertyName)))
            .ToArray();
    }

    private static string? NormalizePropertyName(string? propertyName)
    {
        if (string.IsNullOrWhiteSpace(propertyName))
        {
            return null;
        }

        const string requestPrefix = "Request.";
        if (propertyName.StartsWith(requestPrefix, StringComparison.Ordinal))
        {
            return propertyName[requestPrefix.Length..];
        }

        return propertyName;
    }
}


