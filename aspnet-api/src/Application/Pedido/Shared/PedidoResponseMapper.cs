using aspnet_api.Api.Contracts.Responses.Pedidos;
using aspnet_api.Api.Contracts.Responses.Shared;
using aspnet_api.Api.Contracts.Shared;
using aspnet_api.Domain.Entities;
using DomainEndereco = aspnet_api.Domain.ValueObjects.Endereco;
using DomainFormaPagamento = aspnet_api.src.Domain.Enums.FormaPagamento;
using DomainPedido = aspnet_api.Domain.Entities.Pedido;
using DomainPedidoItem = aspnet_api.Domain.Entities.PedidoItem;
using DomainStatusPedido = aspnet_api.src.Domain.Enums.StatusPedido;

namespace aspnet_api.src.Application.Pedido.Shared;

public static class PedidoResponseMapper
{
    public static PedidoResponse ToResponse(this DomainPedido pedido)
    {
        ArgumentNullException.ThrowIfNull(pedido);

        return new PedidoResponse
        {
            PedidoId = pedido.Id,
            CarrinhoId = pedido.CarrinhoId.GetValueOrDefault(),
            ClienteId = pedido.ClienteId,
            EnderecoEntrega = pedido.EnderecoEntrega is null
                ? new EnderecoResponse()
                : pedido.EnderecoEntrega.ToResponse(),
            DataPedido = pedido.DataPedido,
            FormaPagamento = pedido.FormaPagamento.ToApi(),
            Status = pedido.Status.ToApi(),
            Items = pedido.Items.Select(item => item.ToResponse()).ToArray()
        };
    }

    public static PedidoCriadoResponse ToCriadoResponse(this DomainPedido pedido)
    {
        ArgumentNullException.ThrowIfNull(pedido);

        return new PedidoCriadoResponse
        {
            PedidoId = pedido.Id,
            ClienteId = pedido.ClienteId,
            DataPedido = pedido.DataPedido,
            FormaPagamento = pedido.FormaPagamento.ToApi(),
            Status = pedido.Status.ToApi(),
            ValorTotal = pedido.CalcularValorTotal()
        };
    }

    public static PedidoCanceladoResponse ToCanceladoResponse(this DomainPedido pedido)
    {
        ArgumentNullException.ThrowIfNull(pedido);

        return new PedidoCanceladoResponse
        {
            PedidoId = pedido.Id,
            ClienteId = pedido.ClienteId,
            DataPedido = pedido.DataPedido,
            Status = pedido.Status.ToApi()
        };
    }

    public static PedidoItemResponse ToResponse(this DomainPedidoItem item)
    {
        ArgumentNullException.ThrowIfNull(item);

        return new PedidoItemResponse
        {
            ItemId = item.Id,
            ProdutoId = item.ProdutoId,
            Quantidade = item.Quantidade,
            ValorUnitario = item.ValorUnitario
        };
    }

    public static EnderecoResponse ToResponse(this DomainEndereco endereco)
    {
        ArgumentNullException.ThrowIfNull(endereco);

        return new EnderecoResponse
        {
            Logradouro = endereco.Logradouro,
            Numero = endereco.Numero,
            Complemento = endereco.Complemento,
            Cep = endereco.Cep,
            Bairro = endereco.Bairro,
            Cidade = endereco.Cidade,
            Uf = endereco.Uf
        };
    }

    public static FormaPagamento ToApi(this DomainFormaPagamento formaPagamento)
    {
        return formaPagamento switch
        {
            DomainFormaPagamento.Pix => FormaPagamento.Pix,
            DomainFormaPagamento.Cartao => FormaPagamento.Cartao,
            DomainFormaPagamento.Boleto => FormaPagamento.Boleto,
            _ => FormaPagamento.Pix
        };
    }

    public static PedidoStatus ToApi(this DomainStatusPedido statusPedido)
    {
        return statusPedido switch
        {
            DomainStatusPedido.Criado => PedidoStatus.Criado,
            DomainStatusPedido.EmProcessamento => PedidoStatus.EmProcessamento,
            DomainStatusPedido.Processado => PedidoStatus.Processado,
            DomainStatusPedido.Cancelado => PedidoStatus.Cancelado,
            DomainStatusPedido.Devolvido => PedidoStatus.Devolvido,
            _ => PedidoStatus.Criado
        };
    }

    public static DomainFormaPagamento ToDomain(this FormaPagamento formaPagamento)
    {
        return formaPagamento switch
        {
            FormaPagamento.Pix => DomainFormaPagamento.Pix,
            FormaPagamento.Cartao => DomainFormaPagamento.Cartao,
            FormaPagamento.Boleto => DomainFormaPagamento.Boleto,
            _ => DomainFormaPagamento.Pix
        };
    }

    public static DomainStatusPedido ToDomain(this PedidoStatus statusPedido)
    {
        return statusPedido switch
        {
            PedidoStatus.Criado => DomainStatusPedido.Criado,
            PedidoStatus.EmProcessamento => DomainStatusPedido.EmProcessamento,
            PedidoStatus.Processado => DomainStatusPedido.Processado,
            PedidoStatus.Cancelado => DomainStatusPedido.Cancelado,
            PedidoStatus.Devolvido => DomainStatusPedido.Devolvido,
            _ => DomainStatusPedido.Criado
        };
    }
}


