using aspnet_api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace aspnet_api.Infrastructure.Persistence.Configurations;

public class SessaoConfiguration : IEntityTypeConfiguration<Sessao>
{
    public void Configure(EntityTypeBuilder<Sessao> builder)
    {
        builder.ToTable("Sessoes");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).ValueGeneratedOnAdd();
        builder.Property(s => s.UsuarioId).IsRequired();
        builder.Property(s => s.Jti).IsRequired().HasMaxLength(100);
        builder.Property(s => s.CriadaEm).IsRequired();
        builder.Property(s => s.ExpiraEm).IsRequired();
        builder.Property(s => s.RevogadaEm);

        builder.HasIndex(s => s.Jti).IsUnique();
        builder.HasIndex(s => s.UsuarioId);

        builder.HasOne<Usuario>()
            .WithMany()
            .HasForeignKey(s => s.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}


