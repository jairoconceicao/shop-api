namespace aspnet_api.src.Application.Abstractions.Commands;

public interface IActionCommand<TCommand, TResponse>
{
    Task<TResponse> Handle(TCommand command);
}
