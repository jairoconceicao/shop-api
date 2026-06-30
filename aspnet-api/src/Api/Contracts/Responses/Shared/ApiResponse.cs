namespace aspnet_api.Api.Contracts.Responses.Shared;

public sealed record ApiResponse<T>
{
    public bool Status { get; init; }

    public string Message { get; init; } = string.Empty;

    public T? Data { get; init; }
}

public sealed record PagedResponse<T>
{
    public bool Status { get; init; }

    public string Message { get; init; } = string.Empty;

    public PaginationResponse<T> Pagination { get; init; } = new();
}

public sealed record PaginationResponse<T>
{
    public int Pages { get; init; }

    public int Size { get; init; }

    public long TotalItems { get; init; }

    public IReadOnlyCollection<T> Data { get; init; } = Array.Empty<T>();
}

public sealed record ApiErrorResponse
{
    public ApiError Error { get; init; } = new();
}

public sealed record ApiError
{
    public string Code { get; init; } = string.Empty;

    public string Message { get; init; } = string.Empty;

    public object? Details { get; init; }
}
