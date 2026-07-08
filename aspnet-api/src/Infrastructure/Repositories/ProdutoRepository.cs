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

    public override Task<Produto?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return Set
            .AsNoTracking()
            .Include(produto => produto.CategoriaProduto)
            .FirstOrDefaultAsync(produto => produto.Id == id, cancellationToken);
    }

    public async Task<PagedResult<Produto>> GetPagedAsync(
        int page,
        int size,
        string? searchword = null,
        long? categoriaId = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(page, 1);
        ArgumentOutOfRangeException.ThrowIfLessThan(size, 1);

        var query = Set
            .AsNoTracking()
            .Include(produto => produto.CategoriaProduto)
            .AsQueryable();

        if (categoriaId.HasValue)
        {
            query = query.Where(produto => produto.CategoriaProdutoId == categoriaId.Value);
        }

        if (!string.IsNullOrWhiteSpace(searchword))
        {
            var termo = searchword.Trim().ToLowerInvariant();
            query = query.Where(produto =>
                produto.Titulo.ToLower().Contains(termo) ||
                (produto.Descricao != null && produto.Descricao.ToLower().Contains(termo)) ||
                (produto.Modelo != null && produto.Modelo.ToLower().Contains(termo)));
        }

        query = query.OrderBy(produto => produto.Id);
        var totalItems = await query.LongCountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync(cancellationToken);

        return new PagedResult<Produto>(items, page, size, totalItems);
    }
}
