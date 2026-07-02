# Arquitetura

Este documento descreve a arquitetura comum a todas as variantes da API
disponíveis neste repositório (`aspnet-api`, `go-api`, `nextjs-api`, `nodejs-api`,
`python-api`, `spring-api`).

## Estilo arquitetônico

Adotamos **monólito modular com vertical-slice por feature**, priorizando
**DDD (Domain-Driven Design)** e, sempre que possível, **Domínio Rico**.

Os princípios que orientam o código são:

- **Linguagem ubíqua**: termos de negócio refletidos no código e nos contratos
  da API.
- **Isolamento por domínio**: cada contexto (clientes, catálogo, carrinho,
  pedidos, notificações) vive em seu próprio módulo/feature.
- **Regras de negócio no domínio**: entidades, value objects, domain services e
  policies concentram as invariantes. A aplicação orquestra casos de uso; a
  infraestrutura cuida de persistência, mensageria e integrações externas.
- **Contratos estáveis na borda**: a API expõe DTOs e contratos bem definidos,
  desacoplados das entidades de domínio.
- **Erros como dados**: evitar `throw/catch/exception` para regras de negócio.
  Preferir **Notification Pattern** e **Result Object Pattern**.

## Estrutura de pastas por variante

A estrutura abaixo é a convenção adotada em cada projeto localizado na raiz do
repositório.

### `aspnet-api/` (C# / .NET / ASP.NET Minimal API)

```text
aspnet-api/
  src/
    Domain/
    Application/
    Infrastructure/
    Api/
    Tests/
```

### `go-api/`

```text
go-api/
  internal/
    domain/
    application/
    infrastructure/
    api/
    tests/
```

### `nextjs-api/`

```text
nextjs-api/
  src/
    domain/
    application/
    infrastructure/
    api/
    tests/
```

### `nodejs-api/`

```text
nodejs-api/
  src/
    domain/
    application/
    infrastructure/
    api/
    tests/
```

### `python-api/`

```text
python-api/
  src/
    domain/
    application/
    infrastructure/
    api/
    tests/
```

### `spring-api/` (Java / Spring)

```text
spring-api/
  src/
    main/
      java/
        com/example/shop/
          domain/
          application/
          infrastructure/
          api/
    test/
```

## Responsabilidades por camada

- **Domain**: entidades, value objects, domain services e policies. Concentra
  as regras de negócio e possui cobertura obrigatória de testes unitários.
- **Application**: casos de uso (um por pasta, ex.: `CriarPedidoCommand.cs`),
  DTOs de aplicação e validações. Dependem apenas de abstrações definidas em
  `Application/Abstractions/`.
- **Infrastructure**: implementações concretas de persistência (EF Core,
  drivers, ORMs), mensageria, integrações externas e configurações de runtime.
- **Api**: endpoints (Minimal API, controllers, etc.), DTOs de contrato
  (`Requests/` e `Responses/`), policies de autorização e configuração de
  pipeline (autenticação, validação, tratamento de erros).

## Features

Em todas as variantes, o objetivo é separar claramente as responsabilidades
por camada e, quando possível, organizar cada domínio de negócio em módulos
ou features, por exemplo: **clientes, catálogo, carrinho, pedidos e
notificações**.
