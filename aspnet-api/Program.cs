using Asp.Versioning;
using Asp.Versioning.ApiExplorer;
using aspnet_api.Api.Endpoints.Clientes;
using aspnet_api.Infrastructure;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.src.Application;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = new UrlSegmentApiVersionReader();
}).AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

// EF Core DbContext
builder.Services.AddDbContext<ShopDbContext>(options =>
    options.UseInMemoryDatabase("ShopDb")
);
builder.Services.AddApplication();
builder.Services.AddInfrastructure();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwaggerUI(options =>
    {
        options.RoutePrefix = "swagger";
        options.SwaggerEndpoint("/openapi/v1.json", "Shop Api v1");
    });
}

app.MapClienteEndpoints();

app.UseHttpsRedirection();

app.Run();

public partial class Program { }
