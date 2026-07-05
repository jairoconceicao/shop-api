using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Infrastructure.Persistence;

namespace aspnet_api.src.Infrastructure.Persistence;

public class UnitOfWork(ShopDbContext context) : IUnitOfWork
{
    private readonly ShopDbContext _context = context;
    private bool _disposed;

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed && disposing)
        {
            _context.Dispose();
        }
        _disposed = true;
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }
}
