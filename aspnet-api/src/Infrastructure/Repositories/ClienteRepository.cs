using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Domain.Entities;
using aspnet_api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace aspnet_api.Infrastructure.Repositories;

public sealed class ClienteRepository : EfRepository<Cliente>, IClienteRepository
{
    public ClienteRepository(ShopDbContext dbContext) : base(dbContext)
    {
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
