# Relatório de exploração — Fase 7 (Pedidos)

## Veredito

**Status do lote: BLOCKED administrativamente.** As TASK-096..105 estão apenas com checkbox aberto (`[ ]`) e descrição curta. Diferentemente das fases 4–6, nenhuma possui o campo literal `Status: READY`, `Depends on` ou `Critérios de aceite`. O `AGENTS.md` autoriza executar uma task somente com status `READY`, dependências `DONE` e critérios definidos. O código e a baseline estão aptos; o bloqueio é exclusivamente a ausência desses metadados no backlog.

Para desbloquear sem ampliar escopo, recomenda-se registrar no backlog os metadados propostos abaixo, inicialmente deixando somente TASK-096 como `READY`. As demais devem permanecer `BLOCKED` até a predecessora imediata ficar `DONE`.

## Checkout, branch e baseline

- Worktree: `E:\CodeRepo\shop-api\.worktrees\fase-7-pedidos`
- Branch: `codex/fase-7-pedidos` (não é `main`)
- BASE_COMMIT confirmado: `8902e34e6b10fdc3ca08e5560eaddbd3452fe318` (`8902e34`)
- Estado inicial: sem alterações rastreadas.
- Dependências: `node_modules` não existia; `npm ci` instalou 318 pacotes. O postinstall do MSW tocou apenas a terminação de linha de `public/mockServiceWorker.js`; essa alteração incidental foi restaurada e não faz parte do lote.
- Baseline executada em `frontend/`:
  - `npm run typecheck`: PASS.
  - `npm run lint`: PASS.
  - `npm run test`: PASS, 98 arquivos e 637/637 testes.
  - `npm run build`: PASS; aviso não bloqueante do entry de 720,40 kB.
  - `npm run test:e2e -- --list`: PASS, 1 teste listado.
- Observações de instalação: `npm audit` reportou 2 vulnerabilidades moderadas; não foi executado `audit fix` porque está fora do escopo.

## Fonte de verdade e requisitos exatos

O backlog só nomeia as tarefas. Os critérios abaixo são a decomposição rastreável de `frontend-specification-v2.md` RF-080..087, RNF-010, RNF-012..018; `frontend-implementation-plan-v2.md` §4.6, §7–11; e `openapi.yaml`.

Contrato OpenAPI relevante:

- `GET /api/v1/pedido`: Bearer obrigatório; query `cpf` obrigatória; `dataInicio`/`dataFim` opcionais em `date-time`; `page` default 1; `size` default 20; resposta `PagedResponseOfPedidoResponse`; erros 401, 404 e 422.
- `GET /api/v1/pedido/{pedidoId}`: Bearer; ID inteiro; resposta `ApiResponseOfPedidoResponse`; erros 401, 404 e 422.
- `PATCH /api/v1/pedido/{pedidoId}`: Bearer; body `UpdatePedidoStatusRequest`; sucesso `ApiResponseOfPedidoCanceladoResponse`; erros 401, 404 e 422.
- `PedidoResponse`: `pedidoId`, `carrinhoId`, `clienteId`, `enderecoEntrega`, `dataPedido`, `formaPagamento`, `status` e `items`.
- `PedidoItemResponse`: `itemId`, `produtoId`, `quantidade`, `valorUnitario`; os quatro valores numéricos aceitam `number | string`.
- Status exatos: `Criado`, `EmProcessamento`, `Processado`, `Cancelado`, `Devolvido`.
- Pagamentos exatos já usados pelo checkout: `Pix`, `Cartao`, `Boleto`.
- O OpenAPI não marca propriedades de resposta como obrigatórias; a arquitetura exige schema tolerante no transporte e modelo interno estrito, rejeitando envelope sem recurso necessário.

## Estado e dependências propostas por task

### TASK-096 — contratos de pedidos

