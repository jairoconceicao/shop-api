using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.Api.Contracts.Responses.Clientes;
using aspnet_api.src.Application.Abstractions.Commands;
using FluentValidation;

namespace aspnet_api.src.Application.Cliente.Registrar;

public class ClienteRegistrarCommand : IActionCommand<CreateClienteRequest, ClienteIdResponse>
{
    private readonly IValidator<CreateClienteRequest> _validator;

    public ClienteRegistrarCommand(IValidator<CreateClienteRequest> validator)
    {
        _validator = validator;
    }

    public async Task<ClienteIdResponse> Handle(CreateClienteRequest command)
    {
        ArgumentNullException.ThrowIfNull(command);

        await _validator.ValidateAndThrowAsync(command);
        throw new NotImplementedException();
    }
}
