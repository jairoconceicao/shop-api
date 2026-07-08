using aspnet_api.Application.Abstractions.Security;
using aspnet_api.Domain.Common;

namespace aspnet_api.src.Application.Common;

public static class AutorizacaoClienteExtensions
{
    public static Result ValidarAcessoAoCliente(this ISessaoAtualProvider sessaoAtualProvider, long clienteId, string propertyName)
    {
        ArgumentNullException.ThrowIfNull(sessaoAtualProvider);

        if (!sessaoAtualProvider.ClienteId.HasValue)
        {
            return Result.Failure(
                "Cliente autenticado nao identificado.",
                [
                    new Notification("AUTH_CLIENTE_NAO_IDENTIFICADO", "Cliente autenticado nao identificado.", propertyName)
                ]);
        }

        if (sessaoAtualProvider.ClienteId.Value != clienteId)
        {
            return Result.Failure(
                "Cliente autenticado nao pode acessar este recurso.",
                [
                    new Notification("AUTH_CLIENTE_ACESSO_NEGADO", "Cliente autenticado nao pode acessar este recurso.", propertyName)
                ]);
        }

        return Result.Success();
    }
}
