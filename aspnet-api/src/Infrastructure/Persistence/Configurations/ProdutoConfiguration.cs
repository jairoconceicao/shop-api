using aspnet_api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace aspnet_api.Infrastructure.Persistence.Configurations;

public class ProdutoConfiguration : IEntityTypeConfiguration<Produto>
{
    public void Configure(EntityTypeBuilder<Produto> builder)
    {
        builder.ToTable("Produtos");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).ValueGeneratedOnAdd();
        builder.Property(p => p.Titulo).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Descricao).HasMaxLength(2000);
        builder.Property(p => p.Modelo).HasMaxLength(200);
        builder.Property(p => p.Preco).HasColumnType("decimal(18,2)");
        builder.Property(p => p.Foto).HasMaxLength(2000);
        builder.Property(p => p.Thumb).HasMaxLength(2000);
    }
}
