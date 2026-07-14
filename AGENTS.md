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

### Infra

A aplicação vai rodar localmente via docker, nos seguintes containers:

- shop-api-app: container para a api
- shop-api-db: container para o banco de dados

Dados de conexão para o banco de dados

- user: shopapi
- password: shopapi
- databaseName: shopapi

### Frontend

O Frontend deve serguir na linha de e-commerce populares como Mercado Livre, Kabum e Magazine Luiza e deve ser construído com a stack abaixo:

```text
- SPA, sem server-side pages
- React + TailwindCss V4
- Zod como validation library
- Zustand como state management
- Utilize o esquema de cores do prototipo em `docs/ideacao`
```

Deve ser implementado na pasta `/frontend`

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

- **SEMPRE** separe tarefas de backend e frontend.
- Toda tarefa deve ser pequena e rastreável.

## Workflow de implementação de tasks

O agente principal deve atuar somente como orquestrador.

### Fonte das tasks

As tasks estão em:

`docs/frontend-tasks-v2.md`

Uma task pode ser executada somente quando:

- seu status for `READY`;
- todas as tasks listadas em `Depends on` estiverem `DONE`;
- seus critérios de aceite estiverem definidos;
- não houver outra task ativa alterando os mesmos componentes.

### Workflow obrigatório por task

Para cada task selecionada:

1. Registrar o commit atual como BASE_COMMIT.
2. Delegar a análise a um agente explorador.
3. Aguardar o relatório do agente explorador.
4. Delegar a implementação a um agente implementador.
5. Aguardar a implementação e os testes.
6. Gerar o diff entre BASE_COMMIT e HEAD.
7. Delegar a revisão um agente revisor.
8. Caso existam findings CRITICAL ou IMPORTANT:
   - delegar as correções ao agente implementador;
   - executar os testes novamente;
   - enviar novamente ao agente revisor.
9. Somente após ambas as aprovações:
   - atualizar a task para `DONE`;
   - registrar testes e commit no backlog;
   - criar um commit final, caso ainda existam mudanças pendentes.

### Restrições

- Não executar dois agentes com permissão de escrita simultaneamente no mesmo checkout.
- Não implementar tasks com dependências incompletas.
- Não alterar escopo sem registrar a decisão.
- Não marcar uma task como concluída com testes falhando.
- Não ignorar findings CRITICAL ou IMPORTANT.
- Não trabalhar diretamente na branch main.
- Cada task deve possuir seu próprio commit ou conjunto claramente identificado de commits.

### Formato dos commits

`feat(TASK-ID): descrição`

`fix(TASK-ID): descrição`

`test(TASK-ID): descrição`

### Resultado final

Ao terminar o lote, apresentar:

- tasks concluídas;
- tasks bloqueadas;
- commits criados;
- testes executados;
- findings pendentes;
- mudanças realizadas no backlog.
