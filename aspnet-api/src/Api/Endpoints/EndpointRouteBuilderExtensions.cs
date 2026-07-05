using Microsoft.AspNetCore.Routing;
using aspnet_api.Api.Endpoints.Auth;
using aspnet_api.Api.Endpoints.Carrinhos;
using aspnet_api.Api.Endpoints.Clientes;
using aspnet_api.Api.Endpoints.Pedidos;
using aspnet_api.Api.Endpoints.Produtos;

namespace aspnet_api.Api.Endpoints;

public static class EndpointRouteBuilderExtensions
{
    public static IEndpointRouteBuilder MapEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapAuthEndpoints();
        app.MapClienteEndpoints();
        app.MapProdutoEndpoints();
        app.MapCarrinhoEndpoints();
        app.MapPedidoEndpoints();

        return app;
    }
}
