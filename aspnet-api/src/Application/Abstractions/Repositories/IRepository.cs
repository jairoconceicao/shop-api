namespace aspnet_api.Application.Abstractions.Repositories;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(long id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<T>> ListAsync(CancellationToken cancellationToken = default);

    Task AddAsync(T entity, CancellationToken cancellationToken = default);

    void Update(T entity);

    Task DeleteAsync(T entity, CancellationToken cancellationToken = default);
}


