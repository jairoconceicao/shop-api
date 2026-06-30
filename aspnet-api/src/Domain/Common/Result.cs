namespace aspnet_api.Domain.Common;

public class Result
{
    protected Result(bool isSuccess, string message, IReadOnlyCollection<Notification> notifications)
    {
        IsSuccess = isSuccess;
        Message = message;
        Notifications = notifications;
    }

    public bool IsSuccess { get; }

    public bool IsFailure => !IsSuccess;

    public string Message { get; }

    public IReadOnlyCollection<Notification> Notifications { get; }

    public static Result Success(string message = "Operacao concluida com sucesso.")
    {
        return new Result(true, message, Array.Empty<Notification>());
    }

    public static Result Failure(string message, IEnumerable<Notification>? notifications = null)
    {
        return new Result(false, message, (notifications ?? Array.Empty<Notification>()).ToArray());
    }
}

public sealed class Result<T> : Result
{
    private Result(bool isSuccess, T? data, string message, IReadOnlyCollection<Notification> notifications)
        : base(isSuccess, message, notifications)
    {
        Data = data;
    }

    public T? Data { get; }

    public static Result<T> Success(T data, string message = "Operacao concluida com sucesso.")
    {
        return new Result<T>(true, data, message, Array.Empty<Notification>());
    }

    public new static Result<T> Failure(string message, IEnumerable<Notification>? notifications = null)
    {
        return new Result<T>(false, default, message, (notifications ?? Array.Empty<Notification>()).ToArray());
    }
}
