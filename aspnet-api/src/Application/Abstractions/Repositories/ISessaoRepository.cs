using aspnet_api.Domain.Entities;

namespace aspnet_api.Application.Abstractions.Repositories;

public interface ISessaoRepository : IRepository<Sessao>
{
    Task<Sessao?> GetByJtiAsync(string jti, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Sessao>> ListByUsuarioIdAsync(long usuarioId, CancellationToken cancellationToken = default);
}


