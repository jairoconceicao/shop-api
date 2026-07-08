using aspnet_api.Api.Contracts.Requests.Auth;
using aspnet_api.Api.Contracts.Responses.Auth;
using aspnet_api.Application.Abstractions.Persistence;
using aspnet_api.Application.Abstractions.Repositories;
using aspnet_api.Application.Abstractions.Security;
using aspnet_api.Domain.Entities;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.Infrastructure.Repositories;
using aspnet_api.src.Infrastructure.Persistence;
using aspnet_api.src.Application.Auth.Autenticar;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace aspnet_api.Tests.Application.Auth.Autenticar;

public class AutenticarCommandTests
{
    public class Handle : AutenticarCommandTests
    {
        [Fact]
        public async Task DeveAutenticarERetornarTokenQuandoCredenciaisForemValidas()
        {
            await using var context = CreateContext();
            SeedUsuario(context, email: "cliente@exemplo.com", senha: "SenhaValida123");
            var command = CreateSut(context);

            var result = await command.Handle(new LoginRequest
            {
                Email = "cliente@exemplo.com",
                Senha = "SenhaValida123"
            });

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Data);
            Assert.False(string.IsNullOrWhiteSpace(result.Data!.Token));
            Assert.Equal("Bearer", result.Data.Tipo);
            Assert.Equal(1, await context.Sessoes.CountAsync());
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoEmailNaoExistir()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);

            var result = await command.Handle(new LoginRequest
            {
                Email = "inexistente@exemplo.com",
                Senha = "SenhaValida123"
            });

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "AUTH_CREDENCIAIS_INVALIDAS");
            Assert.Empty(context.Sessoes);
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoSenhaForIncorreta()
        {
            await using var context = CreateContext();
            SeedUsuario(context, email: "cliente@exemplo.com", senha: "SenhaCorreta");
            var command = CreateSut(context);

            var result = await command.Handle(new LoginRequest
            {
                Email = "cliente@exemplo.com",
                Senha = "SenhaErrada"
            });

            Assert.True(result.IsFailure);
            Assert.Contains(result.Notifications, n => n.Code == "AUTH_CREDENCIAIS_INVALIDAS");
            Assert.Empty(context.Sessoes);
        }

        [Fact]
        public async Task DeveRetornarFalhaQuandoRequestForInvalido()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);

            var result = await command.Handle(new LoginRequest
            {
                Email = "invalido",
                Senha = "short"
            });

            Assert.True(result.IsFailure);
            Assert.Empty(context.Sessoes);
        }

        [Fact]
        public async Task DeveLancarArgumentNullExceptionQuandoCommandForNulo()
        {
            await using var context = CreateContext();
            var command = CreateSut(context);

            await Assert.ThrowsAsync<ArgumentNullException>(() => command.Handle(null!));
        }

        [Fact]
        public async Task DeveRegistrarSessaoVinculadaAoUsuario()
        {
            await using var context = CreateContext();
            var usuarioId = SeedUsuario(context, email: "cliente@exemplo.com", senha: "SenhaValida123");
            var command = CreateSut(context);

            await command.Handle(new LoginRequest
            {
                Email = "cliente@exemplo.com",
                Senha = "SenhaValida123"
            });

            var sessao = await context.Sessoes.SingleAsync();
            Assert.Equal(usuarioId, sessao.UsuarioId);
            Assert.False(string.IsNullOrWhiteSpace(sessao.Jti));
            Assert.Null(sessao.RevogadaEm);
            Assert.True(sessao.ExpiraEm > DateTime.Now);
        }
    }

    private static AutenticarCommand CreateSut(ShopDbContext context)
    {
        IValidator<LoginRequest> validator = new AutenticarCommandValidator();
        IUsuarioRepository usuarioRepository = new UsuarioRepository(context);
        ISessaoRepository sessaoRepository = new SessaoRepository(context);
        IPasswordHasher passwordHasher = new FakePasswordHasher();
        IJwtTokenService jwtTokenService = new FakeJwtTokenService();
        IUnitOfWork unitOfWork = new UnitOfWork(context);

        return new AutenticarCommand(validator, usuarioRepository, sessaoRepository, passwordHasher, jwtTokenService, unitOfWork);
    }

    private static ShopDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ShopDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ShopDbContext(options);
    }

    private static long SeedUsuario(ShopDbContext context, string email, string senha)
    {
        var usuario = Usuario.Create(99, email, $"HASH::{senha}");
        context.Usuarios.Add(usuario);
        context.SaveChanges();
        return usuario.Id;
    }

    private sealed class FakePasswordHasher : IPasswordHasher
    {
        public string Hash(string password) => $"HASH::{password}";

        public bool Verify(string password, string hash) => hash == $"HASH::{password}";
    }

    private sealed class FakeJwtTokenService : IJwtTokenService
    {
        public JwtToken Gerar(JwtDescriptor descriptor, TimeSpan duracao)
        {
            var jti = Guid.NewGuid().ToString("N");
            var expiraEm = DateTime.Now.Add(duracao);
            var token = $"TOKEN.{descriptor.UsuarioId}.{descriptor.ClienteId}.{descriptor.Email}.{jti}";
            return new JwtToken(token, jti, expiraEm);
        }
    }
}
