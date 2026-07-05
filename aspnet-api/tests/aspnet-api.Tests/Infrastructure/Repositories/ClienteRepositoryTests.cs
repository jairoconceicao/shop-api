using aspnet_api.Domain.Entities;
using aspnet_api.Domain.ValueObjects;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace aspnet_api.Tests.Infrastructure.Repositories;

public class ClienteRepositoryTests
{
    [Fact]
    public async Task DeveExecutarOperacoesDeLeituraComFiltros()
    {
        await using var context = CreateContext();
        var repository = new ClienteRepository(context);
        var cliente1 = CreateCliente("Cliente Um", "12345678901", "cliente1@exemplo.com");
        var cliente2 = CreateCliente("Cliente Dois", "98765432100", "cliente2@exemplo.com");

        await repository.AddAsync(cliente1);
        await repository.AddAsync(cliente2);
        await context.SaveChangesAsync();

        var porId = await repository.GetByIdAsync(cliente1.Id);
        var porCpf = await repository.GetByCpfAsync(cliente1.Cpf);
        var porEmail = await repository.GetByEmailAsync(cliente2.Email);
        var listagem = await repository.ListAsync();

        Assert.NotNull(porId);
        Assert.Equal(cliente1.Id, porId!.Id);
        Assert.NotNull(porCpf);
        Assert.Equal(cliente1.Cpf, porCpf!.Cpf);
        Assert.NotNull(porEmail);
        Assert.Equal(cliente2.Email, porEmail!.Email);
        Assert.Equal(2, listagem.Count);
    }

    [Fact]
    public async Task DeveAtualizarEExcluirCliente()
    {
        await using var context = CreateContext();
        var repository = new ClienteRepository(context);
        var cliente = CreateCliente("Cliente Original", "12345678901", "original@exemplo.com");

        await repository.AddAsync(cliente);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        var atualizado = Cliente.Reconstituir(
            cliente.Id,
            "Cliente Atualizado",
            "10987654321",
            DateOnly.FromDateTime(new DateTime(1991, 2, 3)),
            new Endereco("Rua Nova", "123", null, "87654321", "Centro", "Sao Paulo", "SP"),
            new Celular("11", "988888888", false),
            "atualizado@exemplo.com");

        repository.Update(atualizado);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        var persistido = await repository.GetByIdAsync(cliente.Id);

        Assert.NotNull(persistido);
        Assert.Equal("Cliente Atualizado", persistido!.Nome);
        Assert.Equal("10987654321", persistido.Cpf);
        Assert.Equal("atualizado@exemplo.com", persistido.Email);

        await repository.DeleteAsync(persistido);
        await context.SaveChangesAsync();

        Assert.Null(await repository.GetByIdAsync(cliente.Id));
        Assert.Empty(await repository.ListAsync());
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }

    private static Cliente CreateCliente(string nome, string cpf, string email)
    {
        return Cliente.Create(
            nome,
            cpf,
            DateOnly.FromDateTime(DateTime.Today).AddDays(-1),
            new Endereco("Rua Um", "123", "Apto 10", "12345678", "Centro", "Sao Paulo", "SP"),
            new Celular("11", "999999999", true),
            email);
    }
}
