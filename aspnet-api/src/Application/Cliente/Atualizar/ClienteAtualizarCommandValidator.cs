using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.src.Application.Cliente.Shared;

namespace aspnet_api.src.Application.Cliente.Atualizar;

public sealed class ClienteAtualizarCommandValidator : ClienteUpsertRequestValidator<UpdateClienteRequest>
{
}
