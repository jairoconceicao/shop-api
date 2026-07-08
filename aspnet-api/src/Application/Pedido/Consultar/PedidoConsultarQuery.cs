using aspnet_api.Api.Contracts.Requests.Pedidos;
using aspnet_api.Api.Contracts.Responses.Pedidos;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Application.Abstractions.Security;
using aspnet_api.Application.Common;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Common;
using aspnet_api.src.Application.Pedido.Shared;
using DomainPedido = aspnet_api.Domain.Entities.Pedido;
using FluentValidation;

namespace aspnet_api.src.Application.Pedido.Consultar;

public sealed class PedidoConsultarQuery : IActionCommand<PedidosQuery, Result<PagedResult<PedidoResponse>>>
{
    private readonly IValidator<PedidosQuery> _validator;
    private readonly IClienteRepository _clienteRepository;
    private readonly IPedidoRepository _pedidoRepository;
    private readonly ISessaoAtualProvider _sessaoAtualProvider;

    public PedidoConsultarQuery(
        IValidator<PedidosQuery> validator,
        IClienteRepository clienteRepository,
        IPedidoRepository pedidoRepository,
        ISessaoAtualProvider sessaoAtualProvider)
    {
        _validator = validator;
        _clienteRepository = clienteRepository;
        _pedidoRepository = pedidoRepository;
        _sessaoAtualProvider = sessaoAtualProvider;
    }

    public async Task<Result<PagedResult<PedidoResponse>>> Handle(PedidosQuery command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Result<PagedResult<PedidoResponse>>.Failure(
                "Dados invalidos para a consulta de pedidos.",
                validationResult.Errors.ToNotifications());
        }

        var cliente = await _clienteRepository.GetByCpfAsync(command.Cpf);
        if (cliente is null)
        {
            return Result<PagedResult<PedidoResponse>>.Failure(
                "Cliente nao encontrado.",
                new[]
                {
                    new Notification("CLIENTE_NAO_ENCONTRADO", "Cliente nao encontrado.", nameof(command.Cpf))
                });
        }

        var autorizacao = _sessaoAtualProvider.ValidarAcessoAoCliente(cliente.Id, nameof(command.Cpf));
        if (autorizacao.IsFailure)
        {
            return Result<PagedResult<PedidoResponse>>.Failure(autorizacao.Message, autorizacao.Notifications);
        }

        var pedidos = await _pedidoRepository.ListByClienteIdAsync(cliente.Id);
        IEnumerable<DomainPedido> pedidosFiltrados = pedidos;

        if (command.DataInicio.HasValue)
        {
            pedidosFiltrados = pedidosFiltrados.Where(pedido => pedido.DataPedido >= command.DataInicio.Value);
        }

        if (command.DataFim.HasValue)
        {
            pedidosFiltrados = pedidosFiltrados.Where(pedido => pedido.DataPedido <= command.DataFim.Value);
        }

        var totalItems = pedidosFiltrados.LongCount();
        var items = pedidosFiltrados
            .Skip((command.Page - 1) * command.Size)
            .Take(command.Size)
            .Select(pedido => pedido.ToResponse())
            .ToArray();

        return Result<PagedResult<PedidoResponse>>.Success(
            new PagedResult<PedidoResponse>(items, command.Page, command.Size, totalItems),
            "Pedidos consultados com sucesso.");
    }
}
