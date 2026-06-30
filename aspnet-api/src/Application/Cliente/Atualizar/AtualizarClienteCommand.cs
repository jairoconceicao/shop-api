using aspnet_api.Api.Contracts.Requests.Clientes;

namespace aspnet_api.src.Application.Cliente.Atualizar;

public sealed record AtualizarClienteCommand(long ClienteId, UpdateClienteRequest Request);
