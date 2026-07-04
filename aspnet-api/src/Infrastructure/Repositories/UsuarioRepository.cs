using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Entities;
using aspnet_api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace aspnet_api.Infrastructure.Repositories;

public sealed class UsuarioRepository : IUsuarioRepository
{
    private readonly ShopDbContext _dbContext;

    public UsuarioRepository(ShopDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    private DbSet<Usuario> Set => _dbContext.Set<Usuario>();

    public async Task<Usuario?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await Set.FindAsync([id], cancellationToken);
    }

    public async Task<IReadOnlyList<Usuario>> ListAsync(CancellationToken cancellationToken = default)
    {
        return await Set.AsNoTracking().ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Usuario entity, CancellationToken cancellationToken = default)
    {
        await Set.AddAsync(entity, cancellationToken);
    }

    public void Update(Usuario entity)
    {
        Set.Update(entity);
    }

    public Task DeleteAsync(Usuario entity, CancellationToken cancellationToken = default)
    {
        Set.Remove(entity);
        return Task.CompletedTask;
    }

    public Task<Usuario?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalized = email.Trim().ToLowerInvariant();
        return Set.FirstOrDefaultAsync(u => u.Email == normalized, cancellationToken);
    }

    public Task<Usuario?> GetByClienteIdAsync(long clienteId, CancellationToken cancellationToken = default)
    {
        return Set.FirstOrDefaultAsync(u => u.ClienteId == clienteId, cancellationToken);
    }
}
