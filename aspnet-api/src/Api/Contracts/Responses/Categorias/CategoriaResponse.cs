namespace aspnet_api.Api.Contracts.Responses.Categorias;

public sealed record CategoriaResponse
{
    public long CategoriaId { get; init; }

    public string Titulo { get; init; } = string.Empty;

    public string? Descricao { get; init; }
}
