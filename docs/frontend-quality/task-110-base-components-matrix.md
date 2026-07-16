# TASK-110 — matriz de componentes base

## Decisão de escopo

Não foi criado `baseComponents.hardening.test.tsx`. A exploração mostrou que esse teste monolítico repetiria provas já localizadas nos testes proprietários e usaria `keydown` artificial para sugerir ativação nativa que o jsdom não sintetiza. O desvio mantém uma única fonte de prova por comportamento e adiciona somente as células GAP.

`@testing-library/user-event` não faz parte das dependências. Por isso, os testes separam: eventos de teclado encaminhados, foco programático e semântica nativa. Eles não afirmam que `fireEvent.keyDown` produz o clique gerado pelo navegador para Enter ou Space.

## Matriz

| Export | Source | Test | Prova |
| --- | --- | --- | --- |
| Button | `buttons/Button.tsx` | `buttons/buttons.test.tsx` | role/name, foco, Enter/Space encaminhados, disabled sem click |
| IconButton | `buttons/IconButton.tsx` | `buttons/buttons.test.tsx` | label obrigatório, ícone oculto |
| LinkButton | `buttons/LinkButton.tsx` | `buttons/buttons.test.tsx` | role link, href, foco e Enter encaminhado |
| Input | `forms/Input.tsx` | `forms/forms.test.tsx` | label, description, invalid, foco, disabled |
| Select | `forms/Select.tsx` | `forms/forms.test.tsx` | label, opções, foco, teclado/change, disabled |
| Checkbox | `forms/Checkbox.tsx` | `forms/forms.test.tsx` | checked, foco/Space, disabled, erro descrito |
| FormErrorSummary | `forms/FormErrorSummary.tsx` | `forms/forms.test.tsx` | alert, `fieldId`, foco programático |
| QuantityInput | `forms/QuantityInput.tsx` | `forms/QuantityInput.test.tsx` | nomes, setas, Home/End, limites |
| Pagination | `navigation/Pagination.tsx` | `navigation/Pagination.test.tsx` | navigation, `aria-current`, setas, limites |
| Dialog | `overlays/Dialog.tsx` | `overlays/overlays.test.tsx` | role/name/description, foco, trap, Escape, retorno |
| DropdownMenu | `overlays/DropdownMenu.tsx` | `overlays/overlays.test.tsx` | trigger, menu, setas, Escape, salto de item disabled |
| DropdownMenuItem | `overlays/DropdownMenu.tsx` | `overlays/overlays.test.tsx` | menuitem, navegação, disabled sem callback |
| InlineAlert | `feedback/InlineAlert.tsx` | `feedback/feedback.test.tsx` | alert/status, título, ação |
| Toast | `feedback/Toast.tsx` | `feedback/feedback.test.tsx` | status/alert, `polite`/`assertive`, dismiss, nome |
| EmptyState | `states/EmptyState.tsx` | `states/states.test.tsx` | heading, descrição, ação |
| ErrorState | `states/ErrorState.tsx` | `states/states.test.tsx` | alert, retry |
| Skeleton | `states/Skeleton.tsx` | `states/states.test.tsx` | `aria-hidden=true` |
| Badge | `indicators/Badge.tsx` | `indicators/indicators.test.tsx` | texto e token de status |
| Chip | `indicators/Chip.tsx` | `indicators/indicators.test.tsx` | button, pressed, disabled |

## TDD e produto

Não havia RED de produto confirmado. A cobertura nova nasceu majoritariamente GREEN contra as interfaces existentes. A única falha inicial veio de `fireEvent.click` alternando um checkbox disabled no jsdom; a simulação foi removida porque não corresponde à ativação nativa do navegador. Nenhum arquivo de produto foi alterado.
