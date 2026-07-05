using aspnet_api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace aspnet_api.Api;

public static class ApiPersistenceServiceCollectionExtensions
{
    public static IServiceCollection AddApiPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("ShopDb")
            ?? throw new InvalidOperationException("Connection string 'ShopDb' was not found.");

        services.AddDbContext<ShopDbContext>(options =>
        {
            options.UseNpgsql(connectionString);
            options.UseQueryTrackingBehavior(QueryTrackingBehavior.TrackAll);
#if DEBUG
            options.EnableSensitiveDataLogging();
            options.EnableDetailedErrors();
#endif
        });

        return services;
    }
}
