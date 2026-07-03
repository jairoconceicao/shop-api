using System.Text.Json.Serialization;

namespace aspnet_api.Api.Contracts.Shared;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PedidoStatus
{
    Criado,
    EmProcessamento,
    Processado,
    Cancelado,
    Devolvido
}


