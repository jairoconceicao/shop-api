namespace aspnet_api.Api.Contracts.Requests.Clientes;

public sealed record CreateClienteRequest : ClienteUpsertRequest
{
    public string Senha { get; init; } = string.Empty;
}
