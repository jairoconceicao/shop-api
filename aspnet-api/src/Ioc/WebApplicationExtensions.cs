using aspnet_api.Api.Endpoints;
using aspnet_api.Api.Middleware;
using aspnet_api.Ioc;

namespace aspnet_api.src.Ioc;

public static class WebApplicationExtensions
{
    public static WebApplication UseApiPipeline(this WebApplication app)
    {
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

        app.UseCors(ApiCorsServiceCollectionExtensions.LocalFrontendPolicyName);
        app.UseAuthentication();
        app.UseMiddleware<ValidacaoSessaoJwtMiddleware>();
        app.UseAuthorization();

        app.MapEndpoints();

        app.UseHttpsRedirection();

        return app;
    }
}

