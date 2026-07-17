# Fase 12 — Segurança & Resiliência — Design

**Data:** 2026-07-16
**Status:** PLANNED
**Dependências:** Nenhuma (infraestrutura transversal)

## 1. Contexto

A API atualmente não possui rate limiting, health checks, telemetria distribuída nem logs enriquecidos. Isso é aceitável para MVP, mas necessário antes de expor em produção.

## 2. Objetivo

Adicionar camada de proteção e observabilidade: rate limiting, health checks, OpenTelemetry, logs estruturados e headers de segurança.

## 3. Rate Limiting

### Biblioteca: `AspNetCoreRateLimit`

**Política IP (endpoints anônimos):**
- 100 requisições por minuto por IP
- Aplica-se a: `/api/v1/produto/**`, `/api/v1/categoria/**`
- Excede → 429 Too Many Requests + header `Retry-After: 60`

**Política JWT (endpoints autenticados):**
- 300 requisições por minuto por token JWT
- Aplica-se a: `/api/v1/carrinho/**`, `/api/v1/pedido/**`, `/api/v1/cliente/**`
- Identificador: claim `jti` do JWT

**Configuração:**
```json
{
  "IpRateLimiting": {
    "EnableEndpointRateLimiting": true,
    "StackBlockedRequests": false,
    "GeneralRules": [
      { "Endpoint": "*:/api/v1/produto/*", "Period": "1m", "Limit": 100 },
      { "Endpoint": "*:/api/v1/categoria/*", "Period": "1m", "Limit": 100 }
    ]
  },
  "ClientRateLimiting": {
    "ClientIdHeader": "Authorization",
    "GeneralRules": [
      { "Endpoint": "*:/api/v1/carrinho/*", "Period": "1m", "Limit": 300 },
      { "Endpoint": "*:/api/v1/pedido/*", "Period": "1m", "Limit": 300 }
    ]
  }
}
```

## 4. Health Checks

### Endpoints

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/health` | Liveness | Retorna 200 se o processo está rodando |
| `/health/db` | Readiness | Verifica conexão com PostgreSQL (`NpgsqlConnection`) |

**Implementação:**
```csharp
builder.Services.AddHealthChecks()
    .AddNpgsql(connectionString, name: "postgres", tags: ["db"]);
```

**Resposta `/health`:**
```json
{ "status": "Healthy", "timestamp": "2026-07-16T10:00:00Z" }
```

**Resposta `/health/db`:**
```json
{
  "status": "Healthy",
  "checks": { "postgres": { "status": "Healthy", "duration": "00:00:00.015" } }
}
```

## 5. OpenTelemetry

### Setup

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(t => t
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddNpgsql()
        .AddOtlpExporter());
```

- Export para Application Insights via OTLP endpoint
- Connection string do App Insights via `APPLICATIONINSIGHTS_CONNECTION_STRING`
- Sampling: 100% em dev, 10% em produção

## 6. Logs Estruturados (Serilog)

### Enriquecimento

Todo log deve incluir automaticamente:
- `CorrelationId` (header `X-Correlation-Id` ou GUID gerado)
- `ClientIp` (extraído do `X-Forwarded-For` ou `HttpContext.Connection.RemoteIpAddress`)
- `UserAgent`
- `UserId` (se autenticado, do claim `userId`)
- `RequestPath`, `RequestMethod`

**Middleware de CorrelationId:**
```csharp
app.Use(async (context, next) => {
    var correlationId = context.Request.Headers["X-Correlation-Id"].FirstOrDefault()
        ?? Guid.NewGuid().ToString("N");
    context.Response.Headers["X-Correlation-Id"] = correlationId;
    using (LogContext.PushProperty("CorrelationId", correlationId))
        await next();
});
```

## 7. Headers de Segurança

Adicionar middleware que insere:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (produção apenas)

## 8. Testes

| Camada | O que testar |
|--------|-------------|
| Integração | GET `/health` retorna 200; GET `/health/db` retorna 200 com db check OK; Requisições que excedem limite retornam 429; Headers de segurança presentes nas responses |
| API | Rate limit reset após janela de 1 minuto; CorrelationId propagado no header de resposta |
