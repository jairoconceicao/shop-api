using aspnet_api.Api.Endpoints.Clientes;
using aspnet_api.Infrastructure;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.src.Application;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

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
}

app.MapClienteEndpoints();

app.UseHttpsRedirection();

app.Run();
