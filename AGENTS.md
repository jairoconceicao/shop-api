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

### API

Endpoints in `src/Api/Endpoints/`, policies in `Security/AuthorizationPolicies.cs`, DTOs in `Contracts/` separado por `Requests/` e `Responses/`.

### Application

- Um Use Case por Pasta — `{Action}Command.cs`. Handlers inject abstractions from `Application/Abstractions/`.
- Commands implementam a interface IActionCommand.
- Quando possível, implementar FluentValidation

### Domain

- Entities, value objects, domain services, and policies only. Business rules live here and have unit tests in `tests/Domain.Tests/`.
- Evite usar throw - catch - exception. Prefira usar Notification Pattern e Result Object Pattern.

### Infrastructure

Implemente IUnitOfWork como uma classe concreta separada e não junto com DbContext.

### Tests

Required for every changed behavior. Domain → unit; Application → fakes; API → contract + integration.

### Injeção de Dependencia

- Prefira deixar o Program.cs como composição separando as extensões por responsabilidade.
- Agrupe todas as exetensões na pasta src/Ioc

## Tarefas

Para cada tarefa solicitada via prompt, ao finalizá-la se for realizado alteração ou criação de código, crie um commit conforme a Skill `commit-mesages`.
