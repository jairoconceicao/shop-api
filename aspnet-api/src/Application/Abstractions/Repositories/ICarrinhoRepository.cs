using aspnet_api.Domain.Entities;

namespace aspnet_api.Application.Abstractions.Repositories;

public interface ICarrinhoRepository : IRepository<Carrinho>
{
    Task<Carrinho?> GetByClienteIdAsync(long clienteId, CancellationToken cancellationToken = default);
}
