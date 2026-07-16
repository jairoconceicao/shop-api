# TASK-110 — relatório de implementação

## Contexto

- Worktree: `E:\CodeRepo\shop-api\.worktrees\phase-8-hardening`
- BASE_COMMIT: `e9d7306`
- Escopo: testes proprietários dos componentes base e matriz de rastreabilidade.
- Backlog: não alterado; a task permanece aguardando revisão.

## Decisão e desvio do plano

O arquivo monolítico `baseComponents.hardening.test.tsx` não foi criado. A exploração demonstrou duplicação substancial da cobertura proprietária e risco de atribuir ativação nativa a `fireEvent.keyDown`, que o jsdom não sintetiza. Foram adicionadas somente provas GAP em `buttons.test.tsx`, `forms.test.tsx`, `overlays.test.tsx` e `feedback.test.tsx`. A decisão está registrada em `docs/frontend-quality/task-110-base-components-matrix.md`.

`@testing-library/user-event` não está instalado. Eventos de teclado, foco, mudança e semântica nativa foram provados separadamente, sem afirmar ativação nativa por `keydown` artificial.

## TDD honesto

Não foi encontrado RED de produto. A cobertura nova nasceu GREEN contra as interfaces existentes, portanto nenhum arquivo de produto foi alterado.

A primeira execução focada terminou com 26/27 testes: `fireEvent.click` alternou o estado interno de um checkbox disabled no jsdom. Isso foi classificado como artefato da simulação, não defeito do componente. A prova foi corrigida para validar a semântica disabled sem executar um clique artificial que diverge do navegador.

## Cobertura adicionada

- Button: foco, encaminhamento de Enter/Space e bloqueio de click disabled.
- LinkButton: foco, href e encaminhamento de Enter.
- Input: foco e disabled.
- Select: foco, evento de teclado, mudança e disabled.
- Checkbox: foco, Space registrado, checked via click, erro descrito e disabled.
- FormErrorSummary: foco programático.
- Dialog: descrição acessível.
- DropdownMenuItem: item disabled ignorado pela navegação e callback bloqueado.
- InlineAlert: variante não-error como status.
- Toast: live regions polite e assertive.

## Verificações

1. Baseline ampliada `shared/ui`: 9 arquivos, 43/43 testes, exit 0.
2. Layouts e consumers relevantes: 13 arquivos, 136/136 testes, exit 0.
3. `npm --prefix frontend run typecheck`: exit 0.
4. `npm --prefix frontend run lint`: exit 0.
5. `git diff --check e9d7306 --`: exit 0; somente avisos informativos LF/CRLF.

## Arquivos da task

- `frontend/src/shared/ui/buttons/buttons.test.tsx`
- `frontend/src/shared/ui/forms/forms.test.tsx`
- `frontend/src/shared/ui/overlays/overlays.test.tsx`
- `frontend/src/shared/ui/feedback/feedback.test.tsx`
- `docs/frontend-quality/task-110-base-components-matrix.md`
- `.superpowers/task-110-report.md`

## Estado para revisão

- Produto inalterado.
- Backlog não marcado como DONE.
- Findings conhecidos: nenhum; revisão independente ainda necessária.
