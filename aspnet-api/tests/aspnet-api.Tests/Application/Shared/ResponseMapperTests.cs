using aspnet_api.Domain.Entities;
using aspnet_api.Domain.ValueObjects;
using aspnet_api.src.Application.Carrinho.Shared;
using aspnet_api.src.Application.Cliente.Shared;
using aspnet_api.src.Application.Pedido.Shared;
using aspnet_api.src.Application.Produto.Shared;
using aspnet_api.Api.Contracts.Shared;
using DomainFormaPagamento = aspnet_api.src.Domain.Enums.FormaPagamento;
using DomainStatusPedido = aspnet_api.src.Domain.Enums.StatusPedido;
using DomainCarrinho = aspnet_api.Domain.Entities.Carrinho;
using DomainCliente = aspnet_api.Domain.Entities.Cliente;
using DomainPedido = aspnet_api.Domain.Entities.Pedido;
using DomainProduto = aspnet_api.Domain.Entities.Produto;
using Xunit;

namespace aspnet_api.Tests.Application.Shared;

public class CarrinhoResponseMapperTests
{
    public class ToResponse
    {
        [Fact]
        public void DeveMapearCarrinhoParaResponse()
        {
            var items = new List<CarrinhoItem>
            {
                CarrinhoItem.Reconstituir(1, 10, 2.0m, 50.0m)
            };
            var dataCarrinho = DateTime.Now;
            var carrinho = DomainCarrinho.Reconstituir(1, 5, null, dataCarrinho, items);

            var result = carrinho.ToResponse();

            Assert.Equal(1, result.CarrinhoId);
            Assert.Equal(5, result.ClienteId);
            Assert.Equal(dataCarrinho, result.DataCarrinho);
            Assert.Single(result.Items);
            var firstItem = result.Items.First();
            Assert.Equal(1, firstItem.ItemId);
            Assert.Equal(10, firstItem.ProdutoId);
            Assert.Equal(2.0m, firstItem.Quantidade);
            Assert.Equal(50.0m, firstItem.ValorUnitario);
        }

        [Fact]
        public void DeveMapearCarrinhoComListaVazia()
        {
            var carrinho = DomainCarrinho.Reconstituir(1, 5, null, DateTime.Now, new List<CarrinhoItem>());

            var result = carrinho.ToResponse();

            Assert.NotNull(result.Items);
            Assert.Empty(result.Items);
        }

        [Fact]
        public void DeveLancarArgumentNullExceptionQuandoCarrinhoForNulo()
        {
            DomainCarrinho? carrinho = null;
            Assert.Throws<ArgumentNullException>(() => carrinho!.ToResponse());
        }
    }
}

public class ClienteResponseMapperTests
{
    public class ToDetalheResponse
    {
        [Fact]
        public void DeveMapearClienteParaDetalheResponse()
        {
            var endereco = new Endereco("Rua", "123", "Apto", "12345678", "Centro", "Cidade", "SP");
            var celular = new Celular("11", "999999999", true);
            var cliente = DomainCliente.Reconstituir(1, "Teste", "12345678901", new DateTime(1990, 1, 1), endereco, celular, "teste@email.com");

            var result = cliente.ToDetalheResponse();

            Assert.Equal(1, result.ClienteId);
            Assert.Equal("Teste", result.Nome);
            Assert.Equal("12345678901", result.Cpf);
            Assert.Equal(new DateOnly(1990, 1, 1), result.DataNascimento);
            Assert.Equal("teste@email.com", result.Email);
            Assert.NotNull(result.Endereco);
            Assert.Equal("Rua", result.Endereco.Logradouro);
            Assert.NotNull(result.Celular);
            Assert.Equal("11", result.Celular.Ddd);
        }

        [Fact]
        public void DeveMapearClienteComEnderecoNulo()
        {
            var cliente = DomainCliente.Reconstituir(1, "Teste", "12345678901", new DateTime(1990, 1, 1), null, null, "teste@email.com");

            var result = cliente.ToDetalheResponse();

            Assert.NotNull(result.Endereco);
            Assert.Equal(string.Empty, result.Endereco.Logradouro);
        }

        [Fact]
        public void DeveMapearClienteComCelularNulo()
        {
            var cliente = DomainCliente.Reconstituir(1, "Teste", "12345678901", new DateTime(1990, 1, 1), null, null, "teste@email.com");

            var result = cliente.ToDetalheResponse();

            Assert.NotNull(result.Celular);
            Assert.Equal(string.Empty, result.Celular.Ddd);
        }

        [Fact]
        public void DeveLancarArgumentNullExceptionQuandoClienteForNulo()
        {
            DomainCliente? cliente = null;
            Assert.Throws<ArgumentNullException>(() => cliente!.ToDetalheResponse());
        }
    }
}

public class PedidoResponseMapperTests
{
    public class ToResponse
    {
        [Fact]
        public void DeveMapearPedidoParaResponse()
        {
            var endereco = new Endereco("Rua", "123", null, "12345678", "Centro", "Cidade", "SP");
            var items = new List<PedidoItem>
            {
                PedidoItem.Reconstituir(1, 10, 2.0m, 50.0m)
            };
            var pedido = DomainPedido.Reconstituir(1, DateTime.Now, 5, 1, endereco, DomainFormaPagamento.Pix, DomainStatusPedido.Criado, items);

            var result = pedido.ToResponse();

            Assert.Equal(1, result.PedidoId);
            Assert.Equal(5, result.ClienteId);
            Assert.Equal(1, result.CarrinhoId);
            Assert.Equal(FormaPagamento.Pix, result.FormaPagamento);
            Assert.Equal(PedidoStatus.Criado, result.Status);
            Assert.Single(result.Items);
        }

