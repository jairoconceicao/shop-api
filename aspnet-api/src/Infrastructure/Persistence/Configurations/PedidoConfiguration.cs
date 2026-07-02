using aspnet_api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace aspnet_api.Infrastructure.Persistence.Configurations;

public class PedidoConfiguration : IEntityTypeConfiguration<Pedido>
{
    public void Configure(EntityTypeBuilder<Pedido> builder)
    {
        builder.ToTable("Pedidos");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.DataPedido).IsRequired();
        builder.Property(p => p.ClienteId).IsRequired();
        builder.Property(p => p.FormaPagamento).HasConversion<string>().IsRequired();
        builder.Property(p => p.Status).HasConversion<string>().IsRequired();

        builder.OwnsOne(p => p.EnderecoEntrega, e =>
        {
            e.Property(p => p.Logradouro).HasColumnName("EnderecoEntrega_Logradouro").HasMaxLength(200);
            e.Property(p => p.Numero).HasColumnName("EnderecoEntrega_Numero").HasMaxLength(50);
            e.Property(p => p.Complemento).HasColumnName("EnderecoEntrega_Complemento").HasMaxLength(200);
            e.Property(p => p.Cep).HasColumnName("EnderecoEntrega_Cep").HasMaxLength(20);
            e.Property(p => p.Bairro).HasColumnName("EnderecoEntrega_Bairro").HasMaxLength(100);
            e.Property(p => p.Cidade).HasColumnName("EnderecoEntrega_Cidade").HasMaxLength(100);
            e.Property(p => p.Uf).HasColumnName("EnderecoEntrega_Uf").HasMaxLength(10);
        });

        builder.OwnsMany(p => p.Items, ib =>
        {
            ib.WithOwner().HasForeignKey("PedidoId");
            ib.Property(item => item.Id).ValueGeneratedNever();
            ib.HasKey(item => item.Id);
            ib.Property(i => i.ProdutoId).IsRequired();
            ib.Property(i => i.Quantidade).HasColumnType("decimal(18,2)");
            ib.Property(i => i.ValorUnitario).HasColumnType("decimal(18,2)");
            ib.ToTable("PedidoItems");
        });
    }
}
