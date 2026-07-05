namespace aspnet_api.Application.Abstractions.Persistence;

public interface IUnitOfWork : IDisposable
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}


