using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.Api.Contracts.Requests.Shared;
using aspnet_api.src.Application.Cliente.Shared;
using Xunit;

namespace aspnet_api.Tests.Application.Cliente.Shared;

public class ClienteUpsertRequestValidatorTests
{
    public class EnderecoRequestValidatorTests
    {
        private readonly EnderecoRequestValidator _validator = new();

        [Fact]
        public void DeveAceitarEnderecoValido()
        {
            var result = _validator.Validate(CreateValidEndereco());

            Assert.True(result.IsValid);
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRejeitarLogradouroVazio(string logradouro)
        {
            var result = _validator.Validate(CreateValidEndereco() with { Logradouro = logradouro });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage == "Logradouro e obrigatorio.");
        }

        [Fact]
        public void DeveRejeitarLogradouroComMaisDe200Caracteres()
        {
            var result = _validator.Validate(CreateValidEndereco() with { Logradouro = new string('A', 201) });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage == "Logradouro deve ter no maximo 200 caracteres.");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRejeitarNumeroVazio(string numero)
        {
            var result = _validator.Validate(CreateValidEndereco() with { Numero = numero });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage == "Numero e obrigatorio.");
        }

        [Fact]
        public void DeveRejeitarNumeroComMaisDe50Caracteres()
        {
            var result = _validator.Validate(CreateValidEndereco() with { Numero = new string('1', 51) });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage == "Numero deve ter no maximo 50 caracteres.");
        }

        [Fact]
        public void DeveAceitarComplementoNulo()
        {
            var result = _validator.Validate(CreateValidEndereco() with { Complemento = null });

            Assert.True(result.IsValid);
        }

        [Fact]
        public void DeveRejeitarComplementoComMaisDe200Caracteres()
        {
            var result = _validator.Validate(CreateValidEndereco() with { Complemento = new string('A', 201) });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage == "Complemento deve ter no maximo 200 caracteres.");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRejeitarCepVazio(string cep)
        {
            var result = _validator.Validate(CreateValidEndereco() with { Cep = cep });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage == "CEP e obrigatorio.");
        }

        [Fact]
        public void DeveRejeitarCepComMaisDe20Caracteres()
        {
            var result = _validator.Validate(CreateValidEndereco() with { Cep = new string('1', 21) });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage == "CEP deve ter no maximo 20 caracteres.");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRejeitarBairroVazio(string bairro)
        {
            var result = _validator.Validate(CreateValidEndereco() with { Bairro = bairro });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage == "Bairro e obrigatorio.");
        }

        [Fact]
        public void DeveRejeitarBairroComMaisDe100Caracteres()
        {
            var result = _validator.Validate(CreateValidEndereco() with { Bairro = new string('A', 101) });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage == "Bairro deve ter no maximo 100 caracteres.");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRejeitarCidadeVazia(string cidade)
        {
            var result = _validator.Validate(CreateValidEndereco() with { Cidade = cidade });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage == "Cidade e obrigatoria.");
        }

        [Fact]
        public void DeveRejeitarCidadeComMaisDe100Caracteres()
        {
            var result = _validator.Validate(CreateValidEndereco() with { Cidade = new string('A', 101) });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage == "Cidade deve ter no maximo 100 caracteres.");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRejeitarUfVazia(string uf)
        {
            var result = _validator.Validate(CreateValidEndereco() with { Uf = uf });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage == "UF e obrigatoria.");
        }

        [Theory]
        [InlineData("S")]
        [InlineData("SPA")]
        public void DeveRejeitarUfComTamanhoDiferenteDe2(string uf)
        {
            var result = _validator.Validate(CreateValidEndereco() with { Uf = uf });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage == "UF deve ter 2 caracteres.");
        }

        private static EnderecoRequest CreateValidEndereco()
        {
            return new EnderecoRequest
            {
                Logradouro = "Rua Teste",
                Numero = "123",
                Complemento = "Apto 10",
                Cep = "12345678",
                Bairro = "Centro",
                Cidade = "Sao Paulo",
                Uf = "SP"
            };
        }
    }

    public class CelularRequestValidatorTests
    {
        private readonly CelularRequestValidator _validator = new();

        [Fact]
        public void DeveAceitarCelularValido()
        {
            var result = _validator.Validate(CreateValidCelular());

            Assert.True(result.IsValid);
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRejeitarDddVazio(string ddd)
        {
            var result = _validator.Validate(CreateValidCelular() with { Ddd = ddd });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage == "DDD e obrigatorio.");
        }

        [Theory]
        [InlineData("1")]
        [InlineData("123")]
        [InlineData("1A")]
        [InlineData("AB")]
        public void DeveRejeitarDddComFormatoInvalido(string ddd)
        {
            var result = _validator.Validate(CreateValidCelular() with { Ddd = ddd });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage == "DDD deve conter 2 digitos numericos.");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRejeitarNumeroVazio(string numero)
        {
            var result = _validator.Validate(CreateValidCelular() with { Numero = numero });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage == "Numero de celular e obrigatorio.");
        }

        [Fact]
        public void DeveRejeitarNumeroComMaisDe30Caracteres()
        {
            var result = _validator.Validate(CreateValidCelular() with { Numero = new string('9', 31) });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage == "Numero de celular deve ter no maximo 30 caracteres.");
        }

        private static CelularRequest CreateValidCelular()
        {
            return new CelularRequest
            {
                Ddd = "11",
                Numero = "999999999",
                WhatsApp = true
            };
        }
    }
}