- Backlog atual: aberto; sem status formal. **Proposta: READY**, `Depends on: TASK-095` (DONE).
- Critérios:
  1. Validar e adaptar lista paginada, detalhe, `PedidoStatus`, itens e resposta de cancelamento conforme o OpenAPI, aceitando `number | string` nos campos numéricos e produzindo IDs inteiros positivos/números finitos no modelo interno.
  2. Rejeitar status/enums desconhecidos, envelopes nulos/falsos, paginação inválida e recursos incompletos com erro de contrato; requests devem ser estritos.
  3. Produzir request de cancelamento contendo exclusivamente `{ status: 'Cancelado' }` e cobrir casos válidos/inválidos por testes.
- Arquivos: criar `src/features/orders/contracts/orders.ts` e teste. Decidir uma interface pública pequena para reutilizar status/pagamento com checkout, evitando `orders` importar internals de `checkout` ou duplicar schemas canônicos.

### TASK-097 — query paginada por CPF

- Backlog atual: aberto; sem status formal. **Proposta: BLOCKED**, `Depends on: TASK-096, TASK-087` (087 DONE; 096 pendente).
- Critérios:
  1. Reutilizar a query canônica do perfil e iniciar `GET /api/v1/pedido` somente quando sessão/token/cliente e CPF confirmado forem válidos; normalizar CPF para o transporte.
  2. Enviar CPF, período opcional, `page` e `size=20`, com Bearer e `AbortSignal`; validar a resposta antes de cachear.
  3. Usar query key privada que inclua identidade lógica do cliente/CPF normalizado, datas, página e tamanho, `meta.private: true`, sem token ou CPF bruto sensível na key; isolar resposta tardia de troca de sessão e oferecer retry manual.
- Arquivos: `orders/services/listOrdersService.ts`, `orders/queries/useOrdersQuery.ts` e testes; ampliar `checkout/cache/orderCache.ts` ou substituir por query keys canônicas compartilhadas da feature orders.

### TASK-098 — período na URL

- Backlog atual: aberto; sem status formal. **Proposta: BLOCKED**, `Depends on: TASK-097`.
- Critérios:
  1. Parsear/serializar `dataInicio`, `dataFim` e `page` na URL; valores ausentes/inválidos não devem causar requisição inválida.
  2. Aplicar/limpar filtros por formulário com labels visíveis, sincronizar voltar/avançar e resetar página para 1 quando o período mudar.
  3. Enviar ao endpoint somente filtros de data suportados; não criar chips/filtro de status.
- Arquivos: `orders/routing/ordersUrl.ts`, testes e posteriormente a página.

### TASK-099 — OrderCard

- Backlog atual: aberto; sem status formal. **Proposta: BLOCKED**, `Depends on: TASK-096, TASK-021` (021 DONE; 096 pendente).
- Critérios:
  1. Exibir ID, data, pagamento, status com rótulo amigável derivado exclusivamente dos cinco enums e link SPA para o detalhe.
  2. Calcular o total em renderização por `sum(quantidade * valorUnitario)`, sem persistir/aceitar total inventado.
  3. Ser semanticamente acessível e reorganizar conteúdo/ações em uma coluna no mobile, sem overflow.
- Arquivos: `orders/components/OrderCard.tsx` e teste; possível `orders/formatting/orderPresentation.ts`.

### TASK-100 — página Meus Pedidos

- Backlog atual: aberto; sem status formal. **Proposta: BLOCKED**, `Depends on: TASK-097, TASK-098, TASK-099, TASK-025`.
- Critérios:
  1. Substituir placeholder de `/pedidos`, manter rota protegida e carregá-la lazy; compor filtros URL, cards e paginação retornada pela API.
  2. Exibir skeleton estável, vazio com ação apropriada, erro recuperável com retry manual e sucesso sem funcionalidades fora do MVP.
  3. Preservar navegação voltar/avançar, foco/teclado, região viva adequada e responsividade 320–1920 px.
- Arquivos: `orders/pages/OrdersPage.tsx`, teste, `app/router/AppRouter.tsx` e testes de rota/lazy.

### TASK-101 — detalhe do pedido

