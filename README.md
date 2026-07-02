# shop-api

Esta API demonstra uma solução simples de e-commerce com autenticação e documentação Swagger, desenvolvida nas seguintes tecnologias:

- C# / ASP.NET / Minimal Api / EF Core / FluentValidation
<!--
- Java / Spring
- Next.js / TypeScript
- Node.js / TypeScript
- Go
- Python
-->
- Banco de Dados: PostgreSql

Para fins desta demonstração, a solução foi modelada como uma aplicação básica de e-commerce, contemplando:

- Registro dos dados basicos do Cliente
- Catálogo de produtos
- Carrinho de compras
- Geração de pedidos
- Notificações
- Autenticação via JWT Token

## Arquitetura comum entre as versões da API

Utilizamos uma arquitetura monolito modular com vertical-slice por feature. Priorizando DDD e sempre que possivel, Dominio Rico.

Uma sugestão de estrutura de pastas para cada projeto localizado na raiz do repositório é:

```text
aspnet-api/
  src/
    Domain/
    Application/
    Infrastructure/
    Api/
    Tests/

go-api/
  internal/
    domain/
    application/
    infrastructure/
    api/
    tests/

nextjs-api/
  src/
    domain/
    application/
    infrastructure/
    api/
    tests/

nodejs-api/
  src/
    domain/
    application/
    infrastructure/
    api/
    tests/

python-api/
  src/
    domain/
    application/
    infrastructure/
    api/
    tests/

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

Em todos os casos, o objetivo é separar claramente as responsabilidades por camada e, quando possível, organizar cada domínio de negócio em módulos ou features, por exemplo: clientes, catálogo, carrinho, pedidos e notificações.

## Modelagem do E-Commerce

### Registro do Cliente

Receberá dados basicos do cliente, o suficiente para o processamento do pedido

```text
Cliente 
{
    id: Long
    cpf: String
    nome: String
    dataNascimento: Date
    endereco: {
        logradouro: String
        numero: String
        complemento: String
        cep: String
        bairro: String
        cidade: String
        uf: String
    }
    celular: {
        ddd: String
        numero: String
        whatsApp: Boolean
    }
    email: String
}
```

### Catálogo de Produtos

```text
Produto
{
    id: Long
    titulo: String
    descricao: String
    modelo: String
    preco: Decimal
    foto: String
    thumb: String
}
```

### Estoque

```text
Estoque
{
    id: Long
    descricao: String
    dataMovimento: DateTime
    produtoId: Long
    quantidadeMinima: Decimal
    quantidadeMaxima: Decimal
    quantidadeAtual: Decimal
}

MovimentoEstoque
{
    id: Long
    estoqueId: Long
    dataMovimento: DateTime
    operacao: {
        codigo: Int
        tipo: IN | OU
        descricao: String
    }
    quantidade: Decimal
}
```

### Carrinho de Compras

```text
Carrinho
{
    id: Long
    clienteId: Long
    enderecoEntrega: Endereco
    dataCarrinho: DateTime
    items: {
        id: Long
        produtoId: Long
        valorUnitario: Decimal
        quantidade: Decimal
    }
}
```

### Geração de Pedidos

```text
Pedido
{
    id: Long
    dataPedido: DateTime
    clienteId: Long
    carrinhoId: Long
    enderecoEntrega: Endereco
    formaPagamento: FormaPagamento
    status: PedidoStatus
    items: [
      {
        produtoId: Long
        valorUnitario: Decimal
        quantidade: Decimal
      }
    ]
}

```

### Notificação

Implementar proxima fase.

## Endpoints

Os contratos abaixo refletem as rotas atualmente implementadas na API.
As respostas de sucesso usam `ApiResponse<T>` (`status`, `message`, `data`) ou `PagedResponse<T>` (`status`, `message`, `pagination`).
As respostas de erro usam `ApiErrorResponse` com `error.code`, `error.message` e `error.details`.

```jsonc

// Registro de Novo Cliente
// POST /api/v1/cliente
// Body
{
  "cpf": "12345678901",
  "nome": "Fulano de Tal",
  "dataNascimento": "1990-01-31",
  "email": "fulano@exemplo.com",
  "endereco": {
    "logradouro": "Rua Exemplo",
    "numero": "123",
    "complemento": "Apto 10",
    "cep": "01000000",
    "bairro": "Centro",
    "cidade": "Sao Paulo",
    "uf": "SP"
  },
  "celular": {
    "ddd": "11",
    "numero": "999999999",
    "whatsApp": true
  }
}
// Response - 201 Created
{
  "status": true,
  "message": "",
  "data": {
    "clienteId": 9999
  }
}

