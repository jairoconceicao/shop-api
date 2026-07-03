using aspnet_api.Domain.Entities;

namespace aspnet_api.Application.Abstractions.Repositories;

public interface ICarrinhoRepository : IRepository<Carrinho>
{
    Task<Carrinho?> GetByClienteIdAsync(long clienteId, CancellationToken cancellationToken = default);

    Task<Carrinho?> GetLatestAsync(CancellationToken cancellationToken = default);

    Task<Carrinho?> GetByItemIdAsync(long itemId, CancellationToken cancellationToken = default);

    Task<long> GetNextItemIdAsync(CancellationToken cancellationToken = default);
}


