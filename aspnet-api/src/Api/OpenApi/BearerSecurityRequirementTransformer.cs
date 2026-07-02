using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace aspnet_api.Api.OpenApi;

public sealed class BearerSecurityRequirementTransformer : IOpenApiOperationTransformer
{
    private const string SecuritySchemeName = "Bearer";

    public Task TransformAsync(
        OpenApiOperation operation,
        OpenApiOperationTransformerContext context,
        CancellationToken cancellationToken)
    {
        var endpointMetadata = context.Description.ActionDescriptor.EndpointMetadata;

        if (endpointMetadata.OfType<IAllowAnonymous>().Any())
        {
            return Task.CompletedTask;
        }

        if (!endpointMetadata.OfType<IAuthorizeData>().Any())
        {
            return Task.CompletedTask;
        }

        var securityRequirement = new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference(SecuritySchemeName, context.Document, null)] = new List<string>()
        };

        operation.Security ??= new List<OpenApiSecurityRequirement>();

        var alreadyRegistered = operation.Security.Any(requirement =>
            requirement.Keys.OfType<OpenApiSecuritySchemeReference>()
                .Any(reference => reference.Reference?.Id == SecuritySchemeName));

        if (!alreadyRegistered)
        {
            operation.Security.Add(securityRequirement);
        }

        return Task.CompletedTask;
    }
}
