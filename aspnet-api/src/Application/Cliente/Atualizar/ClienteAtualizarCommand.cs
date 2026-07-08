using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.Api.Contracts.Responses.Clientes;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Application.Abstractions.Security;
using aspnet_api.Domain.Common;
using aspnet_api.Domain.Entities;
using aspnet_api.Domain.ValueObjects;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Common;
using FluentValidation;
using DomainCliente = aspnet_api.Domain.Entities.Cliente;
using DomainCelular = aspnet_api.Domain.ValueObjects.Celular;
using DomainEndereco = aspnet_api.Domain.ValueObjects.Endereco;

namespace aspnet_api.src.Application.Cliente.Atualizar;

public sealed class ClienteAtualizarCommand : IActionCommand<AtualizarClienteCommand, Result<ClienteIdResponse>>
{
    private readonly IValidator<AtualizarClienteCommand> _validator;
    private readonly IClienteRepository _clienteRepository;
    private readonly ISessaoAtualProvider _sessaoAtualProvider;
    private readonly IUnitOfWork _unitOfWork;

    public ClienteAtualizarCommand(
        IValidator<AtualizarClienteCommand> validator,
        IClienteRepository clienteRepository,
        ISessaoAtualProvider sessaoAtualProvider,
        IUnitOfWork unitOfWork)
    {
        _validator = validator;
        _clienteRepository = clienteRepository;
        _sessaoAtualProvider = sessaoAtualProvider;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ClienteIdResponse>> Handle(AtualizarClienteCommand command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Result<ClienteIdResponse>.Failure(
                "Dados invalidos para a atualizacao do cliente.",
                validationResult.Errors.ToNotifications());
        }

        var autorizacao = _sessaoAtualProvider.ValidarAcessoAoCliente(command.ClienteId, nameof(command.ClienteId));
        if (autorizacao.IsFailure)
        {
            return Result<ClienteIdResponse>.Failure(autorizacao.Message, autorizacao.Notifications);
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

        var notifications = new List<Notification>();

        var clienteCpf = await _clienteRepository.GetByCpfAsync(command.Request.Cpf);
        if (clienteCpf is not null && clienteCpf.Id != command.ClienteId)
        {
            notifications.Add(new Notification(
                "CLIENTE_CPF_DUPLICADO",
                "Ja existe um cliente cadastrado com este CPF.",
                nameof(command.Request.Cpf)));
        }

        var clienteEmail = await _clienteRepository.GetByEmailAsync(command.Request.Email);
        if (clienteEmail is not null && clienteEmail.Id != command.ClienteId)
        {
            notifications.Add(new Notification(
                "CLIENTE_EMAIL_DUPLICADO",
                "Ja existe um cliente cadastrado com este email.",
                nameof(command.Request.Email)));
        }

        if (notifications.Count > 0)
        {
            return Result<ClienteIdResponse>.Failure("Nao foi possivel atualizar o cliente.", notifications);
        }

        var enderecoResult = DomainEndereco.Create(
            command.Request.Endereco.Logradouro,
            command.Request.Endereco.Numero,
            command.Request.Endereco.Complemento,
            command.Request.Endereco.Cep,
            command.Request.Endereco.Bairro,
            command.Request.Endereco.Cidade,
            command.Request.Endereco.Uf);

        if (enderecoResult.IsFailure)
        {
            return Result<ClienteIdResponse>.Failure(enderecoResult.Message, enderecoResult.Notifications);
        }

        var celularResult = DomainCelular.Create(
            command.Request.Celular.Ddd,
            command.Request.Celular.Numero,
            command.Request.Celular.WhatsApp);

        if (celularResult.IsFailure)
        {
            return Result<ClienteIdResponse>.Failure(celularResult.Message, celularResult.Notifications);
        }

        var clienteAtualizado = DomainCliente.Create(
            command.Request.Nome,
            command.Request.Cpf,
            command.Request.DataNascimento,
            enderecoResult.Data,
            celularResult.Data,
            command.Request.Email);

        cliente.AtualizarCom(clienteAtualizado);
        _clienteRepository.Update(cliente);
        await _unitOfWork.SaveChangesAsync();

        return Result<ClienteIdResponse>.Success(
            new ClienteIdResponse { ClienteId = cliente.Id },
            "Cliente atualizado com sucesso.");
    }
}
