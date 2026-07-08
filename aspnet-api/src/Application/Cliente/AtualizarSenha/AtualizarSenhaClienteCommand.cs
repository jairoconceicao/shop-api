using aspnet_api.Api.Contracts.Requests.Clientes;

namespace aspnet_api.src.Application.Cliente.AtualizarSenha;

public sealed record AtualizarSenhaClienteCommand(long ClienteId, UpdateClientePasswordRequest Request);
