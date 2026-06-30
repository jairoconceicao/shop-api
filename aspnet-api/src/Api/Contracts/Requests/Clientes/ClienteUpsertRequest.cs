using aspnet_api.Api.Contracts.Requests.Shared;

namespace aspnet_api.Api.Contracts.Requests.Clientes;

public record ClienteUpsertRequest
{
    public string Cpf { get; init; } = string.Empty;

    public string Nome { get; init; } = string.Empty;

    public DateOnly DataNascimento { get; init; }

    public string Email { get; init; } = string.Empty;

    public EnderecoRequest Endereco { get; init; } = new();

    public CelularRequest Celular { get; init; } = new();
}
