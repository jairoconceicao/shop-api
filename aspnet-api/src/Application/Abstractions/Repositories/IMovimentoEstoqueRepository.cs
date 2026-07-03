using aspnet_api.Domain.Entities;

namespace aspnet_api.Application.Abstractions.Repositories;

public interface IMovimentoEstoqueRepository : IRepository<MovimentoEstoque>
{
    Task<IReadOnlyList<MovimentoEstoque>> ListByEstoqueIdAsync(long estoqueId, CancellationToken cancellationToken = default);
}


