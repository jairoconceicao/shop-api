using aspnet_api.Domain.Entities;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace aspnet_api.Tests.Infrastructure.Repositories;

public class UsuarioRepositoryTests
{
    [Fact]
    public async Task DeveExecutarOperacoesDeLeituraComFiltros()
    {
        await using var context = CreateContext();
        var repository = new UsuarioRepository(context);
        var usuario1 = CreateUsuario(10, "cliente1@exemplo.com", "HASH::1");
        var usuario2 = CreateUsuario(20, "cliente2@exemplo.com", "HASH::2");

        await repository.AddAsync(usuario1);
        await repository.AddAsync(usuario2);
        await context.SaveChangesAsync();

        var porId = await repository.GetByIdAsync(usuario1.Id);
        var porEmail = await repository.GetByEmailAsync("CLIENTE1@EXEMPLO.COM");
        var porClienteId = await repository.GetByClienteIdAsync(usuario2.ClienteId);
        var listagem = await repository.ListAsync();

        Assert.NotNull(porId);
        Assert.Equal(usuario1.Id, porId!.Id);
        Assert.NotNull(porEmail);
        Assert.Equal(usuario1.Email, porEmail!.Email);
        Assert.NotNull(porClienteId);
        Assert.Equal(usuario2.ClienteId, porClienteId!.ClienteId);
        Assert.Equal(2, listagem.Count);
    }

    [Fact]
    public async Task DeveAtualizarEExcluirUsuario()
    {
        await using var context = CreateContext();
        var repository = new UsuarioRepository(context);
        var usuario = CreateUsuario(10, "original@exemplo.com", "HASH::original");

        await repository.AddAsync(usuario);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        var atualizado = Usuario.Reconstituir(
            usuario.Id,
            usuario.ClienteId,
            "atualizado@exemplo.com",
            "HASH::atualizado",
            usuario.CriadoEm,
            DateTime.Now);

        repository.Update(atualizado);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        var persistido = await repository.GetByIdAsync(usuario.Id);

        Assert.NotNull(persistido);
        Assert.Equal("atualizado@exemplo.com", persistido!.Email);
        Assert.Equal("HASH::atualizado", persistido.SenhaHash);
        Assert.Equal(usuario.ClienteId, persistido.ClienteId);

        await repository.DeleteAsync(persistido);
        await context.SaveChangesAsync();

        Assert.Null(await repository.GetByIdAsync(usuario.Id));
        Assert.Empty(await repository.ListAsync());
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }

    private static Usuario CreateUsuario(long clienteId, string email, string senhaHash)
    {
        return Usuario.Create(clienteId, email, senhaHash);
    }
}
