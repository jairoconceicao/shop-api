namespace aspnet_api.Infrastructure;

public static class InfrastructureDependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddInfrastructurePersistence();
        services.AddInfrastructureRepositories();
        services.AddInfrastructureSecurity();

        return services;
    }
}
