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
}
