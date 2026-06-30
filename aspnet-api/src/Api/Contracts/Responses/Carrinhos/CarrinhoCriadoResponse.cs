namespace aspnet_api.Api.Contracts.Responses.Carrinhos;

public sealed record CarrinhoCriadoResponse
{
    public long CarrinhoId { get; init; }

    public DateTime DataCarrinho { get; init; }
}
