# TASK-106 — relatório de implementação

## Resultado

**DONE_WITH_CONCERNS** — os critérios próprios da TASK-106 estão GREEN. A suíte ampliada de consumidores expôs quatro falhas preexistentes/date-sensitive em `LoginPage.test.tsx`, reproduzidas isoladamente e não corrigidas por estarem fora do escopo.

## BASE e mudanças

- BASE_COMMIT: `3c7e575b60a7ef1c613c54c72ab844765567b68b`
- Commit de implementação: `bb8a56be042dcc7ac6550dcc860e34c451eefa4a` (`test(TASK-106): Endurecer contratos do frontend`)
- Produto: envelopes e objetos Zod estritos; IDs numéricos com `.int().safe()`; valores numéricos com `.finite()`.
- Testes: propriedades extras por nível, paginação unsafe e os cinco status canônicos de pedido.
- Documentação: `docs/frontend-quality/task-106-contract-matrix.md` registra campos, nullability, enums e cobertura reutilizada.
- Incidental removido: `frontend/public/mockServiceWorker.js` tinha somente alteração de line ending e foi restaurado.
- `CategoriaResponse.descricao` continua nullable conforme decisão explícita de compatibilidade; a divergência do OpenAPI permanece separada.

## TDD — RED e GREEN

### RED reconstruído

O implementador anterior foi interrompido com testes e produto no mesmo working tree, sem relatório ou captura do comando RED. A evidência reconstruível é:

- baseline do explorador no BASE: **10 arquivos / 168 testes PASS**;
- o diff interrompido adicionou expectativas de rejeição de propriedades extras e inteiros inseguros enquanto o BASE usava `z.object(...)` permissivo, `z.number().int()` e `z.number()`;
- portanto esses casos falham contra o BASE por aceitarem/removerem extras e aceitarem números fora das novas barreiras, mas não há alegação de que o RED foi observado ao vivo pelo implementador anterior.

Durante a retomada, o primeiro GREEN focado falhou em **2/178** casos porque a fixture de detalhe carregava o campo de catálogo `thumb`. O schema estrito rejeitou corretamente esse campo. A fixture foi separada por contrato e a execução seguinte ficou GREEN.

### GREEN focado

Comando:

`npm --prefix frontend test -- src/shared/adapters/numbers.test.ts src/shared/contracts/apiEnvelopes.test.ts src/features/auth/contracts/login.test.ts src/features/catalog/contracts/catalog.test.ts src/features/cart/contracts/cart.test.ts src/features/checkout/contracts/checkout.test.ts src/features/checkout/contracts/order.test.ts src/features/customer/contracts/registration.test.ts src/features/customer/contracts/customerProfile.test.ts src/features/orders/contracts/orders.test.ts`

Resultado: **10 arquivos / 183 testes PASS**, exit `0`.

## Gates

| Gate | Resultado |
| --- | --- |
| `git diff --check` | PASS |
| `npm --prefix frontend run typecheck` | PASS |
| `npm --prefix frontend run lint` | PASS |
| Consumers: `npm --prefix frontend test -- src/features/auth src/features/catalog src/features/cart src/features/checkout src/features/customer src/features/orders` | **88 arquivos; 603 PASS / 4 FAIL** |
| Reprodução: `npm --prefix frontend test -- src/features/auth/pages/LoginPage.test.tsx` | **2 PASS / 4 FAIL** |

## Concern externo

As quatro falhas de `LoginPage.test.tsx` são reproduzíveis isoladamente. Duas fixtures de login usam `expiraEm: 2026-07-14T18:00:00-03:00`, já expirado na execução de 2026-07-16, impedindo persistência/navegação. Os quatro casos também dependem da integração MSW compartilhada e não exercitam uma regressão específica dos schemas focados. Corrigir relógio/fixtures ou infraestrutura de login pertence à task dona desses testes, não à TASK-106.

## Self-review

- Nenhuma mudança de backend ou backlog.
- Nenhuma propriedade nullable removida.
- Strictness aplicada somente onde havia lacuna documentada.
- Barreiras numéricas mantêm os adapters como segunda validação e não alteram regras de positivo/não negativo.
- Enums usam exports canônicos, sem listas paralelas.
- Matriz documenta cobertura existente para evitar testes equivalentes duplicados.
- Nenhum finding conhecido CRITICAL ou IMPORTANT no diff próprio; revisão independente ainda é obrigatória antes de marcar o backlog como DONE.
