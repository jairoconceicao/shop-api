using aspnet_api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace aspnet_api.Infrastructure.Persistence.Configurations;

public class CarrinhoConfiguration : IEntityTypeConfiguration<Carrinho>
{
    public void Configure(EntityTypeBuilder<Carrinho> builder)
    {
        builder.ToTable("Carrinhos");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).ValueGeneratedOnAdd();
        builder.Property(c => c.ClienteId).IsRequired();
        builder.Property(c => c.DataCarrinho).IsRequired();

        builder.OwnsOne(c => c.EnderecoEntrega, e =>
        {
            e.Property(p => p.Logradouro).HasColumnName("EnderecoEntrega_Logradouro").HasMaxLength(200);
            e.Property(p => p.Numero).HasColumnName("EnderecoEntrega_Numero").HasMaxLength(50);
            e.Property(p => p.Complemento).HasColumnName("EnderecoEntrega_Complemento").HasMaxLength(200);
            e.Property(p => p.Cep).HasColumnName("EnderecoEntrega_Cep").HasMaxLength(20);
            e.Property(p => p.Bairro).HasColumnName("EnderecoEntrega_Bairro").HasMaxLength(100);
            e.Property(p => p.Cidade).HasColumnName("EnderecoEntrega_Cidade").HasMaxLength(100);
            e.Property(p => p.Uf).HasColumnName("EnderecoEntrega_Uf").HasMaxLength(10);
        });

        builder.OwnsMany(c => c.Items, ib =>
        {
            ib.WithOwner().HasForeignKey("CarrinhoId");
            ib.Property(item => item.Id).ValueGeneratedNever();
            ib.HasKey(item => item.Id);
            ib.Property(item => item.ProdutoId).IsRequired();
            ib.Property(item => item.Quantidade).HasColumnType("decimal(18,2)");
            ib.Property(item => item.ValorUnitario).HasColumnType("decimal(18,2)");
            ib.ToTable("CarrinhoItems");
        });
    }
}


