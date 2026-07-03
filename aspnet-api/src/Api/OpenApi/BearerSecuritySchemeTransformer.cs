using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace aspnet_api.Api.OpenApi;

public sealed class BearerSecuritySchemeTransformer : IOpenApiDocumentTransformer
{
    private const string SecuritySchemeName = "Bearer";

    public Task TransformAsync(
        OpenApiDocument document,
        OpenApiDocumentTransformerContext context,
        CancellationToken cancellationToken)
    {
        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
        var securitySchemes = document.Components.SecuritySchemes;

        if (!securitySchemes.ContainsKey(SecuritySchemeName))
        {
            securitySchemes[SecuritySchemeName] = new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Description = "JWT enviado no cabeçalho Authorization como Bearer {token}"
            };
        }

        return Task.CompletedTask;
    }
}


