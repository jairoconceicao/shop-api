using aspnet_api.Api.Contracts.Responses.Clientes;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Application.Abstractions.Security;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Common;
using aspnet_api.src.Application.Cliente.Shared;
using FluentValidation;

namespace aspnet_api.src.Application.Cliente.ConsultarPorCpf;

public sealed class ClienteConsultarPorCpfQuery : IActionCommand<ConsultarClientePorCpfQuery, Result<ClienteDetalheResponse>>
{
    private readonly IValidator<ConsultarClientePorCpfQuery> _validator;
    private readonly IClienteRepository _clienteRepository;
    private readonly ISessaoAtualProvider _sessaoAtualProvider;

    public ClienteConsultarPorCpfQuery(
        IValidator<ConsultarClientePorCpfQuery> validator,
        IClienteRepository clienteRepository,
        ISessaoAtualProvider sessaoAtualProvider)
    {
        _validator = validator;
        _clienteRepository = clienteRepository;
        _sessaoAtualProvider = sessaoAtualProvider;
    }

    public async Task<Result<ClienteDetalheResponse>> Handle(ConsultarClientePorCpfQuery command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Result<ClienteDetalheResponse>.Failure(
                "Dados invalidos para a consulta do cliente.",
                validationResult.Errors.ToNotifications());
        }

        var cliente = await _clienteRepository.GetByCpfAsync(command.Cpf);
        if (cliente is null)
        {
            return Result<ClienteDetalheResponse>.Failure(
                "Cliente nao encontrado.",
                new[]
                {
                    new Notification("CLIENTE_NAO_ENCONTRADO", "Cliente nao encontrado.", nameof(command.Cpf))
                });
        }

        var autorizacao = _sessaoAtualProvider.ValidarAcessoAoCliente(cliente.Id, nameof(command.Cpf));
        if (autorizacao.IsFailure)
        {
            return Result<ClienteDetalheResponse>.Failure(autorizacao.Message, autorizacao.Notifications);
        }

        return Result<ClienteDetalheResponse>.Success(
            cliente.ToDetalheResponse(),
            "Cliente consultado com sucesso.");
    }
}
