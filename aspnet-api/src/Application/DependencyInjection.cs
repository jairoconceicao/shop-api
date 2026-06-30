using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.Api.Contracts.Responses.Clientes;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Cliente.Registrar;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace aspnet_api.src.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IValidator<CreateClienteRequest>, ClienteRegistrarCommandValidator>();
        services.AddScoped<IActionCommand<CreateClienteRequest, ClienteIdResponse>, ClienteRegistrarCommand>();

        return services;
    }
}
