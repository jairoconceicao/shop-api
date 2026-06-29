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
