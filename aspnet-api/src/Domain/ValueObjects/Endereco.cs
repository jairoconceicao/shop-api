using aspnet_api.Domain.Common;

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

    public static Result<Endereco> Create(string logradouro, string numero, string? complemento, string cep, string bairro, string cidade, string uf)
    {
        var notifications = new List<Notification>();

        if (string.IsNullOrWhiteSpace(logradouro))
        {
            notifications.Add(new Notification("ENDERECO_LOGRADOURO_OBRIGATORIO", "Logradouro e obrigatorio.", nameof(Logradouro)));
        }
        else if (logradouro.Length > 200)
        {
            notifications.Add(new Notification("ENDERECO_LOGRADOURO_TAMANHO_INVALIDO", "Logradouro deve ter no maximo 200 caracteres.", nameof(Logradouro)));
        }

        if (string.IsNullOrWhiteSpace(numero))
        {
            notifications.Add(new Notification("ENDERECO_NUMERO_OBRIGATORIO", "Numero e obrigatorio.", nameof(Numero)));
        }
        else if (numero.Length > 50)
        {
            notifications.Add(new Notification("ENDERECO_NUMERO_TAMANHO_INVALIDO", "Numero deve ter no maximo 50 caracteres.", nameof(Numero)));
        }

        if (!string.IsNullOrWhiteSpace(complemento) && complemento.Length > 200)
        {
            notifications.Add(new Notification("ENDERECO_COMPLEMENTO_TAMANHO_INVALIDO", "Complemento deve ter no maximo 200 caracteres.", nameof(Complemento)));
        }

        if (string.IsNullOrWhiteSpace(cep))
        {
            notifications.Add(new Notification("ENDERECO_CEP_OBRIGATORIO", "Cep e obrigatorio.", nameof(Cep)));
        }
        else if (cep.Length > 20)
        {
            notifications.Add(new Notification("ENDERECO_CEP_TAMANHO_INVALIDO", "Cep deve ter no maximo 20 caracteres.", nameof(Cep)));
        }

        if (string.IsNullOrWhiteSpace(bairro))
        {
            notifications.Add(new Notification("ENDERECO_BAIRRO_OBRIGATORIO", "Bairro e obrigatorio.", nameof(Bairro)));
        }
        else if (bairro.Length > 100)
        {
            notifications.Add(new Notification("ENDERECO_BAIRRO_TAMANHO_INVALIDO", "Bairro deve ter no maximo 100 caracteres.", nameof(Bairro)));
        }

        if (string.IsNullOrWhiteSpace(cidade))
        {
            notifications.Add(new Notification("ENDERECO_CIDADE_OBRIGATORIA", "Cidade e obrigatoria.", nameof(Cidade)));
        }
        else if (cidade.Length > 100)
        {
            notifications.Add(new Notification("ENDERECO_CIDADE_TAMANHO_INVALIDO", "Cidade deve ter no maximo 100 caracteres.", nameof(Cidade)));
        }

        if (string.IsNullOrWhiteSpace(uf))
        {
            notifications.Add(new Notification("ENDERECO_UF_OBRIGATORIA", "Uf e obrigatoria.", nameof(Uf)));
        }
        else if (uf.Length != 2)
        {
            notifications.Add(new Notification("ENDERECO_UF_TAMANHO_INVALIDO", "Uf deve ter 2 caracteres.", nameof(Uf)));
        }

        if (notifications.Count > 0)
        {
            return Result<Endereco>.Failure("Endereco invalido.", notifications);
        }

        return Result<Endereco>.Success(new Endereco(logradouro, numero, complemento, cep, bairro, cidade, uf));
    }
}


