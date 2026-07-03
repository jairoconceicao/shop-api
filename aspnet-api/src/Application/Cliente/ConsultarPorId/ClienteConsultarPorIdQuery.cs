using aspnet_api.Api.Contracts.Responses.Clientes;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Common;
using aspnet_api.src.Application.Cliente.Shared;
using FluentValidation;

namespace aspnet_api.src.Application.Cliente.ConsultarPorId;

public sealed class ClienteConsultarPorIdQuery : IActionCommand<ConsultarClientePorIdQuery, Result<ClienteDetalheResponse>>
{
    private readonly IValidator<ConsultarClientePorIdQuery> _validator;
    private readonly IClienteRepository _clienteRepository;

    public ClienteConsultarPorIdQuery(
        IValidator<ConsultarClientePorIdQuery> validator,
        IClienteRepository clienteRepository)
    {
        _validator = validator;
        _clienteRepository = clienteRepository;
    }

    public async Task<Result<ClienteDetalheResponse>> Handle(ConsultarClientePorIdQuery command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Result<ClienteDetalheResponse>.Failure(
                "Dados invalidos para a consulta do cliente.",
                validationResult.Errors.ToNotifications());
        }

        var cliente = await _clienteRepository.GetByIdAsync(command.ClienteId);
        if (cliente is null)
        {
            return Result<ClienteDetalheResponse>.Failure(
                "Cliente nao encontrado.",
                new[]
                {
                    new Notification("CLIENTE_NAO_ENCONTRADO", "Cliente nao encontrado.", nameof(command.ClienteId))
                });
        }

        return Result<ClienteDetalheResponse>.Success(
            cliente.ToDetalheResponse(),
            "Cliente consultado com sucesso.");
    }
}