- Backlog atual: aberto; sem status formal. **Proposta: BLOCKED**, `Depends on: TASK-096, TASK-100`.
- Critérios:
  1. Parsear somente `pedidoId` canônico inteiro positivo e chamar `GET /api/v1/pedido/{pedidoId}` com Bearer/AbortSignal, sem ID sentinela e com chave privada por pedido/sessão.
  2. Carregar `/pedidos/:pedidoId` lazy e exibir endereço, data, pagamento, status e itens confirmados, além de loading, 404 e erro com retry.
  3. Derivar totais dos itens, proteger contra resposta tardia cross-session e manter layout/semântica acessíveis.
- Arquivos: `orders/routing/orderId.ts`, `orders/services/getOrderService.ts`, `orders/queries/useOrderDetailQuery.ts`, `orders/pages/OrderDetailPage.tsx` e testes; `AppRouter.tsx`.

### TASK-102 — hidratação dos produtos

- Backlog atual: aberto; sem status formal. **Proposta: BLOCKED**, `Depends on: TASK-101, TASK-057` (057 DONE).
- Critérios:
  1. Deduplicar e ordenar os `produtoId` dos itens; resolver os únicos em paralelo com `Promise.all` e `queryClient.ensureQueryData(productDetailQueryOptions(...))`.
  2. Reutilizar o cache de detalhe, sem guardar produtos/pedidos em Zustand, e marcar a agregação privada quando ligada ao pedido.
  3. Isolar falha por produto e mostrar fallback acionável de nome/imagem sem ocultar os demais itens nem os valores confirmados.
- Arquivos: `orders/queries/useOrderProductsQuery.ts`, teste e componentes de item/detalhe.

### TASK-103 — cancelamento

- Backlog atual: aberto; sem status formal. **Proposta: BLOCKED**, `Depends on: TASK-101, TASK-096, TASK-022`.
- Critérios:
  1. Pedir confirmação acessível antes de `PATCH /api/v1/pedido/{pedidoId}` e enviar body estrito exclusivamente `{ status: 'Cancelado' }`.
  2. Usar Bearer, capturar pedido/sessão por tentativa, `retry: false`, bloquear submissão duplicada/fechamento durante pendência e ignorar sucesso tardio de outra sessão.
  3. Exibir sucesso somente após envelope válido com o mesmo pedido/cliente; falhas mantêm a página utilizável.
- Arquivos: `orders/services/cancelOrderService.ts`, `orders/mutations/useCancelOrderMutation.ts`, `orders/components/CancelOrderDialog.tsx`, página e testes.

### TASK-104 — cancelamento recusado 422

- Backlog atual: aberto; sem status formal. **Proposta: BLOCKED**, `Depends on: TASK-103`.
- Critérios:
  1. Ao receber 422, não assumir cancelamento nem alterar o status otimisticamente; recarregar/reconciliar o detalhe do pedido.
  2. Informar em alerta/região viva que o cancelamento não foi aceito e que o estado exibido foi atualizado pelo servidor.
  3. Reabilitar a ação conforme o estado confirmado e não repetir PATCH automaticamente; falha do refetch não deve mascarar a recusa original.
- Arquivos: mutation/página/dialog e testes MSW 422.

### TASK-105 — convergência de cache

- Backlog atual: aberto; sem status formal. **Proposta: BLOCKED**, `Depends on: TASK-103, TASK-104`.
- Critérios:
  1. Após cancelamento aceito e validado para a sessão atual, atualizar/invalidate a chave exata do detalhe e invalidar todas as listas privadas afetadas do cliente.
  2. Aguardar reconciliação em best-effort sem disparar segundo PATCH; listas com quaisquer páginas/períodos devem convergir.
  3. Não executar efeitos de sucesso em 422, falha, envelope divergente ou resposta tardia; cobrir detalhe + lista em teste de integração.
- Arquivos: query keys/mutation e testes de integração.

## Ordem segura e agrupamentos

Ordem recomendada, com um commit rastreável por task: `096 → 097 → 098 → 099 → 100 → 101 → 102 → 103 → 104 → 105`.

