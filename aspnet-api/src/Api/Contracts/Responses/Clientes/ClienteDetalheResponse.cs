using aspnet_api.Api.Contracts.Responses.Shared;

namespace aspnet_api.Api.Contracts.Responses.Clientes;

public sealed record ClienteDetalheResponse
{
    public long ClienteId { get; init; }

    public string Cpf { get; init; } = string.Empty;

    public string Nome { get; init; } = string.Empty;

    public DateOnly DataNascimento { get; init; }

    public string Email { get; init; } = string.Empty;

    public EnderecoResponse Endereco { get; init; } = new();

    public CelularResponse Celular { get; init; } = new();
}


