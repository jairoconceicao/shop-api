using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Entities;
using aspnet_api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace aspnet_api.Infrastructure.Repositories;

public sealed class UsuarioRepository : EfRepository<Usuario>, IUsuarioRepository
{
    public UsuarioRepository(ShopDbContext dbContext) : base(dbContext)
    {
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
