using aspnet_api.Domain.Entities;

namespace aspnet_api.Application.Abstractions.Repositories;

public interface IClienteRepository : IRepository<Cliente>
{
    Task<Cliente?> GetByCpfAsync(string cpf, CancellationToken cancellationToken = default);

    Task<Cliente?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
}
