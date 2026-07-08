using aspnet_api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace aspnet_api.Infrastructure.Persistence.Configurations;

public class CategoriaProdutoConfiguration : IEntityTypeConfiguration<CategoriaProduto>
{
    public void Configure(EntityTypeBuilder<CategoriaProduto> builder)
    {
        builder.ToTable("CategoriasProdutos");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).ValueGeneratedOnAdd();
        builder.Property(c => c.Titulo).IsRequired().HasMaxLength(200);
        builder.Property(c => c.Descricao).HasMaxLength(2000);

        builder.HasMany(c => c.Produtos)
            .WithOne(p => p.CategoriaProduto)
            .HasForeignKey(p => p.CategoriaProdutoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
