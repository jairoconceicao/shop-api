# shop-api

Esta API demonstra uma solução simples de e-commerce com autenticação e documentação Swagger, desenvolvida nas seguintes tecnologias:

- C# / ASP.NET / Minimal Api / EF Core / FluentValidation
- Java / Spring
- Next.js / TypeScript
- Node.js / TypeScript
- Go
- Python
- Banco de Dados: PostgreSql

Para fins desta demonstração, a solução foi modelada como uma aplicação básica de e-commerce, contemplando:

- Registro dos dados basicos do Cliente
- Catálogo de produtos
- Carrinho de compras
- Geração de pedidos
- Notificações

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
    items: {
        produtoId: Long
        quantidade: Decimal
    }
}

```

### Notificação

Implementar proxima fase.
