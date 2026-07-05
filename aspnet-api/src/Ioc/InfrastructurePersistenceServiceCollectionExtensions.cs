using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.src.Infrastructure.Persistence;

namespace aspnet_api.src.Ioc;

public static class InfrastructurePersistenceServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructurePersistence(this IServiceCollection services)
    {
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        return services;
    }
}
