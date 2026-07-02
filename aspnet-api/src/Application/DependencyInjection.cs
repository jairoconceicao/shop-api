using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.Api.Contracts.Requests.Carrinhos;
using aspnet_api.Api.Contracts.Requests.Pedidos;
using aspnet_api.Api.Contracts.Requests.Produtos;
using aspnet_api.Api.Contracts.Responses.Clientes;
using aspnet_api.Api.Contracts.Responses.Carrinhos;
using aspnet_api.Api.Contracts.Responses.Pedidos;
using aspnet_api.Api.Contracts.Responses.Produtos;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Application.Common;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Carrinho.AdicionarItem;
using aspnet_api.src.Application.Carrinho.AtualizarItem;
using aspnet_api.src.Application.Carrinho.Criar;
using aspnet_api.src.Application.Carrinho.ExcluirItem;
using aspnet_api.src.Application.Carrinho.Obter;
using aspnet_api.src.Application.Cliente.Atualizar;
using aspnet_api.src.Application.Cliente.ConsultarPorCpf;
using aspnet_api.src.Application.Cliente.ConsultarPorId;
using aspnet_api.src.Application.Cliente.Excluir;
using aspnet_api.src.Application.Cliente.Registrar;
using aspnet_api.src.Application.Pedido.Cancelar;
using aspnet_api.src.Application.Pedido.Criar;
using aspnet_api.src.Application.Pedido.Consultar;
using aspnet_api.src.Application.Pedido.ConsultarPorId;
using aspnet_api.src.Application.Produto.CarregarCatalogo;
using aspnet_api.src.Application.Produto.ConsultarPorId;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace aspnet_api.src.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IValidator<CreateClienteRequest>, ClienteRegistrarCommandValidator>();
        services.AddScoped<IValidator<AtualizarClienteCommand>, AtualizarClienteCommandValidator>();
        services.AddScoped<IValidator<ExcluirClienteCommand>, ExcluirClienteCommandValidator>();
        services.AddScoped<IValidator<ConsultarClientePorIdQuery>, ConsultarClientePorIdQueryValidator>();
        services.AddScoped<IValidator<ConsultarClientePorCpfQuery>, ConsultarClientePorCpfQueryValidator>();
        services.AddScoped<IValidator<ProdutosQuery>, CarregarCatalogoProdutosQueryValidator>();
        services.AddScoped<IValidator<ConsultarProdutoPorIdQuery>, ConsultarProdutoPorIdQueryValidator>();
        services.AddScoped<IValidator<CreateCarrinhoRequest>, CarrinhoCriarCommandValidator>();
        services.AddScoped<IValidator<AddCarrinhoItemRequest>, AddCarrinhoItemCommandValidator>();
        services.AddScoped<IValidator<AtualizarCarrinhoItemCommand>, AtualizarCarrinhoItemCommandValidator>();
        services.AddScoped<IValidator<ExcluirCarrinhoItemCommand>, ExcluirCarrinhoItemCommandValidator>();
        services.AddScoped<IValidator<ObterCarrinhoQuery>, ObterCarrinhoQueryValidator>();
        services.AddScoped<IValidator<CreatePedidoRequest>, PedidoCriarCommandValidator>();
        services.AddScoped<IValidator<ConsultarPedidoPorIdQuery>, ConsultarPedidoPorIdQueryValidator>();
        services.AddScoped<IValidator<PedidosQuery>, ConsultarPedidosQueryValidator>();
        services.AddScoped<IValidator<CancelarPedidoCommand>, CancelarPedidoCommandValidator>();

        services.AddScoped<IActionCommand<CreateClienteRequest, Result<ClienteIdResponse>>, ClienteRegistrarCommand>();
        services.AddScoped<IActionCommand<AtualizarClienteCommand, Result<ClienteIdResponse>>, ClienteAtualizarCommand>();
        services.AddScoped<IActionCommand<ExcluirClienteCommand, Result<ClienteIdResponse>>, ClienteExcluirCommand>();
        services.AddScoped<IActionCommand<ConsultarClientePorIdQuery, Result<ClienteDetalheResponse>>, ClienteConsultarPorIdQuery>();
        services.AddScoped<IActionCommand<ConsultarClientePorCpfQuery, Result<ClienteDetalheResponse>>, ClienteConsultarPorCpfQuery>();
        services.AddScoped<IActionCommand<ProdutosQuery, Result<PagedResult<ProdutoCatalogoItemResponse>>>, ProdutoCarregarCatalogoQuery>();
        services.AddScoped<IActionCommand<ConsultarProdutoPorIdQuery, Result<ProdutoDetalheResponse>>, ProdutoConsultarPorIdQuery>();
        services.AddScoped<IActionCommand<CreateCarrinhoRequest, Result<CarrinhoCriadoResponse>>, CarrinhoCriarCommand>();
        services.AddScoped<IActionCommand<AddCarrinhoItemRequest, Result<AddCarrinhoItemResponse>>, CarrinhoAdicionarItemCommand>();
        services.AddScoped<IActionCommand<AtualizarCarrinhoItemCommand, Result<CarrinhoItemIdResponse>>, CarrinhoAtualizarItemCommand>();
        services.AddScoped<IActionCommand<ExcluirCarrinhoItemCommand, Result<CarrinhoItemIdResponse>>, CarrinhoExcluirItemCommand>();
        services.AddScoped<IActionCommand<ObterCarrinhoQuery, Result<CarrinhoResponse>>, CarrinhoObterQuery>();
        services.AddScoped<IActionCommand<CreatePedidoRequest, Result<PedidoCriadoResponse>>, PedidoCriarCommand>();
        services.AddScoped<IActionCommand<ConsultarPedidoPorIdQuery, Result<PedidoResponse>>, PedidoConsultarPorIdQuery>();
        services.AddScoped<IActionCommand<PedidosQuery, Result<PagedResult<PedidoResponse>>>, PedidoConsultarQuery>();
        services.AddScoped<IActionCommand<CancelarPedidoCommand, Result<PedidoCanceladoResponse>>, PedidoCancelarCommand>();

        return services;
    }
}
