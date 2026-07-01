using aspnet_api.Api.Contracts.Requests.Clientes;
using aspnet_api.Api.Contracts.Responses.Clientes;
using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Abstractions.Commands;
using aspnet_api.src.Application.Cliente.Atualizar;
using aspnet_api.src.Application.Cliente.ConsultarPorCpf;
using aspnet_api.src.Application.Cliente.ConsultarPorId;
using aspnet_api.src.Application.Cliente.Excluir;
using aspnet_api.src.Application.Cliente.Registrar;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace aspnet_api.src.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IValidator<CreateClienteRequest>, ClienteRegistrarCommandValidator>();
        services.AddScoped<IValidator<AtualizarClienteCommand>, AtualizarClienteCommandValidator>();
        services.AddScoped<IValidator<ExcluirClienteCommand>, ExcluirClienteCommandValidator>();
        services.AddScoped<IValidator<ConsultarClientePorIdQuery>, ConsultarClientePorIdQueryValidator>();
        services.AddScoped<IValidator<ConsultarClientePorCpfQuery>, ConsultarClientePorCpfQueryValidator>();

        services.AddScoped<IActionCommand<CreateClienteRequest, Result<ClienteIdResponse>>, ClienteRegistrarCommand>();
        services.AddScoped<IActionCommand<AtualizarClienteCommand, Result<ClienteIdResponse>>, ClienteAtualizarCommand>();
        services.AddScoped<IActionCommand<ExcluirClienteCommand, Result<ClienteIdResponse>>, ClienteExcluirCommand>();
        services.AddScoped<IActionCommand<ConsultarClientePorIdQuery, Result<ClienteDetalheResponse>>, ClienteConsultarPorIdQuery>();
        services.AddScoped<IActionCommand<ConsultarClientePorCpfQuery, Result<ClienteDetalheResponse>>, ClienteConsultarPorCpfQuery>();

        return services;
    }
}
