# Referência da API

Os contratos abaixo refletem as rotas atualmente implementadas na API.

## Envelopes de resposta

- **Sucesso (carga única)**: `ApiResponse<T>` com `status`, `message` e `data`.
- **Sucesso (lista paginada)**: `PagedResponse<T>` com `status`, `message` e
  `pagination`.
- **Erro**: `ApiErrorResponse` com `error.code`, `error.message` e
  `error.details`.

---

## Cliente

### Registrar novo cliente

```text
POST /api/v1/cliente
```

```jsonc
// Request
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
```

### Consultar cliente pelo ID

```text
GET /api/v1/cliente/{clienteId}
```

```jsonc
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
```

### Consultar cliente pelo CPF

```text
GET /api/v1/cliente/cpf/{cpf}
```

```jsonc
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
```

### Atualizar dados do cliente

```text
PUT /api/v1/cliente/{clienteId}
```

```jsonc
// Request
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
```

### Cancelar conta do cliente

```text
DELETE /api/v1/cliente/{clienteId}
```

```jsonc
// Response - 200 OK
{
  "status": true,
  "message": "",
  "data": {
    "clienteId": 9999
  }
}
```

---

## Catálogo

### Carregar catálogo de produtos

```text
GET /api/v1/produto?page=1&size=20
```

```jsonc
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
```

### Consultar produto pelo ID

```text
GET /api/v1/produto/{id}
```

```jsonc
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
```

---

## Carrinho

### Criar carrinho

```text
POST /api/v1/carrinho/criar
```

```jsonc
// Request
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
```

### Adicionar item ao carrinho

```text
POST /api/v1/carrinho/items
```

```jsonc
// Request
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
```

### Editar quantidade do item

```text
PATCH /api/v1/carrinho/items/{itemId}
```

```jsonc
// Request
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
```

### Excluir item do carrinho

```text
DELETE /api/v1/carrinho/items/{itemId}
```

```jsonc
// Response - 200 OK
{
  "status": true,
  "message": "",
  "data": {
    "itemId": 9999,
    "produtoId": 9999
  }
}
```

### Obter carrinho

```text
GET /api/v1/carrinho/{carrinhoId}
```

```jsonc
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
```

---

## Pedidos

### Criar pedido

```text
POST /api/v1/pedido
```

```jsonc
// Request
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
    "valorTotal": 99999.9999
  }
}
```

### Consultar pedido por ID

```text
GET /api/v1/pedido/{pedidoId}
```

```jsonc
// Response - 200 OK
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
```

### Consultar pedidos

```text
GET /api/v1/pedido?cpf={cpf}&dataInicio={dataPedidoIni}&dataFim={dataPedidoFim}
```

```jsonc
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
```

### Cancelar pedido

```text
PATCH /api/v1/pedido/{pedidoId}
```

```jsonc
// Request
{
  "pedidoId": 9999,
  "status": "Cancelado"
}

// Response - 200 OK
{
  "status": true,
  "message": "",
  "data": {
    "pedidoId": 9999,
    "clienteId": 99999,
    "dataPedido": "2026-07-01T14:30:00-03:00",
    "status": "Criado | EmProcessamento | Processado | Cancelado | Devolvido"
  }
}
```
