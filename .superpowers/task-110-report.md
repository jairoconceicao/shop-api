# TASK-110 — relatório de implementação

## Contexto

- Worktree: `E:\CodeRepo\shop-api\.worktrees\phase-8-hardening`
- BASE_COMMIT: `e9d7306`
- Escopo: testes proprietários dos componentes base e matriz de rastreabilidade.
- Backlog: não alterado; a task permanece aguardando revisão.

## Decisão e desvio do plano

O arquivo monolítico `baseComponents.hardening.test.tsx` não foi criado. A exploração demonstrou duplicação substancial da cobertura proprietária e risco de atribuir ativação nativa a `fireEvent.keyDown`, que o jsdom não sintetiza. Foram adicionadas somente provas GAP em `buttons.test.tsx`, `forms.test.tsx`, `overlays.test.tsx` e `feedback.test.tsx`. A decisão está registrada em `docs/frontend-quality/task-110-base-components-matrix.md`.

Após o finding IMPORTANT da revisão, `@testing-library/user-event` foi instalado e as provas artificiais de `keydown` foram substituídas por interação real. Button ativa por Enter/Space, LinkButton navega por Enter e Checkbox alterna por Space. O Select recebe foco por Tab e muda por `selectOptions`; a versão instalada de `user-event` não implementa alteração de `<select>` por `ArrowDown` no jsdom.

## TDD honesto

Não foi encontrado RED de produto. A cobertura nova nasceu GREEN contra as interfaces existentes, portanto nenhum arquivo de produto foi alterado.

A primeira execução focada terminou com 26/27 testes: `fireEvent.click` alternou o estado interno de um checkbox disabled no jsdom. Isso foi classificado como artefato da simulação, não defeito do componente. A prova foi corrigida para validar a semântica disabled sem executar um clique artificial que diverge do navegador.

Na correção do finding, o RED focado falhou em 2/2 suites porque `@testing-library/user-event` ainda não existia. Após a instalação, 16/17 testes passaram; apenas o Select permaneceu no valor inicial ao receber `ArrowDown`, comportamento coerente com a implementação da biblioteca. A prova foi ajustada para seu fluxo suportado `selectOptions`, sem alterar produto.

## Cobertura adicionada

- Button: foco, ativação nativa por Enter/Space e bloqueio disabled.
- LinkButton: foco, href e navegação por Enter.
- Input: foco e disabled.
- Select: foco por Tab, seleção suportada por `user-event` e disabled.
- Checkbox: foco, checked por Space, erro descrito e disabled.
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

Após a correção do finding IMPORTANT, a verificação foi repetida: RED de 2 suites por dependência ausente; GREEN focado 17/17; shared UI 43/43; consumers 136/136; typecheck, lint e diff-check com exit 0.

## Arquivos da task

- `frontend/src/shared/ui/buttons/buttons.test.tsx`
- `frontend/src/shared/ui/forms/forms.test.tsx`
- `frontend/src/shared/ui/overlays/overlays.test.tsx`
- `frontend/src/shared/ui/feedback/feedback.test.tsx`
- `frontend/package.json`
- `frontend/package-lock.json`
- `docs/frontend-quality/task-110-base-components-matrix.md`
- `.superpowers/task-110-report.md`

## Estado para revisão

- Produto inalterado.
- Backlog não marcado como DONE.
- Findings conhecidos: nenhum; revisão independente ainda necessária.
