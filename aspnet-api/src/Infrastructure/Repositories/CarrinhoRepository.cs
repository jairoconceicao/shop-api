using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Entities;
using aspnet_api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace aspnet_api.Infrastructure.Repositories;

public sealed class CarrinhoRepository(ShopDbContext dbContext) : EfRepository<Carrinho>(dbContext), ICarrinhoRepository
{

    public override async Task<Carrinho?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await Set
            .Include(carrinho => carrinho.Items)
            .FirstOrDefaultAsync(carrinho => carrinho.Id == id, cancellationToken);
    }

    public override async Task<IReadOnlyList<Carrinho>> ListAsync(CancellationToken cancellationToken = default)
    {
        return await Set
            .AsNoTracking()
            .Include(carrinho => carrinho.Items)
            .OrderByDescending(carrinho => carrinho.DataCarrinho)
            .ThenByDescending(carrinho => carrinho.Id)
            .ToListAsync(cancellationToken);
    }

    public Task<Carrinho?> GetByClienteIdAsync(long clienteId, CancellationToken cancellationToken = default)
    {
        return Set
            .Include(carrinho => carrinho.Items)
            .OrderByDescending(carrinho => carrinho.DataCarrinho)
            .ThenByDescending(carrinho => carrinho.Id)
            .FirstOrDefaultAsync(carrinho => carrinho.ClienteId == clienteId, cancellationToken);
    }

    public Task<Carrinho?> GetLatestAsync(CancellationToken cancellationToken = default)
    {
        return Set
            .Include(carrinho => carrinho.Items)
            .OrderByDescending(carrinho => carrinho.DataCarrinho)
            .ThenByDescending(carrinho => carrinho.Id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public Task<Carrinho?> GetByItemIdAsync(long itemId, CancellationToken cancellationToken = default)
    {
        return Set
            .Include(carrinho => carrinho.Items)
            .FirstOrDefaultAsync(carrinho => carrinho.Items.Any(item => item.Id == itemId), cancellationToken);
    }

    public async Task<long> GetNextItemIdAsync(CancellationToken cancellationToken = default)
    {
        var maxItemId = await Set
            .SelectMany(carrinho => carrinho.Items)
            .Select(item => (long?)item.Id)
            .MaxAsync(cancellationToken);

        return (maxItemId ?? 0) + 1;
    }
}


