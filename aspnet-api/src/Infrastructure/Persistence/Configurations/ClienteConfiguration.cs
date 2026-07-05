using aspnet_api.Domain.Entities;
using aspnet_api.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace aspnet_api.Infrastructure.Persistence.Configurations;

public class ClienteConfiguration : IEntityTypeConfiguration<Cliente>
{
    public void Configure(EntityTypeBuilder<Cliente> builder)
    {
        builder.ToTable("Clientes");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).ValueGeneratedOnAdd();
        builder.Property(c => c.Id).HasConversion<long>();
        builder.Property(c => c.Nome).IsRequired().HasMaxLength(200);
        builder.Property(c => c.Cpf).IsRequired().HasMaxLength(11);
        builder.Property(c => c.Email).HasMaxLength(200);
        builder.Property(c => c.DataNascimento).IsRequired().HasColumnType("date");

        builder.OwnsOne(c => c.Endereco, e =>
        {
            e.Property(p => p.Logradouro).HasColumnName("Logradouro").HasMaxLength(200);
            e.Property(p => p.Numero).HasColumnName("Numero").HasMaxLength(50);
            e.Property(p => p.Complemento).HasColumnName("Complemento").HasMaxLength(200);
            e.Property(p => p.Cep).HasColumnName("Cep").HasMaxLength(20);
            e.Property(p => p.Bairro).HasColumnName("Bairro").HasMaxLength(100);
            e.Property(p => p.Cidade).HasColumnName("Cidade").HasMaxLength(100);
            e.Property(p => p.Uf).HasColumnName("Uf").HasMaxLength(10);
        });

        builder.OwnsOne(c => c.Celular, ce =>
        {
            ce.Property(p => p.Ddd).HasColumnName("CelularDdd").HasMaxLength(10);
            ce.Property(p => p.Numero).HasColumnName("CelularNumero").HasMaxLength(30);
            ce.Property(p => p.WhatsApp).HasColumnName("CelularWhatsApp");
        });
    }
}

