using aspnet_api.Application.Abstractions.Security;

namespace aspnet_api.Tests.Application;

public sealed class TestSessaoAtualProvider : ISessaoAtualProvider
{
    public TestSessaoAtualProvider(long? clienteId = 1, long? usuarioId = 1, string? jti = "test-jti")
    {
        ClienteId = clienteId;
        UsuarioId = usuarioId;
        Jti = jti;
    }

    public string? Jti { get; }

    public long? UsuarioId { get; }

    public long? ClienteId { get; }
}
