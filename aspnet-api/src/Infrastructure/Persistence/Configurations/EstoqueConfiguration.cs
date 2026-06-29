using aspnet_api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace aspnet_api.Infrastructure.Persistence.Configurations;

public class EstoqueConfiguration : IEntityTypeConfiguration<Estoque>
{
    public void Configure(EntityTypeBuilder<Estoque> builder)
    {
        builder.ToTable("Estoques");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Descricao).HasMaxLength(500);
        builder.Property(e => e.DataMovimento).IsRequired();
        builder.Property(e => e.QuantidadeMinima).HasColumnType("decimal(18,2)");
        builder.Property(e => e.QuantidadeMaxima).HasColumnType("decimal(18,2)");
        builder.Property(e => e.QuantidadeAtual).HasColumnType("decimal(18,2)");
    }
}
