# Design da Fase 5 do frontend — Checkout

## Objetivo e escopo

Implementar RF-070 a RF-078: proteger o checkout, pré-carregar o endereço do cliente, permitir edição apenas para o pedido atual, criar o pedido com payload estrito, reconciliar caches e exibir a confirmação. Lista/detalhe de pedidos, edição do perfil, lazy loading e E2E permanecem nas fases posteriores.

## Fluxo e componentes

`/checkout` continua sob `ProtectedRoute`. Um guard específico aguarda a query do carrinho confirmado e só libera a página para sessão válida e carrinho não vazio; caso contrário retorna a `/carrinho`. A página consulta `GET /api/v1/cliente/{clienteId}`, inicializa React Hook Form com o endereço e valida com Zod. Alterar esses campos nunca chama `PUT /cliente`.

O formulário oferece exatamente `Pix`, `Cartao` e `Boleto`. O resumo visual pode hidratar produtos, mas os itens enviados são derivados exclusivamente do último `Cart` confirmado. A mutação gera `new Date().toISOString()` no clique, cria o request pelo adapter estrito e chama `POST /api/v1/pedido`.

## Contratos e decisão sobre `itemId`

O objeto raiz enviado contém somente `enderecoEntrega`, `formaPagamento`, `dataPedido` e `items`; `clienteId` e `carrinhoId` nunca são enviados. Cada item mantém `itemId`, `produtoId`, `quantidade` e `valorUnitario`, conforme o exemplo de request da API e o modelo confirmado do carrinho. Portanto, `itemId` não é identidade de cliente/carrinho e não deve ser removido.

O endereço usa `logradouro`, `numero`, `complemento`, `cep`, `bairro`, `cidade` e `uf`. A resposta de sucesso normalizada contém `pedidoId`, `clienteId`, `dataPedido`, `formaPagamento`, `status` e `valorTotal`.

## Sucesso, refresh e caches

Após `201`, a aplicação guarda a resposta normalizada sob uma chave versionada de `sessionStorage`, indexada implicitamente pelo `pedidoId`, remove o vínculo local do carrinho daquele cliente, remove o cache do carrinho concluído, invalida caches de pedidos e navega para `/pedido-confirmado/{pedidoId}`.

A confirmação lê primeiro o navigation state e depois esse snapshot mínimo. Um refresh na mesma aba restaura a confirmação somente quando o `pedidoId` da URL coincide. Snapshot ausente, inválido ou de outro pedido produz estado seguro com link para pedidos, sem consultar detalhe nesta fase. Essa persistência não contém token, endereço, itens ou dados de pagamento adicionais.

## Erros, concorrência e linguagem

Enquanto o POST está pendente, o CTA fica desabilitado e uma segunda tentativa é ignorada. `409` explica o conflito e `422` apresenta validação acionável, preservando o formulário; falhas não limpam carrinho ou caches. A confirmação diz apenas que o pedido foi criado e não promete autorização de pagamento, entrega ou nota fiscal.

## Testes

Testes unitários cobrem schemas/adapters e persistência da confirmação. Testes de serviço cobrem perfil e POST. Testes de hooks cobrem data no envio, duplicidade, erros e reconciliação. Testes de rota/página cobrem guards, edição local, payload, sucesso e refresh. Cada task executa seu teste focado; ao fim, `npm test`, `npm run typecheck`, `npm run lint` e `npm run build` devem passar.
