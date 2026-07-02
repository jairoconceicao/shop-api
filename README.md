# shop-api

API de demonstração de um e-commerce com autenticação e documentação Swagger,
disponível em múltiplas stacks. Cada variante vive em sua própria pasta na
raiz deste repositório e compartilha a mesma modelagem de domínio e os
mesmos contratos de API.

## Funcionalidades

- Cadastro e manutenção de clientes
- Catálogo de produtos
- Controle de estoque
- Carrinho de compras
- Geração e acompanhamento de pedidos
- Autenticação via JWT
- Notificações (próxima fase)

## Stack

| Variante       | Status  | Stack                                                                                   |
| -------------- | ------- | --------------------------------------------------------------------------------------- |
| `aspnet-api/`  | ativa   | C# / .NET / ASP.NET Minimal API / EF Core / FluentValidation                            |
| `go-api/`      | em breve| Go                                                                                      |
| `nextjs-api/`  | em breve| Next.js / TypeScript                                                                    |
| `nodejs-api/`  | em breve| Node.js / TypeScript                                                                    |
| `python-api/`  | em breve| Python                                                                                  |
| `spring-api/`  | em breve| Java / Spring                                                                           |

Banco de dados: **PostgreSQL**.

## Subindo o ambiente (aspnet-api)

A aplicação roda localmente via Docker, com dois containers:

- `shop-api-app`: a API
- `shop-api-db`: o PostgreSQL

Credenciais de acesso ao banco:

- **user**: `shopapi`
- **password**: `shopapi`
- **database**: `shopapi`

> Para instruções detalhadas de execução de cada variante, consulte o
> `README.md` dentro da pasta correspondente (ex.: `aspnet-api/README.md`).

## Estrutura do repositório

```text
shop-api/
├── aspnet-api/        # Implementação ativa em C# / .NET
├── go-api/            # Stub — implementação Go (em breve)
├── nextjs-api/        # Stub — implementação Next.js (em breve)
├── nodejs-api/        # Stub — implementação Node.js (em breve)
├── python-api/        # Stub — implementação Python (em breve)
├── spring-api/        # Stub — implementação Java/Spring (em breve)
├── docs/              # Documentação técnica do projeto
└── openapi.yaml       # Contrato OpenAPI da API
```

## Documentação

Detalhes de arquitetura, modelagem de domínio e contratos da API estão em
[`/docs`](./docs):

- [`docs/architecture.md`](./docs/architecture.md) — estilo arquitetônico
  (monólito modular + vertical-slice), DDD, responsabilidades por camada e
  convenção de pastas de cada variante.
- [`docs/domain-modeling.md`](./docs/domain-modeling.md) — planejamento da
  aplicação: contextos, entidades, value objects e invariantes de negócio.
- [`docs/api-reference.md`](./docs/api-reference.md) — referência dos
  endpoints, envelopes de resposta e exemplos de request/response.