// Consultar Cliente pelo ID
// GET /api/v1/cliente/{clienteId}
// Response - 200 OK
{
  "status": true,
  "message": "",
  "data": {
    "clienteId": 9999,
    "cpf": "12345678901",
    "nome": "Fulano de Tal",
    "dataNascimento": "1990-01-31",
    "email": "fulano@exemplo.com",
    "endereco": {
      "logradouro": "Rua Exemplo",
      "numero": "123",
      "complemento": "Apto 10",
      "cep": "01000000",
      "bairro": "Centro",
      "cidade": "Sao Paulo",
      "uf": "SP"
    },
    "celular": {
      "ddd": "11",
      "numero": "999999999",
      "whatsApp": true
    }
  }
}

// Consultar Cliente pelo CPF
// GET /api/v1/cliente/cpf/{cpf}
// Response - 200 OK
{
  "status": true,
  "message": "",
  "data": {
    "clienteId": 9999,
    "cpf": "12345678901",
    "nome": "Fulano de Tal",
    "dataNascimento": "1990-01-31",
    "email": "fulano@exemplo.com",
    "endereco": {
      "logradouro": "Rua Exemplo",
      "numero": "123",
      "complemento": "Apto 10",
      "cep": "01000000",
      "bairro": "Centro",
      "cidade": "Sao Paulo",
      "uf": "SP"
    },
    "celular": {
      "ddd": "11",
      "numero": "999999999",
      "whatsApp": true
    }
  }
}

// Atualizacao Dados do Cliente
// PUT /api/v1/cliente/{clienteId}
// Body
{
  "cpf": "12345678901",
  "nome": "Fulano de Tal",
  "dataNascimento": "1990-01-31",
  "email": "fulano@exemplo.com",
  "endereco": {
    "logradouro": "Rua Exemplo",
    "numero": "123",
    "complemento": "Apto 10",
    "cep": "01000000",
    "bairro": "Centro",
    "cidade": "Sao Paulo",
    "uf": "SP"
  },
  "celular": {
    "ddd": "11",
    "numero": "999999999",
    "whatsApp": true
  }
}
// Response - 200 OK
{
  "status": true,
  "message": "",
  "data": {
    "clienteId": 9999
  }
}

// Cancelar Conta do Cliente
// DELETE /api/v1/cliente/{clienteId}
// Response - 200 OK
{
  "status": true,
  "message": "",
  "data": {
    "clienteId": 9999
  }
}

// Carregar Catalogo de Produtos
// GET /api/v1/produto?page=1&size=20
// Response - 200 OK
{
  "status": true,
  "message": "",
  "pagination": {
    "pages": 99,
    "size": 20,
    "totalItems": 99,
    "data": [
      {
        "produtoId": 9999,
        "titulo": "Produto exemplo",
        "thumb": null,
        "preco": 9999.99,
        "estoque": 9999.9999
      }
    ]
  }
}

// Consultar Produto pelo ID
// GET /api/v1/produto/{id}
// Response - 200 OK
{
  "status": true,
  "message": "",
  "data": {
    "produtoId": 9999,
    "titulo": "Produto exemplo",
    "descricao": "Descricao do produto",
    "modelo": "Modelo X",
    "foto": null,
    "preco": 9999.99,
    "estoque": 9999.9999
  }
}

// Criar Carrinho
// POST /api/v1/carrinho/criar
// Body
{
  "clienteId": 99999
}
// Response - 201 Created
{
  "status": true,
  "message": "",
  "data": {
    "carrinhoId": 9999,
    "dataCarrinho": "2026-07-01T14:30:00-03:00"
  }
}

// Adicionar Item ao Carrinho
// POST /api/v1/carrinho/items
// Body
{
  "produtoId": 9999,
  "quantidade": 2,
  "valorUnitario": 9999.99
}
// Response - 201 Created
{
  "status": true,
  "message": "",
  "data": {
    "itemId": 999
  }
}

// Editar quantidade do Item no Carrinho
// PATCH /api/v1/carrinho/items/{itemId}
// Body
{
  "quantidade": 3
}
// Response - 200 OK
{
  "status": true,
  "message": "",
  "data": {
    "itemId": 9999,
    "produtoId": 9999
  }
}

