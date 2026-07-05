namespace aspnet_api.Api;

public static class ApiServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        services.AddApiOpenApi();
        services.AddApiSecurity(configuration, environment);
        services.AddApiPersistence(configuration);

        return services;
    }
}
