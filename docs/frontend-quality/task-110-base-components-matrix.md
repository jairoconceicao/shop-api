# TASK-110 — matriz de componentes base

## Decisão de escopo

Não foi criado `baseComponents.hardening.test.tsx`. A exploração mostrou que esse teste monolítico repetiria provas já localizadas nos testes proprietários e usaria `keydown` artificial para sugerir ativação nativa que o jsdom não sintetiza. O desvio mantém uma única fonte de prova por comportamento e adiciona somente as células GAP.

`@testing-library/user-event` foi adicionado para provar ativação nativa. Button é acionado por Enter e Space, LinkButton navega por Enter e Checkbox alterna por Space. Para `<select>`, `user-event` não implementa a mudança por `ArrowDown` no jsdom; a prova usa foco obtido por Tab seguido de `selectOptions`, o fluxo de seleção suportado pela biblioteca.

## Matriz

| Export | Source | Test | Prova |
| --- | --- | --- | --- |
| Button | `buttons/Button.tsx` | `buttons/buttons.test.tsx` | role/name, foco, ativação por Enter/Space, disabled sem ativação |
| IconButton | `buttons/IconButton.tsx` | `buttons/buttons.test.tsx` | label obrigatório, ícone oculto |
| LinkButton | `buttons/LinkButton.tsx` | `buttons/buttons.test.tsx` | role link, href, foco e navegação por Enter |
| Input | `forms/Input.tsx` | `forms/forms.test.tsx` | label, description, invalid, foco, disabled |
| Select | `forms/Select.tsx` | `forms/forms.test.tsx` | label, opções, foco por Tab, seleção via `user-event`, disabled |
| Checkbox | `forms/Checkbox.tsx` | `forms/forms.test.tsx` | checked por Space, foco, disabled, erro descrito |
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

Não havia RED de produto confirmado. O RED desta correção foi a ausência de `@testing-library/user-event`; após a instalação, Button, LinkButton e Checkbox ficaram GREEN sem alteração de produto. `ArrowDown` no Select permaneceu sem efeito por limitação documentada da implementação da biblioteca, e a prova foi ajustada ao fluxo `selectOptions` suportado. Nenhum arquivo de produto foi alterado.