// Excluir item do Carrinho
// DELETE /api/v1/carrinho/items/{itemId}
// Response - 200 OK
{
  "status": true,
  "message": "",
  "data": {
    "itemId": 9999,
    "produtoId": 9999
  }
}

// Obter Carrinho
// GET /api/v1/carrinho/{carrinhoId}
// Response - 200 OK
{
  "status": true,
  "message": "",
  "data": {
    "clienteId": 99999,
    "carrinhoId": 9999,
    "dataCarrinho": "2026-07-01T14:30:00-03:00",
    "items": [
      {
        "itemId": 9999,
        "produtoId": 9999,
        "quantidade": 2,
        "valorUnitario": 9999.99
      }
    ]
  }
}

// Criar Pedido
// POST /api/v1/pedido
// Body
{
  "carrinhoId": 9999,
  "clienteId": 99999,
  "endercoEntrega": {
    "logradouro": "Rua Exemplo",
    "numero": "123",
    "complemento": "Apto 10",
    "cep": "01000000",
    "bairro": "Centro",
    "cidade": "Sao Paulo",
    "uf": "SP"
  },
  "dataPedido": "2026-07-01T14:30:00-03:00",
  "formaPagamento": "Pix | Cartao | Boleto",
  "status": "Criado | EmProcessamento | Processado | Cancelado | Devolvido",
  "items": [
    {
      "itemId": 9999,
      "produtoId": 9999,
      "quantidade": 2,
      "valorUnitario": 9999.99
    }
  ]
}
// Response - 201 Created
{
  "status": true,
  "message": "",
  "data": {
    "pedidoId": 9999,
    "clienteId": 99999,
    "dataPedido": "2026-07-01T14:30:00-03:00",
    "formaPagamento": "Pix | Cartao | Boleto",
    "status": "Criado | EmProcessamento | Processado | Cancelado | Devolvido",
    "valorTotal": 99999.9999,
  }
}

// Consultar Pedido por Id
// GET /api/v1/pedido/{pedidoId}
// Response = 200 OK
{
  "status": true,
  "message": "",
  "data": {
    "pedidoId": 9999,
    "carrinhoId": 9999,
    "clienteId": 99999,
    "endercoEntrega": {
      "logradouro": "Rua Exemplo",
      "numero": "123",
      "complemento": "Apto 10",
      "cep": "01000000",
      "bairro": "Centro",
      "cidade": "Sao Paulo",
      "uf": "SP"
    },
    "dataPedido": "2026-07-01T14:30:00-03:00",
    "formaPagamento": "Pix | Cartao | Boleto",
    "status": "Criado | EmProcessamento | Processado | Cancelado | Devolvido",
    "items": [
      {
        "itemId": 9999,
        "produtoId": 9999,
        "quantidade": 2,
        "valorUnitario": 9999.99
      }
    ]
  }
}

// Consultar Pedidos
// GET /api/v1/pedido?cpf={cpf}&dataInicio={dataPedidoIni}&dataFim={dataPedidoFim}
// Response = 200 OK
{
  "status": true,
  "message": "",
  "pagination": {
    "pages": 99,
    "size": 20,
    "totalItems": 99,
    "data": [
      {
        "pedidoId": 9999,
        "carrinhoId": 9999,
        "clienteId": 99999,
        "endercoEntrega": {
          "logradouro": "Rua Exemplo",
          "numero": "123",
          "complemento": "Apto 10",
          "cep": "01000000",
          "bairro": "Centro",
          "cidade": "Sao Paulo",
          "uf": "SP"
        },
        "dataPedido": "2026-07-01T14:30:00-03:00",
        "formaPagamento": "Pix | Cartao | Boleto",
        "status": "Criado | EmProcessamento | Processado | Cancelado | Devolvido",
        "items": [
          {
            "itemId": 9999,
            "produtoId": 9999,
            "quantidade": 2,
            "valorUnitario": 9999.99
          }
        ]
      }
    ]
  }
}

// Cancelar Pedido
// PATCH /api/v1/pedido/{pedidoId}
// Body
{
  "pedidoId": 9999,
  "status": "Cancelado",
}
// Response = 200 OK
{
  "status": true,
  "message": "",
  "data": {
    "pedidoId": 9999,
    "clienteId": 99999,
    "dataPedido": "2026-07-01T14:30:00-03:00",
    "status": "Criado | EmProcessamento | Processado | Cancelado | Devolvido",
  }
}
```