Os seguintes pares podem compartilhar um ciclo de análise/testes, mas não devem perder commits separados: 098+100 (URL/página), 099+100 (card/página), 101+102 (detalhe/hidratação), 103+104+105 (mutation/422/cache). Como o checkout é compartilhado, somente um implementador com escrita deve atuar no worktree a cada vez. A regra do backlog impede iniciar o item seguinte antes de marcar a dependência como DONE.

Formato de commits: `feat(TASK-096): ...` até `feat(TASK-105): ...`, usando `fix`/`test` apenas quando semanticamente apropriado.

## Arquivos e componentes existentes a reutilizar

- `src/features/customer/queries/useCustomerProfileQuery.ts`: query canônica do perfil e chave privada; não criar segunda query de cliente.
- `src/features/catalog/queries/useProductDetailQuery.ts`: cache canônico do produto; reutilizar na hidratação.
- `src/features/cart/queries/useCartProductsQuery.ts`: padrão de deduplicação + `Promise.all` + isolamento de falhas.
- `src/features/checkout/cache/orderCache.ts`: hoje contém apenas `orderQueryKeys.all = ['orders']`; precisa virar namespace privado consistente sem quebrar a invalidação do checkout.
- `src/features/checkout/contracts/order.ts`: já define status e resposta de criação internamente. Evitar dois enums divergentes; preferir contrato canônico/publicamente compartilhável.
- `src/shared/ui/navigation/Pagination.tsx`, states, surfaces, badges/chips, dialogs, buttons, ProductImage e formatadores existentes.
- `src/app/router/AppRouter.tsx`: placeholders atuais de `/pedidos` e `/pedidos/:pedidoId`; pedidos ainda não são lazy.
- `src/app/layouts/AccountLayout.tsx`, Header e Footer já apontam para `/pedidos`.
- MSW central em `src/shared/testing/handlers.ts`; testes de feature podem usar handlers locais como as fases anteriores.

## Ambiguidades que precisam de decisão registrada

1. **Bloqueante de workflow:** falta `Status: READY`, `Depends on` e critérios nas dez tarefas. As propostas acima resolvem isso sem mudar a intenção funcional.
2. **Semântica das datas:** UI provavelmente usará `input type=date`, mas a API exige `date-time`. A documentação não define timezone nem limites inclusivos. Recomendação: interpretar datas como civis locais; `dataInicio` no início do dia e `dataFim` no fim do dia, convertidas para ISO com offset/UTC, validando início ≤ fim. Registrar essa decisão e testar virada de timezone.
3. **CPF na query key:** RF exige dependência pelo CPF, mas RNF-016 desaconselha dados sensíveis. Recomendação: chavear por `customerId` + filtros e capturar o CPF normalizado no `queryFn`; nunca persistir nem logar CPF.
4. **404 da lista:** OpenAPI permite 404, mas não define se significa lista vazia. Não converter silenciosamente em vazio sem evidência; tratar como erro/recurso não encontrado até contrato/backend esclarecer.
5. **Disponibilidade do CTA cancelar:** não existe matriz de transição no contrato. Como a API é autoridade, não codificar regra de domínio inventada. Pode ocultar apenas para estados terminais óbvios `Cancelado`/`Devolvido`, mas essa escolha deve ser registrada; para demais estados, enviar e tratar 422.
6. **Confirmação do cancelamento:** o plano de testes cita dialog de cancelamento, embora RF-086 não o explicite. Recomenda-se dialog acessível por consistência com ação destrutiva.
7. **Schema de endereço:** `PedidoResponse.enderecoEntrega` usa `EnderecoResponse`, enquanto checkout usa `EnderecoRequest`. Reutilizar/adaptar o contrato canônico de customer quando shapes coincidirem, sem importar internals de checkout.
8. **Paginação:** API default `size=20`; manter tamanho fixo 20 e URL apenas com `page`, salvo decisão explícita de expor tamanho.

## Conclusão

O lote está tecnicamente pronto para implementação e a baseline está verde, mas **não pode iniciar sob o workflow vigente** até o backlog registrar os metadados obrigatórios. Após aplicar as propostas, TASK-096 fica READY; as demais são liberadas sequencialmente conforme as dependências ficam DONE.
