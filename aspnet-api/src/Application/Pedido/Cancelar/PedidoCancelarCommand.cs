using aspnet_api.Api.Contracts.Requests.Pedidos;
using aspnet_api.Api.Contracts.Responses.Pedidos;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Common;
using aspnet_api.src.Application.Pedido.Shared;
using DomainPedido = aspnet_api.Domain.Entities.Pedido;
using DomainStatusPedido = aspnet_api.src.Domain.Enums.StatusPedido;
using FluentValidation;

namespace aspnet_api.src.Application.Pedido.Cancelar;

public sealed record CancelarPedidoCommand(long PedidoId, UpdatePedidoStatusRequest Request);

public sealed class PedidoCancelarCommand : IActionCommand<CancelarPedidoCommand, Result<PedidoCanceladoResponse>>
{
    private readonly IValidator<CancelarPedidoCommand> _validator;
    private readonly IPedidoRepository _pedidoRepository;
    private readonly IUnitOfWork _unitOfWork;

    public PedidoCancelarCommand(
        IValidator<CancelarPedidoCommand> validator,
        IPedidoRepository pedidoRepository,
        IUnitOfWork unitOfWork)
    {
        _validator = validator;
        _pedidoRepository = pedidoRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PedidoCanceladoResponse>> Handle(CancelarPedidoCommand command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Result<PedidoCanceladoResponse>.Failure(
                "Dados invalidos para o cancelamento do pedido.",
                validationResult.Errors.ToNotifications());
        }

        var pedido = await _pedidoRepository.GetByIdAsync(command.PedidoId);
        if (pedido is null)
        {
            return Result<PedidoCanceladoResponse>.Failure(
                "Pedido nao encontrado.",
                new[]
                {
                    new Notification("PEDIDO_NAO_ENCONTRADO", "Pedido nao encontrado.", nameof(command.PedidoId))
                });
        }

        pedido.Cancelar();
        _pedidoRepository.Update(pedido);
        await _unitOfWork.SaveChangesAsync();

        return Result<PedidoCanceladoResponse>.Success(
            pedido.ToCanceladoResponse(),
            "Pedido cancelado com sucesso.");
    }
}
