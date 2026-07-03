using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.Api.Contracts.Responses.Clientes;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Application.Abstractions.Security;
using aspnet_api.Domain.Common;
using aspnet_api.Domain.ValueObjects;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Common;
using FluentValidation;
using DomainUsuario = aspnet_api.Domain.Entities.Usuario;
using DomainCliente = aspnet_api.Domain.Entities.Cliente;
using DomainCelular = aspnet_api.Domain.ValueObjects.Celular;
using DomainEndereco = aspnet_api.Domain.ValueObjects.Endereco;

namespace aspnet_api.src.Application.Cliente.Registrar;

public sealed class ClienteRegistrarCommand : IActionCommand<CreateClienteRequest, Result<ClienteIdResponse>>
{
    private readonly IValidator<CreateClienteRequest> _validator;
    private readonly IClienteRepository _clienteRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _unitOfWork;

    public ClienteRegistrarCommand(
        IValidator<CreateClienteRequest> validator,
        IClienteRepository clienteRepository,
        IUsuarioRepository usuarioRepository,
        IPasswordHasher passwordHasher,
        IUnitOfWork unitOfWork)
    {
        _validator = validator;
        _clienteRepository = clienteRepository;
        _usuarioRepository = usuarioRepository;
        _passwordHasher = passwordHasher;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ClienteIdResponse>> Handle(CreateClienteRequest command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Result<ClienteIdResponse>.Failure(
                "Dados invalidos para o cadastro do cliente.",
                validationResult.Errors.ToNotifications());
        }

        var notifications = new List<Notification>();
        var emailNormalizado = command.Email.Trim().ToLowerInvariant();

        if (await _clienteRepository.GetByCpfAsync(command.Cpf) is not null)
        {
            notifications.Add(new Notification(
                "CLIENTE_CPF_DUPLICADO",
                "Ja existe um cliente cadastrado com este CPF.",
                nameof(command.Cpf)));
        }

        if (await _clienteRepository.GetByEmailAsync(command.Email) is not null)
        {
            notifications.Add(new Notification(
                "CLIENTE_EMAIL_DUPLICADO",
                "Ja existe um cliente cadastrado com este email.",
                nameof(command.Email)));
        }

        if (await _usuarioRepository.GetByEmailAsync(emailNormalizado) is not null)
        {
            notifications.Add(new Notification(
                "USUARIO_EMAIL_DUPLICADO",
                "Ja existe um usuario cadastrado com este email.",
                nameof(command.Email)));
        }

        if (notifications.Count > 0)
        {
            return Result<ClienteIdResponse>.Failure("Nao foi possivel cadastrar o cliente.", notifications);
        }

        var enderecoResult = DomainEndereco.Create(
            command.Endereco.Logradouro,
            command.Endereco.Numero,
            command.Endereco.Complemento,
            command.Endereco.Cep,
            command.Endereco.Bairro,
            command.Endereco.Cidade,
            command.Endereco.Uf);

        if (enderecoResult.IsFailure)
        {
            return Result<ClienteIdResponse>.Failure(enderecoResult.Message, enderecoResult.Notifications);
        }

        var celularResult = DomainCelular.Create(
            command.Celular.Ddd,
            command.Celular.Numero,
            command.Celular.WhatsApp);

        if (celularResult.IsFailure)
        {
            return Result<ClienteIdResponse>.Failure(celularResult.Message, celularResult.Notifications);
        }

        var cliente = DomainCliente.Create(
            command.Nome,
            command.Cpf,
            command.DataNascimento,
            enderecoResult.Data,
            celularResult.Data,
            command.Email);

        cliente = await PersistirClienteAsync(cliente, command.Cpf);

        var senhaHash = _passwordHasher.Hash(command.Senha);
        var usuario = DomainUsuario.Create(cliente.Id, emailNormalizado, senhaHash);

        await _usuarioRepository.AddAsync(usuario);
        await _unitOfWork.SaveChangesAsync();

        return Result<ClienteIdResponse>.Success(
            new ClienteIdResponse { ClienteId = cliente.Id },
            "Cliente cadastrado com sucesso.");
    }

    private async Task<DomainCliente> PersistirClienteAsync(DomainCliente cliente, string cpf)
    {
        await _clienteRepository.AddAsync(cliente);
        await _unitOfWork.SaveChangesAsync();

        return await _clienteRepository.GetByCpfAsync(cpf) ?? cliente;
    }
}
