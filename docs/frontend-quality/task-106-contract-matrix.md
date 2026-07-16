# TASK-106 — matriz de contratos e adapters

## Regras transversais

| Regra | Cobertura |
| --- | --- |
| IDs transportados | `number` inteiro seguro ou string decimal canônica; frações e inteiros inseguros são rejeitados. |
| Valores transportados | `number` finito ou string decimal canônica; `NaN`, `Infinity` e `-Infinity` são rejeitados. |
| Objetos e envelopes | Propriedades extras são rejeitadas em todos os níveis alterados pela task. |
| Sucesso | `data: null`, ausência de dados, `status: false` e paginação incompleta são aceitos pelo envelope quando contratualmente opcionais, mas rejeitados pelos adapters que exigem sucesso. |
| Enums | Pagamento aceita somente `Pix`, `Cartao` e `Boleto`; pedido aceita somente `Criado`, `Processado`, `Enviado`, `Cancelado` e `Devolvido`. |

## Matriz por fronteira

| Fronteira | IDs cobertos (`number` / string) | Valores cobertos (`number` / string) | Null permitido | Rejeições e evidência |
| --- | --- | --- | --- | --- |
| Shared adapters/envelopes | paginação: `pages`, `size`, `totalItems` | `normalizeNumber` | `ApiResponse.data`; campos opcionais do envelope | unsafe, fração, não finito, extras no sucesso, erro e paginação em `numbers.test.ts` e `apiEnvelopes.test.ts` |
| Login | `usuarioId`, `clienteId` | — | `ApiResponse.data` | transporte inválido, sucesso divergente e extras no request, envelope e data em `login.test.ts` |
| Catálogo/categoria/detalhe | `categoriaId`, `produtoId`, `pages`, `size`, `totalItems` | `preco`, `estoque` | `descricao` de categoria (decisão de compatibilidade registrada), `thumb`, `descricao`, `modelo`, `foto`, envelope `data` | strings/numbers, string não canônica, envelope incompleto e extras em envelope/paginação/item/categoria em `catalog.test.ts` |
| Carrinho | `clienteId`, `carrinhoId`, `itemId`, `produtoId` | `quantidade`, `valorUnitario` | envelope `data` | strings/numbers, unsafe, `NaN`, infinidades, datas inválidas, extras e envelopes divergentes em `cart.test.ts` |
| Checkout/criação de pedido | `itemId`, `produtoId`, `pedidoId`, `clienteId` | `quantidade`, `valorUnitario`, `valorTotal` | `enderecoEntrega.complemento`, `PedidoItemRequest.itemId`, envelope `data` | roots/items estritos, unsafe, não finito, total negativo, todos os pagamentos e status desconhecido em `checkout.test.ts` e `order.test.ts` |
| Cadastro/perfil | `clienteId` | — | `endereco.complemento`, envelope `data` | string/number, positivo, unsafe via normalizador, extras no root/nested/envelope e sucesso divergente em `registration.test.ts` e `customerProfile.test.ts` |
| Pedidos/lista/detalhe/cancelamento | `pedidoId`, `carrinhoId`, `clienteId`, `itemId`, `produtoId`, `pages`, `size`, `totalItems` | `quantidade`, `valorUnitario` | `enderecoEntrega.complemento` | strings/numbers, unsafe, não finito, envelopes/objetos estritos, cinco status canônicos e valores desconhecidos em `orders.test.ts` |

## Observações contratuais

- A rejeição de propriedades extras é uma regra explícita da TASK-106; o OpenAPI atual não declara `additionalProperties: false`.
- `CategoriaResponse.descricao` permanece nullable por decisão de compatibilidade com o comportamento existente. A divergência com o OpenAPI deve ser tratada separadamente, sem ampliar esta task.
- Schemas genéricos preservam os campos opcionais descritos pelo contrato. Os adapters públicos continuam responsáveis por exigir uma resposta semanticamente bem-sucedida.
- A cobertura reutiliza casos existentes quando a combinação equivalente já estava provada; os testes novos se concentram em strictness, inteiros seguros e enumeração canônica.
