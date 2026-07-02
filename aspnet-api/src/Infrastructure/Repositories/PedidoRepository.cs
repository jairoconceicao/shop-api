using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Entities;
using aspnet_api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace aspnet_api.Infrastructure.Repositories;

public sealed class PedidoRepository : EfRepository<Pedido>, IPedidoRepository
{
    public PedidoRepository(ShopDbContext dbContext) : base(dbContext)
    {
    }

    public override async Task<Pedido?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await Set
            .Include(pedido => pedido.Items)
            .FirstOrDefaultAsync(pedido => pedido.Id == id, cancellationToken);
    }

    public override async Task<IReadOnlyList<Pedido>> ListAsync(CancellationToken cancellationToken = default)
    {
        return await Set
            .AsNoTracking()
            .Include(pedido => pedido.Items)
            .OrderByDescending(pedido => pedido.DataPedido)
            .ThenByDescending(pedido => pedido.Id)
            .ToListAsync(cancellationToken);
    }

    public Task<Pedido?> GetByCarrinhoIdAsync(long carrinhoId, CancellationToken cancellationToken = default)
    {
        return Set
            .Include(pedido => pedido.Items)
            .FirstOrDefaultAsync(pedido => pedido.CarrinhoId == carrinhoId, cancellationToken);
    }

    public async Task<IReadOnlyList<Pedido>> ListByClienteIdAsync(long clienteId, CancellationToken cancellationToken = default)
    {
        return await Set
            .AsNoTracking()
            .Include(pedido => pedido.Items)
            .Where(pedido => pedido.ClienteId == clienteId)
            .OrderByDescending(pedido => pedido.DataPedido)
            .ThenByDescending(pedido => pedido.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<long> GetNextItemIdAsync(CancellationToken cancellationToken = default)
    {
        var maxItemId = await Set
            .SelectMany(pedido => pedido.Items)
            .Select(item => (long?)item.Id)
            .MaxAsync(cancellationToken);

        return (maxItemId ?? 0) + 1;
    }
}
