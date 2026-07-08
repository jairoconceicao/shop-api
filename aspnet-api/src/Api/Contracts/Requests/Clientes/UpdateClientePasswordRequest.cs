namespace aspnet_api.Api.Contracts.Requests.Clientes;

public sealed record UpdateClientePasswordRequest
{
    public string SenhaAtual { get; init; } = string.Empty;

    public string SenhaNova { get; init; } = string.Empty;
}
