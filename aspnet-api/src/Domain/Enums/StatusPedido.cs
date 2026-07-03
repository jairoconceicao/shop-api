using System.ComponentModel;

namespace aspnet_api.src.Domain.Enums;

public enum StatusPedido
{
    [Description("Criado")]
    Criado,
    [Description("EmProcessamento")]
    EmProcessamento,
    [Description("Processado")]
    Processado,
    [Description("Cancelado")]
    Cancelado,
    [Description("Devolvido")]
    Devolvido,
}

