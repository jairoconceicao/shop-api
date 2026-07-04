using aspnet_api.Api.Contracts.Responses.Clientes;
using aspnet_api.Api.Contracts.Responses.Shared;
using ClienteEntity = aspnet_api.Domain.Entities.Cliente;

namespace aspnet_api.src.Application.Cliente.Shared;

public static class ClienteResponseMapper
{
    public static ClienteDetalheResponse ToDetalheResponse(this ClienteEntity cliente)
    {
        ArgumentNullException.ThrowIfNull(cliente);

        return new ClienteDetalheResponse
        {
            ClienteId = cliente.Id,
            Cpf = cliente.Cpf,
            Nome = cliente.Nome,
            DataNascimento = cliente.DataNascimento,
            Email = cliente.Email,
            Endereco = cliente.Endereco is null
                ? new EnderecoResponse()
                : new EnderecoResponse
                {
                    Logradouro = cliente.Endereco.Logradouro,
                    Numero = cliente.Endereco.Numero,
                    Complemento = cliente.Endereco.Complemento,
                    Cep = cliente.Endereco.Cep,
                    Bairro = cliente.Endereco.Bairro,
                    Cidade = cliente.Endereco.Cidade,
                    Uf = cliente.Endereco.Uf
                },
            Celular = cliente.Celular is null
                ? new CelularResponse()
                : new CelularResponse
                {
                    Ddd = cliente.Celular.Ddd,
                    Numero = cliente.Celular.Numero,
                    WhatsApp = cliente.Celular.WhatsApp
                }
        };
    }
}


