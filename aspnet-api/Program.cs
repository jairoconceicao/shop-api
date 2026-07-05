using System.Text;
using aspnet_api.Api;
using aspnet_api.Api.Endpoints;
using aspnet_api.Infrastructure;
using aspnet_api.src.Application;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, services, loggerConfiguration) =>
{
    loggerConfiguration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext();
});

builder.Services.AddApiServices(builder.Configuration, builder.Environment);
builder.Services.AddApplication();
builder.Services.AddInfrastructure();

var app = builder.Build();

app.UseApiPipeline();
app.Run();
