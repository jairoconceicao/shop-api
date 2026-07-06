namespace aspnet_api.src.Ioc;

public static class ApiCorsServiceCollectionExtensions
{
    public const string LocalFrontendPolicyName = "LocalFrontend";

    private static readonly string[] DefaultLocalOrigins =
    [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173"
    ];

    public static IServiceCollection AddApiCors(this IServiceCollection services, IConfiguration configuration)
    {
        var allowedOrigins = configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>()?
            .Where(origin => !string.IsNullOrWhiteSpace(origin))
            .Select(origin => origin.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var origins = allowedOrigins is { Length: > 0 } ? allowedOrigins : DefaultLocalOrigins;

        services.AddCors(options =>
        {
            options.AddPolicy(LocalFrontendPolicyName, policy =>
            {
                policy
                    .WithOrigins(origins)
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        return services;
    }
}
