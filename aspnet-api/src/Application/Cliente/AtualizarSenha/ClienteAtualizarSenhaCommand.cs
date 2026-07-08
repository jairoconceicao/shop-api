using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.Api.Contracts.Responses.Clientes;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Application.Abstractions.Security;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Common;
using FluentValidation;

namespace aspnet_api.src.Application.Cliente.AtualizarSenha;

public sealed class ClienteAtualizarSenhaCommand : IActionCommand<AtualizarSenhaClienteCommand, Result<ClienteIdResponse>>
{
    private readonly IValidator<AtualizarSenhaClienteCommand> _validator;
    private readonly IClienteRepository _clienteRepository;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ISessaoAtualProvider _sessaoAtualProvider;
    private readonly IUnitOfWork _unitOfWork;

    public ClienteAtualizarSenhaCommand(
        IValidator<AtualizarSenhaClienteCommand> validator,
        IClienteRepository clienteRepository,
        IUsuarioRepository usuarioRepository,
        IPasswordHasher passwordHasher,
        ISessaoAtualProvider sessaoAtualProvider,
        IUnitOfWork unitOfWork)
    {
        _validator = validator;
        _clienteRepository = clienteRepository;
        _usuarioRepository = usuarioRepository;
        _passwordHasher = passwordHasher;
        _sessaoAtualProvider = sessaoAtualProvider;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ClienteIdResponse>> Handle(AtualizarSenhaClienteCommand command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Result<ClienteIdResponse>.Failure(
                "Dados invalidos para a troca de senha do cliente.",
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
                [
                    new Notification("CLIENTE_NAO_ENCONTRADO", "Cliente nao encontrado.", nameof(command.ClienteId))
                ]);
        }

        var usuario = await _usuarioRepository.GetByClienteIdAsync(command.ClienteId);
        if (usuario is null)
        {
            return Result<ClienteIdResponse>.Failure(
                "Usuario do cliente nao encontrado.",
                [
                    new Notification("USUARIO_NAO_ENCONTRADO", "Usuario do cliente nao encontrado.", nameof(command.ClienteId))
                ]);
        }

        if (!_passwordHasher.Verify(command.Request.SenhaAtual, usuario.SenhaHash))
        {
            return Result<ClienteIdResponse>.Failure(
                "Senha atual invalida.",
                [
                    new Notification("USUARIO_SENHA_ATUAL_INVALIDA", "Senha atual invalida.", nameof(UpdateClientePasswordRequest.SenhaAtual))
                ]);
        }

        var senhaHash = _passwordHasher.Hash(command.Request.SenhaNova);
        var resultado = usuario.AtualizarSenha(senhaHash);
        if (resultado.IsFailure)
        {
            return Result<ClienteIdResponse>.Failure(resultado.Message, resultado.Notifications);
        }

        _usuarioRepository.Update(usuario);
        await _unitOfWork.SaveChangesAsync();

        return Result<ClienteIdResponse>.Success(
            new ClienteIdResponse { ClienteId = command.ClienteId },
            "Senha do cliente atualizada com sucesso.");
    }
}
