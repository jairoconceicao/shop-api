# TASK-111 — Relatório de exploração

## Estado do workflow

- Worktree: `E:\CodeRepo\shop-api\.worktrees\phase-8-hardening`
- `BASE_COMMIT`: `cbcc2bf2f66e046c09161a858fdc2dc04a789802` (confere com o SHA informado `cbcc2bf`)
- Checkout limpo durante a inspeção.
- TASK-111 está `READY`, possui critérios de aceite e todas as dependências declaradas (TASK-009, 035–040, 061 e 106–110) estão marcadas como concluídas.
- Escopo confirmado como exclusivamente frontend.

## Baseline focada

Comando:

```text
npm --prefix frontend test -- src/features/auth --reporter=verbose
```

Resultado: exit code `0`; 10 arquivos passaram; 56/56 testes passaram; duração Vitest 5,94 s (7,9 s total do comando).

## Superfícies e contratos confirmados

- Login real: `POST /api/v1/auth/login`, body estrito `{ email, senha }`; o schema aplica `trim` antes de validar o e-mail.
- Fixture literal `authSessionFixture`: compatível com o envelope e adapter atuais, inclusive expiração com offset e IDs seguros.
- Checkbox: nome acessível literal `Manter conectado`; botão `Entrar`; campo `E-mail`; senha acessível por `Senha`.
- Persistência: `setSession(..., 'local')` grava `shop-api:auth` somente no `localStorage` e remove a cópia no `sessionStorage`.
- `getInternalReturnTo`: aceita `/pedidos?page=2`; rejeita `https://evil.example/x`, `//evil.example/x`, backslash e entradas não string, retornando `/`.
- Logout real: `POST /api/v1/auth/logout` com Bearer; `useLogoutMutation.onSettled` limpa auth e cache privado e navega para `/entrar` tanto em sucesso quanto em 401/500; retry desabilitado.
- `clearPrivateCache`: remove queries privadas e mutations privadas. A remoção de query cancela/impede reconciliação normal de uma resposta tardia no cache removido; a spec MSW ainda é necessária para provar a corrida ponta a ponta.
- Queries protegidas literais `/api/v1/cliente/7`, `/8` e `/9` usam `token` e `signal`, e `meta: { private: true }`, compatíveis com `apiClient` e a limpeza atual.
- MSW está estrito: `server.listen({ onUnhandledRequest: 'error' })`; handlers globais são vazios.
- `renderIntegration` do plano compõe corretamente MemoryRouter, QueryClient real, `UnauthorizedHandlerProvider`, `AuthSessionInitializer` e `FeedbackProvider`.

## RED esperado e patch literal

O RED autorizado pelo plano é real: `UnauthorizedHandlerProvider.tsx` não exporta `createUnauthorizedHandler` e hoje usa um `useCallback` sem trava. Duas notificações de 401 podem repetir `clearSession`, `clearPrivateCache` e `navigate`.

O patch literal proposto encaixa na implementação atual:

- exporta `UnauthorizedHandlerDependencies` e `createUnauthorizedHandler`;
- troca `useCallback` por `useMemo`;
- preserva exatamente o `returnTo` atual (`pathname + search + hash`), a limpeza e a navegação existentes;
- torna idempotentes chamadas repetidas sobre a mesma instância do handler.

Nota de revisão: como o `useMemo` depende da localização, uma navegação recria o handler. O cenário de dois 401 liberados simultaneamente tende a notificar a mesma instância antes do rerender, mas idempotência atravessando mudanças de localização não é garantida pelo helper literal. A spec planejada deve ser mantida como prova obrigatória.

## Divergências/REDs reais não autorizados pelo plano

### 1. Logout exige apagar `cartSessionStore`, mas o produto preserva esse vínculo

O teste literal chama `seedSession()`, que grava `clienteId 7 -> carrinhoId 70`, e depois exige:

```text
useCartSessionStore.getState().getCartId(7) === undefined
```

Nem `useLogoutMutation.onSettled` nem o handler de 401 limpam `cartSessionStore`; eles limpam somente auth e caches privados. O contrato original da TASK-062 documenta explicitamente que o logout **pode conservar** esse vínculo. Portanto os dois casos parametrizados (401 e 500) falharão nesse assert sem uma mudança de comportamento fora do patch autorizado.

Decisão necessária antes de implementar:

- alinhar o teste/critério ao contrato vigente e não exigir remoção do mapa; ou
- aprovar mudança de produto/backlog para apagar o vínculo no logout/401, com cobertura e impacto nas tasks de carrinho.

Pelo plano (“outros REDs mudam TASK-111 para BLOCKED”), esta divergência bloqueia a cópia literal.

### 2. Login com `AppRouter` produz requests MSW não declarados

Os três casos de login registram somente o handler de `POST /api/v1/auth/login`, mas montam `AppRouter` inteiro:

- `StoreLayout` monta `useCategoriesQuery` e chama `GET /api/v1/categoria` em qualquer rota do shell da loja.
- Os fallbacks externos navegam para `/`, onde `HomePage` também monta catálogo e chama `GET /api/v1/produto?page=1&size=20` (além da categoria deduplicada).
- O retorno válido navega para `/pedidos`; a rota lazy monta fluxo de perfil/pedidos, começando por consulta privada de cliente (e depois lista de pedidos quando houver CPF).

Como os handlers globais são vazios e requests inesperados são erro, o listing não é hermético. Mesmo que o assert de localização passe antes de todas as queries assentarem, a spec deixa requests não tratados e viola a constraint explícita.

Correção de plano recomendada: adicionar handlers MSW mínimos e contratualmente válidos para todos os requests inevitáveis, ou testar `LoginPage` em uma árvore de rotas mínima real (mantendo providers reais) para isolar autenticação. Não relaxar `onUnhandledRequest`.

## Observações adicionais para o implementador

- No logout 401, o próprio `apiClient` notificará o boundary global antes de `onSettled`; haverá duas vias de navegação/limpeza (boundary e mutation). A expectativa de uma única chamada ao endpoint continua correta, mas a spec deve distinguir idempotência do boundary de cleanup redundante do logout.
- `LocationProbe` usa `<output aria-label=...>`; o elemento possui role implícito `status`, portanto o selector planejado é coerente.
- O cenário late 200 deve manter o handler MSW aguardando a promise e o `signal` no `apiClient`; não remover `signal` nem substituir o QueryClient real.
- O teste unitário atual do provider prova apenas um disparo e não cobre coalescência.

## Conclusão

Baseline e patch idempotente estão alinhados, mas TASK-111 deve permanecer bloqueada para implementação literal até o plano resolver as duas divergências acima. Não houve alteração em produto, backlog ou commits nesta exploração.
