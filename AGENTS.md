# Shop-Api — Agent Context

## Architecture

Clean Architecture + DDD — monólito modular com vertical-slice por feature. Priorizando DDD e sempre que possivel, Dominio Rico.

## Tech Stack

### Backend

aspnet-api: C#, .NET 10, ASP.NET Minimal Api, EF Core, FluentValidation
<!--
go-api: 
nextjs-api: 
nodejs-api: 
python-api: 
spring-api:
-->

Banco de dados: PostgreSql

### Frontend

Não será implementado neste momento.

### Infra

A aplicação vai rodar localmente via docker, nos seguintes containers:

- shop-api-app: container para a api
- shop-api-db: container para o banco de dados

Dados de conexão para o banco de dados

- user: shopapi
- password: shopapi
- databaseName: shopapi

## Convenção de Código para C# / .NET 10 / ASP.NET

**Application**: um Use Case por Pasta — `{Action}Command.cs`. Handlers inject abstractions from `Application/Abstractions/`.

**API**: endpoints in `src/Api/Endpoints/`, policies in `Security/AuthorizationPolicies.cs`, DTOs in `Contracts/` separado por `Requests/` e `Responses/`.

**Domain**: entities, value objects, domain services, and policies only. Business rules live here and have unit tests in `tests/Domain.Tests/`.

**Tests**: required for every changed behavior. Domain → unit; Application → fakes; API → contract + integration.
