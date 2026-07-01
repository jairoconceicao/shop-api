using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.Api.Contracts.Requests.Shared;
using aspnet_api.src.Application.Cliente.Registrar;
using Xunit;

namespace aspnet_api.Tests.Application.Cliente.Registrar;

public class ClienteRegistrarCommandValidatorTests
{
    private readonly ClienteRegistrarCommandValidator _validator = new();

    public class CpfValidation : ClienteRegistrarCommandValidatorTests
    {
        [Fact]
        public void DeveAceitarCpfValido()
        {
            var result = _validator.Validate(CreateValidRequest());

            Assert.True(result.IsValid);
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRejeitarCpfVazio(string cpf)
        {
            var result = _validator.Validate(CreateValidRequest() with { Cpf = cpf });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "CPF e obrigatorio.");
        }

        [Theory]
        [InlineData("123")]
        [InlineData("1234567890")]
        [InlineData("123456789012")]
        [InlineData("abcdefghijk")]
        public void DeveRejeitarCpfComFormatoInvalido(string cpf)
        {
            var result = _validator.Validate(CreateValidRequest() with { Cpf = cpf });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "CPF deve conter 11 digitos numericos.");
        }
    }

    public class NomeValidation : ClienteRegistrarCommandValidatorTests
    {
        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRejeitarNomeVazio(string nome)
        {
            var result = _validator.Validate(CreateValidRequest() with { Nome = nome });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "Nome e obrigatorio.");
        }

        [Fact]
        public void DeveRejeitarNomeComMaisDe200Caracteres()
        {
            var nomeLongo = new string('A', 201);
            var result = _validator.Validate(CreateValidRequest() with { Nome = nomeLongo });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "Nome deve ter no maximo 200 caracteres.");
        }

        [Fact]
        public void DeveAceitarNomeCom200Caracteres()
        {
            var nome = new string('A', 200);
            var result = _validator.Validate(CreateValidRequest() with { Nome = nome });

            Assert.True(result.IsValid);
        }
    }

    public class DataNascimentoValidation : ClienteRegistrarCommandValidatorTests
    {
        [Fact]
        public void DeveRejeitarDataNascimentoFutura()
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            var result = _validator.Validate(CreateValidRequest() with { DataNascimento = today.AddDays(1) });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "Data de nascimento nao pode ser futura.");
        }

        [Fact]
        public void DeveAceitarDataNascimentoNoDiaAtual()
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            var result = _validator.Validate(CreateValidRequest() with { DataNascimento = today });

            Assert.True(result.IsValid);
        }

        [Fact]
        public void DeveAceitarDataNascimentoPassada()
        {
            var result = _validator.Validate(CreateValidRequest() with { DataNascimento = DateOnly.FromDateTime(DateTime.Today).AddDays(-1) });

            Assert.True(result.IsValid);
        }
    }

    public class EmailValidation : ClienteRegistrarCommandValidatorTests
    {
        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRejeitarEmailVazio(string email)
        {
            var result = _validator.Validate(CreateValidRequest() with { Email = email });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "Email e obrigatorio.");
        }

        [Theory]
        [InlineData("nao-e-email")]
        [InlineData("email@")]
        [InlineData("@email.com")]
        public void DeveRejeitarEmailComFormatoInvalido(string email)
        {
            var result = _validator.Validate(CreateValidRequest() with { Email = email });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "Email deve ter um formato valido.");
        }

        [Fact]
        public void DeveRejeitarEmailComMaisDe200Caracteres()
        {
            var emailLongo = new string('a', 190) + "@exemplo.com";
            var result = _validator.Validate(CreateValidRequest() with { Email = emailLongo });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "Email deve ter no maximo 200 caracteres.");
        }

        [Fact]
        public void DeveAceitarEmailValido()
        {
            var result = _validator.Validate(CreateValidRequest() with { Email = "usuario@dominio.com" });

            Assert.True(result.IsValid);
        }
    }

    public class EnderecoValidation : ClienteRegistrarCommandValidatorTests
    {
        [Fact]
        public void DeveRejeitarEnderecoNulo()
        {
            var result = _validator.Validate(CreateValidRequest() with { Endereco = null! });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "Endereco e obrigatorio.");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRejeitarLogradouroVazio(string logradouro)
        {
            var result = _validator.Validate(CreateValidRequest() with
            {
                Endereco = CreateValidEndereco() with { Logradouro = logradouro }
            });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "Logradouro e obrigatorio.");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRejeitarNumeroVazio(string numero)
        {
            var result = _validator.Validate(CreateValidRequest() with
            {
                Endereco = CreateValidEndereco() with { Numero = numero }
            });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "Numero e obrigatorio.");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRejeitarBairroVazio(string bairro)
        {
            var result = _validator.Validate(CreateValidRequest() with
            {
                Endereco = CreateValidEndereco() with { Bairro = bairro }
            });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "Bairro e obrigatorio.");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRejeitarCidadeVazia(string cidade)
        {
            var result = _validator.Validate(CreateValidRequest() with
            {
                Endereco = CreateValidEndereco() with { Cidade = cidade }
            });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "Cidade e obrigatoria.");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRejeitarUfVazia(string uf)
        {
            var result = _validator.Validate(CreateValidRequest() with
            {
                Endereco = CreateValidEndereco() with { Uf = uf }
            });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "UF e obrigatoria.");
        }

        [Theory]
        [InlineData("S")]
        [InlineData("SPA")]
        public void DeveRejeitarUfComTamanhoInvalido(string uf)
        {
            var result = _validator.Validate(CreateValidRequest() with
            {
                Endereco = CreateValidEndereco() with { Uf = uf }
            });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "UF deve ter 2 caracteres.");
        }

        [Fact]
        public void DeveAceitarEnderecoValido()
        {
            var result = _validator.Validate(CreateValidRequest());

            Assert.True(result.IsValid);
        }
    }

    public class CelularValidation : ClienteRegistrarCommandValidatorTests
    {
        [Fact]
        public void DeveRejeitarCelularNulo()
        {
            var result = _validator.Validate(CreateValidRequest() with { Celular = null! });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "Celular e obrigatorio.");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRejeitarDddVazio(string ddd)
        {
            var result = _validator.Validate(CreateValidRequest() with
            {
                Celular = CreateValidCelular() with { Ddd = ddd }
            });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "DDD e obrigatorio.");
        }

        [Theory]
        [InlineData("1")]
        [InlineData("123")]
        [InlineData("1A")]
        [InlineData("AB")]
        public void DeveRejeitarDddComFormatoInvalido(string ddd)
        {
            var result = _validator.Validate(CreateValidRequest() with
            {
                Celular = CreateValidCelular() with { Ddd = ddd }
            });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "DDD deve conter 2 digitos numericos.");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void DeveRejeitarNumeroVazio(string numero)
        {
            var result = _validator.Validate(CreateValidRequest() with
            {
                Celular = CreateValidCelular() with { Numero = numero }
            });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "Numero de celular e obrigatorio.");
        }

        [Fact]
        public void DeveRejeitarNumeroComMaisDe30Caracteres()
        {
            var result = _validator.Validate(CreateValidRequest() with
            {
                Celular = CreateValidCelular() with { Numero = new string('9', 31) }
            });

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, error => error.ErrorMessage == "Numero de celular deve ter no maximo 30 caracteres.");
        }

        [Fact]
        public void DeveAceitarCelularValido()
        {
            var result = _validator.Validate(CreateValidRequest());

            Assert.True(result.IsValid);
        }
    }

    private static CreateClienteRequest CreateValidRequest()
    {
        return new CreateClienteRequest
        {
            Cpf = "12345678901",
            Nome = "Cliente Teste",
            DataNascimento = DateOnly.FromDateTime(DateTime.Today).AddDays(-1),
            Email = "cliente@exemplo.com",
            Endereco = CreateValidEndereco(),
            Celular = CreateValidCelular()
        };
    }

    private static EnderecoRequest CreateValidEndereco()
    {
        return new EnderecoRequest
        {
            Logradouro = "Rua Um",
            Numero = "123",
            Complemento = "Apto 10",
            Cep = "12345678",
            Bairro = "Centro",
            Cidade = "Sao Paulo",
            Uf = "SP"
        };
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
