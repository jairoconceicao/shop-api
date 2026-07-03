using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Entities;
using aspnet_api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace aspnet_api.Infrastructure.Repositories;

public sealed class EstoqueRepository : EfRepository<Estoque>, IEstoqueRepository
{
    public EstoqueRepository(ShopDbContext dbContext) : base(dbContext)
    {
    }

    public Task<Estoque?> GetByProdutoIdAsync(long produtoId, CancellationToken cancellationToken = default)
    {
        return Set.FirstOrDefaultAsync(estoque => estoque.ProdutoId == produtoId, cancellationToken);
    }
}


