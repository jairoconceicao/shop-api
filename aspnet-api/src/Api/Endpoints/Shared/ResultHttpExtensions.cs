using aspnet_api.Api.Contracts.Responses.Shared;
using aspnet_api.Application.Common;
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

        return Results.Json(BuildErrorResponse(result.Notifications, result.Message), statusCode: ResolveStatusCode(result.Notifications));
    }

    public static IResult ToPagedHttpResult<T>(this Result<PagedResult<T>> result, int successStatusCode = StatusCodes.Status200OK)
    {
        if (result.IsSuccess)
        {
            var pagination = result.Data ?? new PagedResult<T>(Array.Empty<T>(), 0, 0, 0);

            return Results.Json(
                new PagedResponse<T>
                {
                    Status = true,
                    Message = result.Message,
                    Pagination = new PaginationResponse<T>
                    {
                        Pages = pagination.TotalPages,
                        Size = pagination.Size,
                        TotalItems = pagination.TotalItems,
                        Data = pagination.Items
                    }
                },
                statusCode: successStatusCode);
        }

        return Results.Json(BuildErrorResponse(result.Notifications, result.Message), statusCode: ResolveStatusCode(result.Notifications));
    }

    private static ApiErrorResponse BuildErrorResponse(IEnumerable<Notification> notifications, string message)
    {
        return new ApiErrorResponse
        {
            Error = new ApiError
            {
                Code = ResolveErrorCode(notifications),
                Message = message,
                Details = notifications.Select(notification => new ApiNotificationResponse
                {
                    Code = notification.Code,
                    Message = notification.Message,
                    PropertyName = notification.PropertyName
                }).ToArray()
            }
        };
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


