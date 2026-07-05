using aspnet_api.Application.Abstractions.Security;
using aspnet_api.Infrastructure.Security;

namespace aspnet_api.Infrastructure;

public static class InfrastructureSecurityServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureSecurity(this IServiceCollection services)
    {
        services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();
        services.AddScoped<ISessaoAtualProvider, HttpContextSessaoAtualProvider>();

        return services;
    }
}
