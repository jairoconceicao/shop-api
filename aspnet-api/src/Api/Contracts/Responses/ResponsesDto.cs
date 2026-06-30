namespace aspnet_api.src.Api.Contracts.Responses;

public record PaginationResponse<T>(
    int Pages,
    int Size,
    int TotalItesm,
    IReadOnlyCollection<T> Data
);

public record ResponseData<T>(
    bool Status,
    string Message,
    T? Data
);

