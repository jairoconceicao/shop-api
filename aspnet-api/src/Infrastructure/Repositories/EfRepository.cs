using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace aspnet_api.Infrastructure.Repositories;

public abstract class EfRepository<T> : IRepository<T> where T : class
{
    protected EfRepository(ShopDbContext dbContext)
    {
        DbContext = dbContext;
    }

    protected ShopDbContext DbContext { get; }

    protected DbSet<T> Set => DbContext.Set<T>();

    public virtual async Task<T?> GetByIdAsync(long id, CancellationToken cancellationToken = default) =>
        await Set.FindAsync([id], cancellationToken);

    public virtual async Task<IReadOnlyList<T>> ListAsync(CancellationToken cancellationToken = default) =>
        await Set.AsNoTracking().ToListAsync(cancellationToken);

    public virtual async Task AddAsync(T entity, CancellationToken cancellationToken = default) =>
        await Set.AddAsync(entity, cancellationToken);

    public virtual void Update(T entity) => Set.Update(entity);

    public virtual Task DeleteAsync(T entity, CancellationToken cancellationToken = default)
    {
        Set.Remove(entity);
        return Task.CompletedTask;
    }
}


