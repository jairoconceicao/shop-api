namespace aspnet_api.Api.Contracts.Responses.Pedidos;

public sealed record PedidoClienteResponse
{
    public string Cpf { get; init; } = string.Empty;

    public string Nome { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;
}
