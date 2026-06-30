using aspnet_api.Application.Common;
using aspnet_api.Domain.Entities;

namespace aspnet_api.Application.Abstractions.Repositories;

public interface IProdutoRepository : IRepository<Produto>
{
    Task<PagedResult<Produto>> GetPagedAsync(int page, int size, CancellationToken cancellationToken = default);
}
