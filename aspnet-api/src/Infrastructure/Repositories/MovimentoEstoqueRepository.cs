using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Entities;
using aspnet_api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace aspnet_api.Infrastructure.Repositories;

public sealed class MovimentoEstoqueRepository : EfRepository<MovimentoEstoque>, IMovimentoEstoqueRepository
{
    public MovimentoEstoqueRepository(ShopDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<IReadOnlyList<MovimentoEstoque>> ListByEstoqueIdAsync(long estoqueId, CancellationToken cancellationToken = default)
    {
        return await Set
            .AsNoTracking()
            .Where(movimento => movimento.EstoqueId == estoqueId)
            .OrderBy(movimento => movimento.DataMovimento)
            .ThenBy(movimento => movimento.Id)
            .ToListAsync(cancellationToken);
    }
}


