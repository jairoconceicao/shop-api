using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Application.Abstractions.Security;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.Infrastructure.Repositories;
using aspnet_api.Infrastructure.Security;
using aspnet_api.src.Infrastructure.Persistence;

namespace aspnet_api.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IClienteRepository, ClienteRepository>();
        services.AddScoped<IProdutoRepository, ProdutoRepository>();
        services.AddScoped<IEstoqueRepository, EstoqueRepository>();
        services.AddScoped<IMovimentoEstoqueRepository, MovimentoEstoqueRepository>();
        services.AddScoped<ICarrinhoRepository, CarrinhoRepository>();
        services.AddScoped<IPedidoRepository, PedidoRepository>();
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<ISessaoRepository, SessaoRepository>();

        services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();
        services.AddScoped<ISessaoAtualProvider, HttpContextSessaoAtualProvider>();

        return services;
    }
}


