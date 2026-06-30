using aspnet_api.Domain.Entities;

namespace aspnet_api.Application.Abstractions.Repositories;

public interface IEstoqueRepository : IRepository<Estoque>
{
    Task<Estoque?> GetByProdutoIdAsync(long produtoId, CancellationToken cancellationToken = default);
}
