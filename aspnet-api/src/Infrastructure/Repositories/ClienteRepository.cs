using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Entities;
using aspnet_api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace aspnet_api.Infrastructure.Repositories;

public sealed class ClienteRepository : IClienteRepository
{
    private readonly ShopDbContext _dbContext;

    public ClienteRepository(ShopDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    private DbSet<Cliente> Set => _dbContext.Set<Cliente>();

    public async Task<Cliente?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await Set.FindAsync([id], cancellationToken);
    }

    public async Task<IReadOnlyList<Cliente>> ListAsync(CancellationToken cancellationToken = default)
    {
        return await Set.AsNoTracking().ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Cliente entity, CancellationToken cancellationToken = default)
    {
        await _dbContext.Clientes.AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync();
    }

    public void Update(Cliente entity)
    {
        Set.Update(entity);
    }

    public Task DeleteAsync(Cliente entity, CancellationToken cancellationToken = default)
    {
        Set.Remove(entity);
        return Task.CompletedTask;
    }

    public Task<Cliente?> GetByCpfAsync(string cpf, CancellationToken cancellationToken = default)
    {
        return Set.FirstOrDefaultAsync(cliente => cliente.Cpf == cpf, cancellationToken);
    }

    public Task<Cliente?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return Set.FirstOrDefaultAsync(cliente => cliente.Email == email, cancellationToken);
    }
}
