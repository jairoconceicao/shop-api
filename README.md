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

```jsonc

// Registro de Novo Cliente
// POST /api/v1/cliente
// Body
{
  "cpf": "",
  "nome": "",
  "dataNascimento": "",
  "email": "",
  "endereco":{
    "logradouro": "",
    "numero": "",
    "complemento": "",
    "cep": "",
    "bairro": "",
    "cidade": "",
    "uf": ""
  },
  "celular": {
    "ddd": "",
    "numero": "",
    "whatsApp": ""
  }
}
// Response
{
  "status": true,
  "message": "",
  "data": {
    "clienteId": 9999
  }
}

// Atualizacao Dados do Cliente
// PUT /api/v1/cliente/{clienteId}
// Body
{
  "cpf": "",
  "nome": "",
  "dataNascimento": "",
  "email": "",
  "endereco": {
    "logradouro": "",
    "numero": "",
    "complemento": "",
    "cep": "",
    "bairro": "",
    "cidade": "",
    "uf": ""
  },
  "celular": {
    "ddd": "",
    "numero": "",
    "whatsApp": ""
  }
}
// Response
{
  "status": true,
  "message": "",
  "data": {
    "clienteId": 9999
  }
}

// Cancelar Conta do Cliente
// DELETE /api/v1/cliente/{clienteId}
// Response
{
  "status": true,
  "message": "",
  "data": {
    "clienteId": 9999
  }
}

// Carregar Catalogo de Produtos
// GET /api/v1/produto?page=1&size=20
{
  "status": true,
  "message": "",
  "pagination": {
    "pages": 99,
    "size": 99,
    "totalItems": 99,
    "data": [
      {
        "produtoId": 9999,
        "titulo": "",
        "thumb": "",
        "preco": 9999.99,
        "estoque":9999.9999
      },
    ]
  }
}

// Consultar Produto pelo ID
// GET /api/v1/produto/{id}
{
  "produtoId": 9999,
  "titulo": "",
  "descricao": "",
  "modelo": "",
  "foto": "",
  "preco": 9999.99,
  "estoque":9999.9999
}

// Criar Carrinho
// POST /api/v1/carrinho/criar
// Body
{
  "clienteId": 99999,
}
// Response
{
  "status": true,
  "message": "",
  "data":{
    "carrinhoId": 9999,
    "dataCarrinho": "dd/mm/yyy hh:mm:ss"
  }
}

// Adicionar Item ao Carrinho
// POST /api/v1/carrinho/items
// Body
{
  "produtoId": 9999,
  "quantidade": 9999.9999,
  "valorUnitario": 9999.9999
}
// Response
{
  "status": true,
  "message": "",
  "data":{
    "itemId": 999
  }
}

// Editar quantidade do Item no Carrinho
// PATCH /api/v1/carrinho/items/{itemId}
// Body
// Response
{
  "status": true,
  "message": "",
  "data":{
    "itemId": 9999,
    "produtoId": 9999
  }
}

// Excluir item do Carrinho
// DELETE /api/v1/carrinho/items/{itemId}
{
  "status": true,
  "message": "",
  "data":{
    "itemId": 9999,
    "produtoId": 9999
  }
}

// Criar Pedido
// POST /api/v1/pedido
// Body
{
  "clienteId": 9999,
  "enderecoEntrega": {
    "logradouro": "",
    "numero": "",
    "complemento": "",
    "cep": "",
    "bairro": "",
    "cidade": "",
    "uf": ""
  },
  "formaPagamento": "Pix | Cartao | Boleto",
  "dataPedido": "dd/mm/yyyy hh:mm:ss",
  "items": [
    {
      "produtoId": 9999,
      "quantidade": 9999.9999,
      "valorUnitario": 9999.9999
    }
  ]
}
// Response
{
  "status": true,
  "message": "",
  "data":{
    "pedidoId": 9999
  }
}

// Consultar Pedido
// GET /api/v1/pedido/{pedidoId}
{
  "id": 9999,
  "cliente": {
    "cpf": "",
    "nome": "",
    "email": ""
  },
  "enderecoEntrega": {
    "logradouro": "",
    "numero": "",
    "complemento": "",
    "cep": "",
    "bairro": "",
    "cidade": "",
    "uf": ""
  },
  "formaPagamento": "Pix | Cartao | Boleto",
  "dataPedido": "dd/mm/yyyy hh:mm:ss",
  "status": "Criado | EmProcessamento | Processado | Cancelado | Devolvido",
  "items": [
    {
      "produtoId": 9999,
      "quantidade": 9999.9999,
      "valorUnitario": 9999.9999
    }
  ]
}

// Cancelar Pedido
// PATCH /api/v1/pedido/{pedidoId}
// Body
{
  "status": "Cancelado"
}
// Response
{
  "status": true,
  "message": "",
  "pedidoId": 9999
}

```
