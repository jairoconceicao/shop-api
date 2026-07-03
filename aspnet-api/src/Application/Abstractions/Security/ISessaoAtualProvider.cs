namespace aspnet_api.Application.Abstractions.Security;

public interface ISessaoAtualProvider
{
    string? Jti { get; }

    long? UsuarioId { get; }
}


