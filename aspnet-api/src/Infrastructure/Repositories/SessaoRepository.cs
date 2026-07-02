using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Entities;
using aspnet_api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace aspnet_api.Infrastructure.Repositories;

public sealed class SessaoRepository : EfRepository<Sessao>, ISessaoRepository
{
    public SessaoRepository(ShopDbContext dbContext) : base(dbContext)
    {
    }

    public Task<Sessao?> GetByJtiAsync(string jti, CancellationToken cancellationToken = default)
    {
        return Set.FirstOrDefaultAsync(s => s.Jti == jti, cancellationToken);
    }

    public async Task<IReadOnlyList<Sessao>> ListByUsuarioIdAsync(long usuarioId, CancellationToken cancellationToken = default)
    {
        return await Set.AsNoTracking()
            .Where(s => s.UsuarioId == usuarioId)
            .ToListAsync(cancellationToken);
    }
}
