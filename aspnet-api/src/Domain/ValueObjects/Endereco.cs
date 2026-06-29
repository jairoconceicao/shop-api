namespace aspnet_api.Domain.ValueObjects;

public sealed class Endereco
{
    public string Logradouro { get; init; }
    public string Numero { get; init; }
    public string? Complemento { get; init; }
    public string Cep { get; init; }
    public string Bairro { get; init; }
    public string Cidade { get; init; }
    public string Uf { get; init; }

    public Endereco(string logradouro, string numero, string? complemento, string cep, string bairro, string cidade, string uf)
    {
        Logradouro = logradouro;
        Numero = numero;
        Complemento = complemento;
        Cep = cep;
        Bairro = bairro;
        Cidade = cidade;
        Uf = uf;
    }
}
