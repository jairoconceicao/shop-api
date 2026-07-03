using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Application.Common;
using aspnet_api.Domain.Entities;
using aspnet_api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace aspnet_api.Infrastructure.Repositories;

public sealed class ProdutoRepository : EfRepository<Produto>, IProdutoRepository
{
    public ProdutoRepository(ShopDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<PagedResult<Produto>> GetPagedAsync(int page, int size, CancellationToken cancellationToken = default)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(page, 1);
        ArgumentOutOfRangeException.ThrowIfLessThan(size, 1);

        var query = Set.AsNoTracking().OrderBy(produto => produto.Id);
        var totalItems = await query.LongCountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        return new PagedResult<Produto>(items, page, size, totalItems);
    }
}


