using aspnet_api.Api.Contracts.Responses.Auth;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Application.Abstractions.Security;
using aspnet_api.Domain.Entities;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.Infrastructure.Repositories;
using aspnet_api.src.Infrastructure.Persistence;
using aspnet_api.src.Application.Auth.Encerrar;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace aspnet_api.Tests.Application.Auth.Encerrar;

public class EncerrarSessaoCommandTests
{
    public class Handle : EncerrarSessaoCommandTests
    {
        [Fact]
        public async Task DeveRevogarSessaoQuandoJtiForValido()
        {
            await using var context = CreateContext();
            var sessao = SeedSessao(context);
            var command = CreateSut(context, sessao.Jti);

            var result = await command.Handle(new EncerrarSessaoCommandInput());

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.Equal(sessao.Jti, result.Data!.Jti);
        }
    }

    private static EncerrarSessaoCommand CreateSut(ShopDbContext context, string? jti)
    {
        ISessaoAtualProvider provider = new FakeSessaoAtualProvider(jti);
        ISessaoRepository sessaoRepository = new SessaoRepository(context);
        IUnitOfWork unitOfWork = new UnitOfWork(context);
        return new EncerrarSessaoCommand(provider, sessaoRepository, unitOfWork);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }

    private static Sessao SeedSessao(ShopDbContext context)
    {
        var sessao = Sessao.Create(1, Guid.NewGuid().ToString("N"), DateTime.Now.AddHours(1)).Data!;
        context.Sessoes.Add(sessao);
        context.SaveChanges();
        return sessao;
    }

    private sealed class FakeSessaoAtualProvider : ISessaoAtualProvider
    {
        public FakeSessaoAtualProvider(string? jti)
        {
            Jti = jti;
        }

        public string? Jti { get; }

        public long? UsuarioId => 1;

        public long? ClienteId => 1;
    }
}
