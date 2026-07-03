using aspnet_api.Api.Contracts.Requests.Pedidos;
using aspnet_api.Api.Contracts.Responses.Pedidos;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
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
    private readonly IUnitOfWork _unitOfWork;

    public PedidoCriarCommand(
        IValidator<CreatePedidoRequest> validator,
        IClienteRepository clienteRepository,
        ICarrinhoRepository carrinhoRepository,
        IPedidoRepository pedidoRepository,
        IUnitOfWork unitOfWork)
    {
        _validator = validator;
        _clienteRepository = clienteRepository;
        _carrinhoRepository = carrinhoRepository;
        _pedidoRepository = pedidoRepository;
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

        var cliente = await _clienteRepository.GetByIdAsync(command.ClienteId);
        if (cliente is null)
        {
            return Result<PedidoCriadoResponse>.Failure(
                "Cliente nao encontrado.",
                new[]
                {
                    new Notification("CLIENTE_NAO_ENCONTRADO", "Cliente nao encontrado.", nameof(command.ClienteId))
                });
        }

        var carrinho = await _carrinhoRepository.GetByIdAsync(command.CarrinhoId);
        if (carrinho is null)
        {
            return Result<PedidoCriadoResponse>.Failure(
                "Carrinho nao encontrado.",
                new[]
                {
                    new Notification("CARRINHO_NAO_ENCONTRADO", "Carrinho nao encontrado.", nameof(command.CarrinhoId))
                });
        }

        if (carrinho.ClienteId != command.ClienteId)
        {
            return Result<PedidoCriadoResponse>.Failure(
                "Carrinho nao pertence ao cliente informado.",
                new[]
                {
                    new Notification("PEDIDO_CARRINHO_CLIENTE_INVALIDO", "Carrinho nao pertence ao cliente informado.", nameof(command.ClienteId))
                });
        }

        var pedidoExistente = await _pedidoRepository.GetByCarrinhoIdAsync(command.CarrinhoId);
        if (pedidoExistente is not null)
        {
            return Result<PedidoCriadoResponse>.Failure(
                "Ja existe pedido para o carrinho informado.",
                new[]
                {
                    new Notification("PEDIDO_CONFLITO_CARRINHO", "Ja existe pedido para o carrinho informado.", nameof(command.CarrinhoId))
                });
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
            command.ClienteId,
            command.CarrinhoId,
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


