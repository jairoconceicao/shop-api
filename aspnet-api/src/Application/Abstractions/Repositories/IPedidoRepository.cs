using aspnet_api.Domain.Entities;

namespace aspnet_api.Application.Abstractions.Repositories;

public interface IPedidoRepository : IRepository<Pedido>
{
    Task<Pedido?> GetByCarrinhoIdAsync(long carrinhoId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Pedido>> ListByClienteIdAsync(long clienteId, CancellationToken cancellationToken = default);

    Task<long> GetNextItemIdAsync(CancellationToken cancellationToken = default);
}


