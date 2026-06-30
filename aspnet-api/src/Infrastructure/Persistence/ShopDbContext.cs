using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Domain.Entities;
using aspnet_api.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;

namespace aspnet_api.Infrastructure.Persistence;

public class ShopDbContext : DbContext, IUnitOfWork
{
    public ShopDbContext(DbContextOptions<ShopDbContext> options) : base(options)
    {
    }

    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Produto> Produtos => Set<Produto>();
    public DbSet<Estoque> Estoques => Set<Estoque>();
    public DbSet<MovimentoEstoque> MovimentosEstoque => Set<MovimentoEstoque>();
    public DbSet<Carrinho> Carrinhos => Set<Carrinho>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new ClienteConfiguration());
        modelBuilder.ApplyConfiguration(new ProdutoConfiguration());
        modelBuilder.ApplyConfiguration(new EstoqueConfiguration());
        modelBuilder.ApplyConfiguration(new MovimentoEstoqueConfiguration());
        modelBuilder.ApplyConfiguration(new CarrinhoConfiguration());
        modelBuilder.ApplyConfiguration(new PedidoConfiguration());

        base.OnModelCreating(modelBuilder);
    }
}
