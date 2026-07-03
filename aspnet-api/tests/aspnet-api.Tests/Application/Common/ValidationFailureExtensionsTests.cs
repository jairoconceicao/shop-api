using aspnet_api.Domain.Common;
using aspnet_api.src.Application.Common;
using FluentValidation.Results;
using Xunit;

namespace aspnet_api.Tests.Application.Common;

public class ValidationFailureExtensionsTests
{
    [Fact]
    public void ToNotifications_DeveConverterValidationFailureParaNotification()
    {
        var failures = new List<ValidationFailure>
        {
            new("PropertyName", "Error message") { ErrorCode = "ErrorCode" }
        };

        var notifications = failures.ToNotifications();

        Assert.Single(notifications);
        var notification = notifications.Single();
        Assert.Equal("ErrorCode", notification.Code);
        Assert.Equal("Error message", notification.Message);
        Assert.Equal("PropertyName", notification.PropertyName);
    }

    [Fact]
    public void ToNotifications_DeveUsarVALIDATION_ERRORQuandoErrorCodeForVazio()
    {
        var failures = new List<ValidationFailure>
        {
            new("PropertyName", "Error message") { ErrorCode = "" }
        };

        var notifications = failures.ToNotifications();

        Assert.Single(notifications);
        Assert.Equal("VALIDATION_ERROR", notifications.Single().Code);
    }

    [Fact]
    public void ToNotifications_DeveUsarVALIDATION_ERRORQuandoErrorCodeForWhitespace()
    {
        var failures = new List<ValidationFailure>
        {
            new("PropertyName", "Error message") { ErrorCode = "   " }
        };

        var notifications = failures.ToNotifications();

        Assert.Single(notifications);
        Assert.Equal("VALIDATION_ERROR", notifications.Single().Code);
    }

    [Fact]
    public void ToNotifications_DeveRetornarNullQuandoPropertyNameForVazio()
    {
        var failures = new List<ValidationFailure>
        {
            new("", "Error message", "ErrorCode")
        };

        var notifications = failures.ToNotifications();

        Assert.Single(notifications);
        Assert.Null(notifications.Single().PropertyName);
    }

    [Fact]
    public void ToNotifications_DeveRemoverPrefixoRequestDoPropertyName()
    {
        var failures = new List<ValidationFailure>
        {
            new("Request.Email", "Error message") { ErrorCode = "ErrorCode" }
        };

        var notifications = failures.ToNotifications();

        Assert.Single(notifications);
        Assert.Equal("Email", notifications.Single().PropertyName);
    }

    [Fact]
    public void ToNotifications_DeveManterPropertyNameSemPrefixo()
    {
        var failures = new List<ValidationFailure>
        {
            new("Email", "Error message") { ErrorCode = "ErrorCode" }
        };

        var notifications = failures.ToNotifications();

        Assert.Single(notifications);
        Assert.Equal("Email", notifications.Single().PropertyName);
    }

    [Fact]
    public void ToNotifications_DeveConverterMultiplasFalhas()
    {
        var failures = new List<ValidationFailure>
        {
            new("Request.Nome", "Erro nome") { ErrorCode = "CODE1" },
            new("Request.Email", "Erro email") { ErrorCode = "CODE2" }
        };

        var notifications = failures.ToNotifications();

        Assert.Equal(2, notifications.Count);
        Assert.Equal("Nome", notifications.First().PropertyName);
        Assert.Equal("Email", notifications.Last().PropertyName);
    }

    [Fact]
    public void ToNotifications_DeveRetornarColecaoVaziaQuandoNaoHouverFalhas()
    {
        var failures = new List<ValidationFailure>();

        var notifications = failures.ToNotifications();

        Assert.Empty(notifications);
    }
}


