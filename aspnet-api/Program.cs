using aspnet_api.src.Ioc;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, services, loggerConfiguration) =>
{
    loggerConfiguration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext();
});

builder.Services.AddApiOpenApi();
builder.Services.AddApiCors(builder.Configuration);
builder.Services.AddApiSecurity(builder.Configuration, builder.Environment);
builder.Services.AddApiPersistence(builder.Configuration);
builder.Services.AddApplication();
builder.Services.AddInfrastructure();

var app = builder.Build();

app.UseApiPipeline();
app.Run();

