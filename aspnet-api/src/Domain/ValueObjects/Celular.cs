using aspnet_api.Domain.Common;

namespace aspnet_api.Domain.ValueObjects;

public sealed class Celular
{
    public string Ddd { get; init; }
    public string Numero { get; init; }
    public bool WhatsApp { get; init; }

    public Celular(string ddd, string numero, bool whatsApp)
    {
        Ddd = ddd;
        Numero = numero;
        WhatsApp = whatsApp;
    }

    public static Result<Celular> Create(string ddd, string numero, bool whatsApp)
    {
        var notifications = new List<Notification>();

        if (string.IsNullOrWhiteSpace(ddd))
        {
            notifications.Add(new Notification("CELULAR_DDD_OBRIGATORIO", "Ddd e obrigatorio.", nameof(Ddd)));
        }
        else if (ddd.Length != 2 || !ddd.All(char.IsDigit))
        {
            notifications.Add(new Notification("CELULAR_DDD_INVALIDO", "Ddd deve conter 2 digitos numericos.", nameof(Ddd)));
        }

        if (string.IsNullOrWhiteSpace(numero))
        {
            notifications.Add(new Notification("CELULAR_NUMERO_OBRIGATORIO", "Numero de celular e obrigatorio.", nameof(Numero)));
        }
        else if (numero.Length > 30)
        {
            notifications.Add(new Notification("CELULAR_NUMERO_TAMANHO_INVALIDO", "Numero de celular deve ter no maximo 30 caracteres.", nameof(Numero)));
        }

        if (notifications.Count > 0)
        {
            return Result<Celular>.Failure("Celular invalido.", notifications);
        }

        return Result<Celular>.Success(new Celular(ddd, numero, whatsApp));
    }
}


