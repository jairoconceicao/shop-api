using aspnet_api.Api.Contracts.Responses.Auth;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Application.Abstractions.Security;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using DomainSessao = aspnet_api.Domain.Entities.Sessao;

namespace aspnet_api.src.Application.Auth.Encerrar;

public sealed class EncerrarSessaoCommand : IActionCommand<EncerrarSessaoCommandInput, Result<LogoutResponse>>
{
    private readonly ISessaoAtualProvider _sessaoAtualProvider;
    private readonly ISessaoRepository _sessaoRepository;
    private readonly IUnitOfWork _unitOfWork;

    public EncerrarSessaoCommand(
        ISessaoAtualProvider sessaoAtualProvider,
        ISessaoRepository sessaoRepository,
        IUnitOfWork unitOfWork)
    {
        _sessaoAtualProvider = sessaoAtualProvider;
        _sessaoRepository = sessaoRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LogoutResponse>> Handle(EncerrarSessaoCommandInput command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var jti = _sessaoAtualProvider.Jti;
        if (string.IsNullOrWhiteSpace(jti))
        {
            return Result<LogoutResponse>.Failure(
                "Sessao nao identificada.",
                new[]
                {
                    new Notification("AUTH_SESSAO_NAO_IDENTIFICADA", "Token nao possui identificador de sessao.", "jti")
                });
        }

        var sessao = await _sessaoRepository.GetByJtiAsync(jti);
        if (sessao is null)
        {
            return Result<LogoutResponse>.Failure(
                "Sessao nao encontrada.",
                new[]
                {
                    new Notification("AUTH_SESSAO_NAO_ENCONTRADA", "Sessao nao encontrada para o token informado.", "jti")
                });
        }

        var revogarResult = sessao.Revogar();
        if (revogarResult.IsFailure)
        {
            return Result<LogoutResponse>.Failure(revogarResult.Message, revogarResult.Notifications);
        }

        _sessaoRepository.Update(sessao);
        await _unitOfWork.SaveChangesAsync();

        return Result<LogoutResponse>.Success(
            new LogoutResponse
            {
                Jti = sessao.Jti,
                RevogadaEm = sessao.RevogadaEm!.Value
            },
            "Logout realizado com sucesso.");
    }
}
