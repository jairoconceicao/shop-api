using System.Text;
using aspnet_api.Api.Endpoints.Auth;
using aspnet_api.Api.Endpoints.Carrinhos;
using aspnet_api.Api.Endpoints.Clientes;
using aspnet_api.Api.Endpoints.Pedidos;
using aspnet_api.Api.Endpoints.Produtos;
using aspnet_api.Api.Middleware;
using aspnet_api.Api.OpenApi;
using aspnet_api.Application.Abstractions.Security;
using aspnet_api.Infrastructure;
using aspnet_api.Infrastructure.Persistence;
using aspnet_api.Infrastructure.Security;
using aspnet_api.src.Application;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, services, loggerConfiguration) =>
{
    loggerConfiguration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext();
});

builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer<BearerSecuritySchemeTransformer>();
    options.AddOperationTransformer<BearerSecurityRequirementTransformer>();
});
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new Asp.Versioning.ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = new Asp.Versioning.UrlSegmentApiVersionReader();
}).AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();

builder.Services.AddHttpContextAccessor();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Secret)),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddSingleton(TimeProvider.System);

// EF Core DbContext
var connectionString = builder.Configuration.GetConnectionString("ShopDb")
    ?? throw new InvalidOperationException("Connection string 'ShopDb' was not found.");

builder.Services.AddDbContext<ShopDbContext>(options => 
{
    options.UseNpgsql(connectionString);
    options.UseQueryTrackingBehavior(QueryTrackingBehavior.TrackAll);
#if DEBUG
    options.EnableSensitiveDataLogging();
    options.EnableDetailedErrors();
#endif
});
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
        options.EnablePersistAuthorization();
    });
}

app.UseAuthentication();
app.UseMiddleware<ValidacaoSessaoJwtMiddleware>();
app.UseAuthorization();

app.MapAuthEndpoints();
app.MapClienteEndpoints();
app.MapProdutoEndpoints();
app.MapCarrinhoEndpoints();
app.MapPedidoEndpoints();

app.UseHttpsRedirection();

app.Run();
