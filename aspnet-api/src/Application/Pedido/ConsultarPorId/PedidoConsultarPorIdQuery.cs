using aspnet_api.Api.Contracts.Responses.Pedidos;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Application.Abstractions.Security;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Common;
using aspnet_api.src.Application.Pedido.Shared;
using FluentValidation;

namespace aspnet_api.src.Application.Pedido.ConsultarPorId;

public sealed class PedidoConsultarPorIdQuery : IActionCommand<ConsultarPedidoPorIdQuery, Result<PedidoResponse>>
{
    private readonly IValidator<ConsultarPedidoPorIdQuery> _validator;
    private readonly IPedidoRepository _pedidoRepository;
    private readonly ISessaoAtualProvider _sessaoAtualProvider;

    public PedidoConsultarPorIdQuery(
        IValidator<ConsultarPedidoPorIdQuery> validator,
        IPedidoRepository pedidoRepository,
        ISessaoAtualProvider sessaoAtualProvider)
    {
        _validator = validator;
        _pedidoRepository = pedidoRepository;
        _sessaoAtualProvider = sessaoAtualProvider;
    }

    public async Task<Result<PedidoResponse>> Handle(ConsultarPedidoPorIdQuery command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Result<PedidoResponse>.Failure(
                "Dados invalidos para a consulta do pedido.",
                validationResult.Errors.ToNotifications());
        }

        var pedido = await _pedidoRepository.GetByIdAsync(command.PedidoId);
        if (pedido is null)
        {
            return Result<PedidoResponse>.Failure(
                "Pedido nao encontrado.",
                new[]
                {
                    new Notification("PEDIDO_NAO_ENCONTRADO", "Pedido nao encontrado.", nameof(command.PedidoId))
                });
        }

        var autorizacao = _sessaoAtualProvider.ValidarAcessoAoCliente(pedido.ClienteId, nameof(command.PedidoId));
        if (autorizacao.IsFailure)
        {
            return Result<PedidoResponse>.Failure(autorizacao.Message, autorizacao.Notifications);
        }

        return Result<PedidoResponse>.Success(
            pedido.ToResponse(),
            "Pedido consultado com sucesso.");
    }
}
