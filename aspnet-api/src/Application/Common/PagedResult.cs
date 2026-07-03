namespace aspnet_api.Application.Common;

public sealed record PagedResult<T>(
    IReadOnlyList<T> Items,
    int Page,
    int Size,
    long TotalItems)
{
    public int TotalPages => Size <= 0
        ? 0
        : (int)Math.Ceiling(TotalItems / (double)Size);
}


