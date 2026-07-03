namespace aspnet_api.Api.Contracts.Requests.Shared;

public sealed record EnderecoRequest
{
    public string Logradouro { get; init; } = string.Empty;

    public string Numero { get; init; } = string.Empty;

    public string? Complemento { get; init; }

    public string Cep { get; init; } = string.Empty;

    public string Bairro { get; init; } = string.Empty;

    public string Cidade { get; init; } = string.Empty;

    public string Uf { get; init; } = string.Empty;
}


