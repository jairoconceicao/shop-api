using aspnet_api.Api.Contracts.Requests.Pedidos;
using aspnet_api.Api.Contracts.Responses.Pedidos;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Application.Abstractions.Security;
using aspnet_api.Domain.Common;
using aspnet_api.Domain.Entities;
using aspnet_api.Domain.ValueObjects;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Common;
using aspnet_api.src.Application.Pedido.Shared;
using DomainFormaPagamento = aspnet_api.src.Domain.Enums.FormaPagamento;
using DomainPedido = aspnet_api.Domain.Entities.Pedido;
using DomainStatusPedido = aspnet_api.src.Domain.Enums.StatusPedido;
using FluentValidation;

namespace aspnet_api.src.Application.Pedido.Criar;

public sealed class PedidoCriarCommand : IActionCommand<CreatePedidoRequest, Result<PedidoCriadoResponse>>
{
    private readonly IValidator<CreatePedidoRequest> _validator;
    private readonly IClienteRepository _clienteRepository;
    private readonly ICarrinhoRepository _carrinhoRepository;
    private readonly IPedidoRepository _pedidoRepository;
    private readonly ISessaoAtualProvider _sessaoAtualProvider;
    private readonly IUnitOfWork _unitOfWork;

    public PedidoCriarCommand(
        IValidator<CreatePedidoRequest> validator,
        IClienteRepository clienteRepository,
        ICarrinhoRepository carrinhoRepository,
        IPedidoRepository pedidoRepository,
        ISessaoAtualProvider sessaoAtualProvider,
        IUnitOfWork unitOfWork)
    {
        _validator = validator;
        _clienteRepository = clienteRepository;
        _carrinhoRepository = carrinhoRepository;
        _pedidoRepository = pedidoRepository;
        _sessaoAtualProvider = sessaoAtualProvider;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PedidoCriadoResponse>> Handle(CreatePedidoRequest command)
    {
        ArgumentNullException.ThrowIfNull(command);

        var validationResult = await _validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Result<PedidoCriadoResponse>.Failure(
                "Dados invalidos para a criacao do pedido.",
                validationResult.Errors.ToNotifications());
        }

        if (!_sessaoAtualProvider.ClienteId.HasValue)
        {
            return Result<PedidoCriadoResponse>.Failure(
                "Cliente autenticado nao identificado.",
                [new Notification("AUTH_CLIENTE_NAO_IDENTIFICADO", "Cliente autenticado nao identificado.", nameof(CreatePedidoRequest))]);
        }

        var clienteId = _sessaoAtualProvider.ClienteId.Value;
        var cliente = await _clienteRepository.GetByIdAsync(clienteId);
        if (cliente is null)
        {
            return Result<PedidoCriadoResponse>.Failure(
                "Cliente nao encontrado.",
                [new Notification("CLIENTE_NAO_ENCONTRADO", "Cliente nao encontrado.", nameof(CreatePedidoRequest))]);
        }

        var carrinho = await _carrinhoRepository.GetByClienteIdAsync(clienteId);
        if (carrinho is null)
        {
            return Result<PedidoCriadoResponse>.Failure(
                "Carrinho nao encontrado para o cliente autenticado.",
                [new Notification("CARRINHO_NAO_ENCONTRADO", "Carrinho nao encontrado para o cliente autenticado.", nameof(CreatePedidoRequest))]);
        }

        var pedidoExistente = await _pedidoRepository.GetByCarrinhoIdAsync(carrinho.Id);
        if (pedidoExistente is not null)
        {
            return Result<PedidoCriadoResponse>.Failure(
                "Ja existe pedido para o carrinho ativo do cliente.",
                [new Notification("PEDIDO_CONFLITO_CARRINHO", "Ja existe pedido para o carrinho ativo do cliente.", nameof(CreatePedidoRequest))]);
        }

        var enderecoResult = Endereco.Create(
            command.EnderecoEntrega.Logradouro,
            command.EnderecoEntrega.Numero,
            command.EnderecoEntrega.Complemento,
            command.EnderecoEntrega.Cep,
            command.EnderecoEntrega.Bairro,
            command.EnderecoEntrega.Cidade,
            command.EnderecoEntrega.Uf);

        if (enderecoResult.IsFailure || enderecoResult.Data is null)
        {
            return Result<PedidoCriadoResponse>.Failure(
                "Endereco de entrega invalido.",
                enderecoResult.Notifications);
        }

        var nextItemId = await _pedidoRepository.GetNextItemIdAsync();
        var items = CreateItems(command.Items, nextItemId);
        var pedido = DomainPedido.Create(
            clienteId,
            carrinho.Id,
            enderecoResult.Data,
            command.DataPedido,
            command.FormaPagamento.ToDomain(),
            DomainStatusPedido.Criado,
            items);

        await _pedidoRepository.AddAsync(pedido);
        await _unitOfWork.SaveChangesAsync();

        return Result<PedidoCriadoResponse>.Success(
            pedido.ToCriadoResponse(),
            "Pedido criado com sucesso.");
    }

    private static List<PedidoItem> CreateItems(IReadOnlyCollection<PedidoItemRequest> requests, long nextItemId)
    {
        var items = new List<PedidoItem>(requests.Count);

        foreach (var request in requests)
        {
            items.Add(PedidoItem.Reconstituir(nextItemId++, request.ProdutoId, request.Quantidade, request.ValorUnitario));
        }

        return items;
    }
}
