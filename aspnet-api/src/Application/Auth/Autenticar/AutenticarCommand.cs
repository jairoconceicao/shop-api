using aspnet_api.Api.Contracts.Requests.Auth;
using aspnet_api.Api.Contracts.Responses.Auth;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Application.Abstractions.Security;
using aspnet_api.Domain.Common;
using aspnet_api.Domain.Entities;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Common;
using FluentValidation;

namespace aspnet_api.src.Application.Auth.Autenticar;

public sealed class AutenticarCommand : IActionCommand<LoginRequest, Result<LoginResponse>>
{
    private static readonly TimeSpan DuracaoToken = TimeSpan.FromHours(8);

    private readonly IValidator<LoginRequest> _validator;
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly ISessaoRepository _sessaoRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IUnitOfWork _unitOfWork;

    public AutenticarCommand(
        IValidator<LoginRequest> validator,
        IUsuarioRepository usuarioRepository,
        ISessaoRepository sessaoRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService,
        IUnitOfWork unitOfWork)
    {
        _validator = validator;
        _usuarioRepository = usuarioRepository;
        _sessaoRepository = sessaoRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LoginResponse>> Handle(LoginRequest command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Result<LoginResponse>.Failure(
                "Dados invalidos para autenticacao.",
                validationResult.Errors.ToNotifications());
        }

        var email = command.Email.Trim().ToLowerInvariant();
        var usuario = await _usuarioRepository.GetByEmailAsync(email);

        if (usuario is null || !_passwordHasher.Verify(command.Senha, usuario.SenhaHash))
        {
            return Result<LoginResponse>.Failure(
                "Credenciais invalidas.",
                [
                    new Notification("AUTH_CREDENCIAIS_INVALIDAS", "Email ou senha invalidos.", nameof(command.Senha))
                ]);
        }

        var jwtToken = _jwtTokenService.Gerar(
            new JwtDescriptor(usuario.Id, usuario.ClienteId, usuario.Email),
            DuracaoToken);

        var sessaoResult = Sessao.Create(usuario.Id, jwtToken.Jti, jwtToken.ExpiraEm);
        if (sessaoResult.IsFailure)
        {
            return Result<LoginResponse>.Failure(sessaoResult.Message, sessaoResult.Notifications);
        }

        await _sessaoRepository.AddAsync(sessaoResult.Data!);
        await _unitOfWork.SaveChangesAsync();

        return Result<LoginResponse>.Success(
            new LoginResponse
            {
                Token = jwtToken.Token,
                Tipo = "Bearer",
                ExpiraEm = jwtToken.ExpiraEm,
                UsuarioId = usuario.Id,
                ClienteId = usuario.ClienteId,
                Email = usuario.Email
            },
            "Login realizado com sucesso.");
    }
}


