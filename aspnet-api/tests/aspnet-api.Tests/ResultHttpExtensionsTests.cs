using System.Text.Json;
using aspnet_api.Api.Contracts.Responses.Clientes;
using aspnet_api.Api.Contracts.Responses.Shared;
using aspnet_api.Api.Endpoints.Shared;
using aspnet_api.Domain.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace aspnet_api.Tests.Api.Endpoints.Shared;

public class ResultHttpExtensionsTests
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    [Fact]
    public async Task ToHttpResult_DeveMapearSucessoParaApiResponseComStatus201()
    {
        var result = Result<ClienteIdResponse>.Success(new ClienteIdResponse { ClienteId = 42 }, "Cliente cadastrado com sucesso.");

        var (statusCode, body) = await ExecuteAsync(result.ToHttpResult(StatusCodes.Status201Created));

        Assert.Equal(StatusCodes.Status201Created, statusCode);

        var response = JsonSerializer.Deserialize<ApiResponse<ClienteIdResponse>>(body, JsonOptions);
        Assert.NotNull(response);
        Assert.True(response!.Status);
        Assert.Equal("Cliente cadastrado com sucesso.", response.Message);
        Assert.Equal(42, response.Data!.ClienteId);
    }

    [Fact]
    public async Task ToHttpResult_DeveMapearValidacaoParaApiErrorResponseComStatus422()
    {
        var result = Result<ClienteIdResponse>.Failure(
            "Dados invalidos para o cadastro do cliente.",
            new[]
            {
                new Notification("CLIENTE_EMAIL_INVALIDO", "Email deve ter um formato valido.", nameof(ClienteIdResponse.ClienteId))
            });

        var (statusCode, body) = await ExecuteAsync(result.ToHttpResult(StatusCodes.Status201Created));

        Assert.Equal(StatusCodes.Status422UnprocessableEntity, statusCode);

        var response = JsonSerializer.Deserialize<ApiErrorResponse>(body, JsonOptions);
        Assert.NotNull(response);
        Assert.Equal("VALIDATION_ERROR", response!.Error.Code);
        Assert.Equal("Dados invalidos para o cadastro do cliente.", response.Error.Message);

        var details = Assert.IsType<JsonElement>(response.Error.Details);
        Assert.Equal(JsonValueKind.Array, details.ValueKind);
        Assert.Equal("CLIENTE_EMAIL_INVALIDO", details[0].GetProperty("code").GetString());
    }

    [Fact]
    public async Task ToHttpResult_DeveMapearDuplicidadeParaApiErrorResponseComStatus409()
    {
        var result = Result<ClienteIdResponse>.Failure(
            "Nao foi possivel cadastrar o cliente.",
            new[]
            {
                new Notification("CLIENTE_CPF_DUPLICADO", "Ja existe um cliente cadastrado com este CPF.", nameof(ClienteIdResponse.ClienteId))
            });

        var (statusCode, body) = await ExecuteAsync(result.ToHttpResult(StatusCodes.Status201Created));

        Assert.Equal(StatusCodes.Status409Conflict, statusCode);

        var response = JsonSerializer.Deserialize<ApiErrorResponse>(body, JsonOptions);
        Assert.NotNull(response);
        Assert.Equal("CONFLICT_ERROR", response!.Error.Code);

        var details = Assert.IsType<JsonElement>(response.Error.Details);
        Assert.Equal("CLIENTE_CPF_DUPLICADO", details[0].GetProperty("code").GetString());
    }

    private static async Task<(int StatusCode, string Body)> ExecuteAsync(IResult result)
    {
        using var serviceProvider = new ServiceCollection()
            .AddLogging()
            .AddOptions()
            .ConfigureHttpJsonOptions(_ => { })
            .BuildServiceProvider();

        var context = new DefaultHttpContext
        {
            RequestServices = serviceProvider
        };

        await using var body = new MemoryStream();
        context.Response.Body = body;

        await result.ExecuteAsync(context);

        context.Response.Body.Position = 0;
        using var reader = new StreamReader(context.Response.Body, leaveOpen: true);
        var content = await reader.ReadToEndAsync();

        return (context.Response.StatusCode, content);
    }
}
