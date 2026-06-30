using aspnet_api.Api.Contracts.Responses.Shared;
using aspnet_api.Domain.Common;
using Microsoft.AspNetCore.Http;

namespace aspnet_api.Api.Endpoints.Shared;

public static class ResultHttpExtensions
{
    public static IResult ToHttpResult<T>(this Result<T> result, int successStatusCode = StatusCodes.Status200OK)
    {
        if (result.IsSuccess)
        {
            return Results.Json(
                new ApiResponse<T>
                {
                    Status = true,
                    Message = result.Message,
                    Data = result.Data
                },
                statusCode: successStatusCode);
        }

        var errorResponse = new ApiErrorResponse
        {
            Error = new ApiError
            {
                Code = ResolveErrorCode(result.Notifications),
                Message = result.Message,
                Details = result.Notifications.Select(notification => new ApiNotificationResponse
                {
                    Code = notification.Code,
                    Message = notification.Message,
                    PropertyName = notification.PropertyName
                }).ToArray()
            }
        };

        return Results.Json(errorResponse, statusCode: ResolveStatusCode(result.Notifications));
    }

    private static string ResolveErrorCode(IEnumerable<Notification> notifications)
    {
        var codes = notifications.Select(notification => notification.Code).ToArray();

        if (codes.Any(code =>
                code.Contains("DUPLICADO", StringComparison.OrdinalIgnoreCase) ||
                code.Contains("CONFLITO", StringComparison.OrdinalIgnoreCase)))
        {
            return "CONFLICT_ERROR";
        }

        if (codes.Any(code =>
                code.Contains("NAO_ENCONTRADO", StringComparison.OrdinalIgnoreCase) ||
                code.Contains("NOT_FOUND", StringComparison.OrdinalIgnoreCase)))
        {
            return "NOT_FOUND_ERROR";
        }

        if (codes.Any(code =>
                code.Contains("OBRIGATORIO", StringComparison.OrdinalIgnoreCase) ||
                code.Contains("INVALIDO", StringComparison.OrdinalIgnoreCase) ||
                code.Contains("VALIDATION", StringComparison.OrdinalIgnoreCase)))
        {
            return "VALIDATION_ERROR";
        }

        return "DOMAIN_ERROR";
    }

    private static int ResolveStatusCode(IEnumerable<Notification> notifications)
    {
        var codes = notifications.Select(notification => notification.Code).ToArray();

        if (codes.Any(code =>
                code.Contains("DUPLICADO", StringComparison.OrdinalIgnoreCase) ||
                code.Contains("CONFLITO", StringComparison.OrdinalIgnoreCase)))
        {
            return StatusCodes.Status409Conflict;
        }

        if (codes.Any(code =>
                code.Contains("NAO_ENCONTRADO", StringComparison.OrdinalIgnoreCase) ||
                code.Contains("NOT_FOUND", StringComparison.OrdinalIgnoreCase)))
        {
            return StatusCodes.Status404NotFound;
        }

        return StatusCodes.Status422UnprocessableEntity;
    }
}
