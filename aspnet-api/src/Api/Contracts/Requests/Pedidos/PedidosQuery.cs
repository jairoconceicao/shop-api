namespace aspnet_api.Api.Contracts.Requests.Pedidos;

public sealed record PedidosQuery
{
    public string Cpf { get; init; } = string.Empty;

    public DateTime? DataInicio { get; init; }

    public DateTime? DataFim { get; init; }

    public int Page { get; init; } = 1;

    public int Size { get; init; } = 20;
}