        [Fact]
        public void DeveMapearPedidoComEnderecoNulo()
        {
            var pedido = DomainPedido.Reconstituir(1, DateTime.Now, 5, 1, null, DomainFormaPagamento.Pix, DomainStatusPedido.Criado, new List<PedidoItem>());

            var result = pedido.ToResponse();

            Assert.NotNull(result.EnderecoEntrega);
        }
    }

    public class ToCriadoResponse
    {
        [Fact]
        public void DeveMapearPedidoCriadoParaResponse()
        {
            var items = new List<PedidoItem>
            {
                PedidoItem.Reconstituir(1, 10, 2.0m, 50.0m)
            };
            var pedido = DomainPedido.Reconstituir(1, DateTime.Now, 5, 1, null, DomainFormaPagamento.Cartao, DomainStatusPedido.Criado, items);

            var result = pedido.ToCriadoResponse();

            Assert.Equal(1, result.PedidoId);
            Assert.Equal(5, result.ClienteId);
            Assert.Equal(FormaPagamento.Cartao, result.FormaPagamento);
            Assert.Equal(PedidoStatus.Criado, result.Status);
            Assert.Equal(100.0m, result.ValorTotal);
        }
    }

    public class ToCanceladoResponse
    {
        [Fact]
        public void DeveMapearPedidoCanceladoParaResponse()
        {
            var pedido = DomainPedido.Reconstituir(1, DateTime.Now, 5, 1, null, DomainFormaPagamento.Pix, DomainStatusPedido.Criado, new List<PedidoItem>());
            pedido.Cancelar();

            var result = pedido.ToCanceladoResponse();

            Assert.Equal(1, result.PedidoId);
            Assert.Equal(5, result.ClienteId);
            Assert.Equal(PedidoStatus.Cancelado, result.Status);
        }
    }

    public class EnumMappings
    {
        [Theory]
        [InlineData(DomainFormaPagamento.Pix, FormaPagamento.Pix)]
        [InlineData(DomainFormaPagamento.Cartao, FormaPagamento.Cartao)]
        [InlineData(DomainFormaPagamento.Boleto, FormaPagamento.Boleto)]
        public void DeveMapearFormaPagamentoParaApi(DomainFormaPagamento domain, FormaPagamento expected)
        {
            Assert.Equal(expected, domain.ToApi());
        }

        [Theory]
        [InlineData(FormaPagamento.Pix, DomainFormaPagamento.Pix)]
        [InlineData(FormaPagamento.Cartao, DomainFormaPagamento.Cartao)]
        [InlineData(FormaPagamento.Boleto, DomainFormaPagamento.Boleto)]
        public void DeveMapearFormaPagamentoParaDomain(FormaPagamento api, DomainFormaPagamento expected)
        {
            Assert.Equal(expected, api.ToDomain());
        }

        [Theory]
        [InlineData(DomainStatusPedido.Criado, PedidoStatus.Criado)]
        [InlineData(DomainStatusPedido.EmProcessamento, PedidoStatus.EmProcessamento)]
        [InlineData(DomainStatusPedido.Processado, PedidoStatus.Processado)]
        [InlineData(DomainStatusPedido.Cancelado, PedidoStatus.Cancelado)]
        [InlineData(DomainStatusPedido.Devolvido, PedidoStatus.Devolvido)]
        public void DeveMapearStatusPedidoParaApi(DomainStatusPedido domain, PedidoStatus expected)
        {
            Assert.Equal(expected, domain.ToApi());
        }

        [Theory]
        [InlineData(PedidoStatus.Criado, DomainStatusPedido.Criado)]
        [InlineData(PedidoStatus.EmProcessamento, DomainStatusPedido.EmProcessamento)]
        [InlineData(PedidoStatus.Processado, DomainStatusPedido.Processado)]
        [InlineData(PedidoStatus.Cancelado, DomainStatusPedido.Cancelado)]
        [InlineData(PedidoStatus.Devolvido, DomainStatusPedido.Devolvido)]
        public void DeveMapearStatusPedidoParaDomain(PedidoStatus api, DomainStatusPedido expected)
        {
            Assert.Equal(expected, api.ToDomain());
        }
    }
}

public class ProdutoResponseMapperTests
{
    public class ToCatalogoItemResponse
    {
        [Fact]
        public void DeveMapearProdutoParaCatalogoItemResponse()
        {
            var produto = DomainProduto.Reconstituir(1, "Produto", "Descricao", "Modelo", 99.99m, "foto.jpg", "thumb.jpg");

            var result = produto.ToCatalogoItemResponse(10.0m);

            Assert.Equal(1, result.ProdutoId);
            Assert.Equal("Produto", result.Titulo);
            Assert.Equal(99.99m, result.Preco);
            Assert.Equal(10.0m, result.Estoque);
        }

        [Fact]
        public void DeveLancarArgumentNullExceptionQuandoProdutoForNulo()
        {
            DomainProduto? produto = null;
            Assert.Throws<ArgumentNullException>(() => produto!.ToCatalogoItemResponse(10.0m));
        }
    }

    public class ToDetalheResponse
    {
        [Fact]
        public void DeveMapearProdutoParaDetalheResponse()
        {
            var produto = DomainProduto.Reconstituir(1, "Produto", "Descricao", "Modelo", 99.99m, "foto.jpg", "thumb.jpg");

            var result = produto.ToDetalheResponse(5.0m);

            Assert.Equal(1, result.ProdutoId);
            Assert.Equal("Produto", result.Titulo);
            Assert.Equal(5.0m, result.Estoque);
        }

        [Fact]
        public void DeveLancarArgumentNullExceptionQuandoProdutoForNulo()
        {
            DomainProduto? produto = null;
            Assert.Throws<ArgumentNullException>(() => produto!.ToDetalheResponse(5.0m));
        }
    }
}

