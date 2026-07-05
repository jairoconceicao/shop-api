namespace aspnet_api.src.Ioc;

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
