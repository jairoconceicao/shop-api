using aspnet_api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace aspnet_api.Tests.Api.Support;

public sealed class TestApiFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName = $"test-db-{Guid.NewGuid():N}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.ConfigureServices(services =>
        {
            var descriptors = services
                .Where(descriptor => descriptor.ServiceType == typeof(DbContextOptions<ShopDbContext>)
                    || descriptor.ServiceType == typeof(ShopDbContext)
                    || descriptor.ServiceType.FullName?.Contains("IDbContextOptionsConfiguration") == true)
                .ToList();

            foreach (var descriptor in descriptors)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<ShopDbContext>(options => options.UseInMemoryDatabase(_databaseName));
        });
    }

    public async Task ResetDatabaseAsync()
    {
        using var scope = Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ShopDbContext>();
        await context.Database.EnsureDeletedAsync();
        await context.Database.EnsureCreatedAsync();
    }

    public async Task ExecuteDbContextAsync(Func<ShopDbContext, Task> action)
    {
        using var scope = Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ShopDbContext>();
        await action(context);
        await context.SaveChangesAsync();
    }
}
