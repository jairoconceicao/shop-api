using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Entities;
using aspnet_api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace aspnet_api.Infrastructure.Repositories;

public sealed class CategoriaProdutoRepository(ShopDbContext dbContext) : EfRepository<CategoriaProduto>(dbContext), ICategoriaProdutoRepository
{
    public override async Task<IReadOnlyList<CategoriaProduto>> ListAsync(CancellationToken cancellationToken = default) =>
        await Set
            .AsNoTracking()
            .OrderBy(categoria => categoria.Id)
            .ToListAsync(cancellationToken);
}
