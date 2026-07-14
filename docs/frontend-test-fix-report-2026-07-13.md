# Relatório de correção dos testes do frontend

Data: 13/07/2026

## Resultado

- Suíte Vitest: 39 arquivos aprovados, 191 testes aprovados.
- TypeScript: aprovado com `tsc -b`.
- ESLint: aprovado.
- Build de produção: falhou por uma incompatibilidade preexistente entre o
  top-level await de `enableMocking()` e o target padrão do Vite.

## Causas raiz corrigidas

1. O webstorage experimental do Node 26 sobrescrevia o `localStorage` do
   jsdom com `undefined`. Os workers do Vitest agora desativam essa API
   experimental e usam o storage do ambiente de navegador.
2. O cliente HTTP capturava o `fetch` nativo durante a importação do módulo,
   antes de o MSW instalar seus interceptadores. O `fetch` agora é resolvido
   no momento da requisição, mantendo a injeção explícita para testes unitários.
3. Os testes de rotas não forneciam `QueryClientProvider` às páginas que
   passaram a usar mutations do TanStack Query.
4. Duas expectativas estavam desatualizadas em relação à interface atual:
   o título acessível do cadastro e a duplicação intencional das mensagens de
   erro no resumo e junto ao campo.

## Arquivos alterados

- `frontend/vite.config.ts`
- `frontend/src/shared/api/apiClient.ts`
- `frontend/src/App.test.tsx`
- `frontend/src/features/customer/pages/RegistrationPage.test.tsx`

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| `npm test` | 39 arquivos e 191 testes aprovados |
| `npm run typecheck` | Aprovado |
| `npm run lint` | Aprovado |
| `npm run build` | Falhou: top-level await fora do target configurado |

## Pendência identificada

O build para produção encontra `await enableMocking()` no topo do bundle e
falha porque o target configurado inclui ambientes sem suporte a top-level
await. Essa pendência não foi causada pelas correções de testes e deve ser
tratada em uma tarefa própria, definindo o carregamento assíncrono da aplicação
ou ajustando conscientemente o target de navegadores.
