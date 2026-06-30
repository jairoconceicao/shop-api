using aspnet_api.Api.Contracts.Responses.Clientes;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using FluentValidation;

namespace aspnet_api.src.Application.Cliente.Excluir;

public sealed class ClienteExcluirCommand : IActionCommand<ExcluirClienteCommand, Result<ClienteIdResponse>>
{
    private readonly IValidator<ExcluirClienteCommand> _validator;
    private readonly IClienteRepository _clienteRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ClienteExcluirCommand(
        IValidator<ExcluirClienteCommand> validator,
        IClienteRepository clienteRepository,
        IUnitOfWork unitOfWork)
    {
        _validator = validator;
        _clienteRepository = clienteRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ClienteIdResponse>> Handle(ExcluirClienteCommand command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Result<ClienteIdResponse>.Failure(
                "Dados invalidos para a exclusao do cliente.",
                validationResult.Errors.Select(error => new Notification(
                    string.IsNullOrWhiteSpace(error.ErrorCode) ? "VALIDATION_ERROR" : error.ErrorCode,
                    error.ErrorMessage,
                    string.IsNullOrWhiteSpace(error.PropertyName) ? null : error.PropertyName)).ToArray());
        }

        var cliente = await _clienteRepository.GetByIdAsync(command.ClienteId);
        if (cliente is null)
        {
            return Result<ClienteIdResponse>.Failure(
                "Cliente nao encontrado.",
                new[]
                {
                    new Notification("CLIENTE_NAO_ENCONTRADO", "Cliente nao encontrado.", nameof(command.ClienteId))
                });
        }

        await _clienteRepository.DeleteAsync(cliente);
        await _unitOfWork.SaveChangesAsync();

        return Result<ClienteIdResponse>.Success(
            new ClienteIdResponse { ClienteId = command.ClienteId },
            "Cliente excluido com sucesso.");
    }
}
