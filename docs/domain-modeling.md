# Modelagem de Domínio

Este documento descreve a modelagem do e-commerce usada como referência para
a implementação da API. Ele representa o **planejamento da aplicação** e é o
ponto de partida para a evolução dos contextos em cada variante da API.

## Visão geral dos contextos

- **Clientes**: cadastro e manutenção dos dados básicos do cliente.
- **Catálogo**: produtos disponíveis para venda.
- **Estoque**: controle de quantidade disponível e movimentações.
- **Carrinho**: composição temporária de produtos para um cliente.
- **Pedidos**: fechamento do carrinho com definição de pagamento, endereço
  de entrega e status.
- **Notificações**: comunicação com o cliente (próxima fase).

---

## Registro do Cliente

Receberá dados básicos do cliente, o suficiente para o processamento do
pedido.

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

---

## Categoria de Produtos

```text
CategoriaProduto
{
  id: Long
  titulo: String
  descricao: String
}
```

---

## Catálogo de Produtos

```text
Produto
{
  id: Long
  categoriaProdutoId: Long
  titulo: String
  descricao: String
  modelo: String
  preco: Decimal
  foto: String
  thumb: String
}
```

---

## Estoque

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

---

## Carrinho de Compras

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

---

## Geração de Pedidos

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

---

## Notificação

A ser implementada em uma próxima fase. Manterá o cliente informado sobre o
ciclo de vida do pedido e demais eventos relevantes.
