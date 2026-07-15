# TASK-097 — Relatório de implementação

Status: DONE

## Arquivos

- `frontend/src/features/orders/services/listOrdersService.ts`
- `frontend/src/features/orders/services/listOrdersService.test.ts`
- `frontend/src/features/orders/queries/useOrdersQuery.ts`
- `frontend/src/features/orders/queries/useOrdersQuery.test.tsx`

## Decisões

- A URL usa `URLSearchParams`, omite período ausente e sempre envia página e tamanho.
- A chave da query contém somente customerId e filtros não sensíveis; CPF e token ficam apenas no `queryFn`.
- Estados inválidos compartilham uma chave neutra e ficam desabilitados.
- O hook reutiliza `useCustomerProfileQuery` e somente consulta pedidos após receber o CPF confirmado.

## TDD

### RED

Comando: `npm run test -- src/features/orders/services/listOrdersService.test.ts src/features/orders/queries/useOrdersQuery.test.tsx`

Resultado: exit 1; 2 suites falharam porque `listOrdersService` e `useOrdersQuery` ainda não existiam.

### GREEN

Comando: `npm run test -- src/features/orders/services/listOrdersService.test.ts src/features/orders/queries/useOrdersQuery.test.tsx src/features/customer/queries/useCustomerProfileQuery.test.tsx`

Resultado final: exit 0; 3 arquivos e 13 testes passaram. Durante o ciclo, uma expectativa de exatamente um render foi substituída por verificação da chamada sem argumentos, pois React Query renderiza novamente ao concluir.

## Verificação final

- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0.
- `npm run test -- src/features/orders`: exit 0; 3 arquivos e 34 testes passaram.
- `git diff --check`: exit 0.

## Self-review

- Escopo restrito à TASK-097; backlog não alterado.
- AbortSignal, adaptação de resposta, parâmetros opcionais, sessão inválida, chave privada e leitura do perfil estão cobertos.
- Nenhum segredo/CPF aparece na chave de cache.

## Commit

- `feat(TASK-097): Consultar pedidos por CPF`

## Concerns

- Nenhum.
