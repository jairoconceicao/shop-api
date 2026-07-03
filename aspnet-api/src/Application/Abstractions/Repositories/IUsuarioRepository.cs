using aspnet_api.Domain.Entities;

namespace aspnet_api.Application.Abstractions.Repositories;

public interface IUsuarioRepository : IRepository<Usuario>
{
    Task<Usuario?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<Usuario?> GetByClienteIdAsync(long clienteId, CancellationToken cancellationToken = default);
}


