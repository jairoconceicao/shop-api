using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Infrastructure.Repositories;

namespace aspnet_api.Infrastructure;

public static class InfrastructureRepositoryServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureRepositories(this IServiceCollection services)
    {
        services.AddScoped<IClienteRepository, ClienteRepository>();
        services.AddScoped<IProdutoRepository, ProdutoRepository>();
        services.AddScoped<IEstoqueRepository, EstoqueRepository>();
        services.AddScoped<IMovimentoEstoqueRepository, MovimentoEstoqueRepository>();
        services.AddScoped<ICarrinhoRepository, CarrinhoRepository>();
        services.AddScoped<IPedidoRepository, PedidoRepository>();
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<ISessaoRepository, SessaoRepository>();

        return services;
    }
}
