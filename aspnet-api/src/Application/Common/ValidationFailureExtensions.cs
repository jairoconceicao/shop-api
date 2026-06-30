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
                string.IsNullOrWhiteSpace(failure.PropertyName) ? null : failure.PropertyName))
            .ToArray();
    }
}
