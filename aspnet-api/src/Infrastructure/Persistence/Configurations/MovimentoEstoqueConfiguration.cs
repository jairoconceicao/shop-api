using aspnet_api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace aspnet_api.Infrastructure.Persistence.Configurations;

public class MovimentoEstoqueConfiguration : IEntityTypeConfiguration<MovimentoEstoque>
{
    public void Configure(EntityTypeBuilder<MovimentoEstoque> builder)
    {
        builder.ToTable("MovimentosEstoque");
        builder.HasKey(m => m.Id);
        builder.Property(m => m.DataMovimento).IsRequired();
        builder.Property(m => m.OperacaoCodigo).IsRequired();
        builder.Property(m => m.OperacaoDescricao).HasMaxLength(500);
        builder.Property(m => m.Quantidade).HasColumnType("decimal(18,2)");

        builder.HasOne<Estoque>()
            .WithMany()
            .HasForeignKey(m => m.EstoqueId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
