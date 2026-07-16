# TASK-110 — exploração de componentes base

## Contexto e baseline

- Checkout: `E:\CodeRepo\shop-api\.worktrees\phase-8-hardening`
- `BASE_COMMIT`: `e9d7306`
- Escopo inspecionado: os 19 exports listados no plano (`Button`, `IconButton`, `LinkButton`, `Input`, `Select`, `Checkbox`, `FormErrorSummary`, `QuantityInput`, `Pagination`, `Dialog`, `DropdownMenu`, `DropdownMenuItem`, `InlineAlert`, `Toast`, `EmptyState`, `ErrorState`, `Skeleton`, `Badge`, `Chip`) e seus testes proprietários.
- Baseline executada:

```text
npm --prefix frontend test -- src/shared/ui/buttons/buttons.test.tsx src/shared/ui/forms/forms.test.tsx src/shared/ui/forms/QuantityInput.test.tsx src/shared/ui/navigation/Pagination.test.tsx src/shared/ui/overlays/overlays.test.tsx src/shared/ui/feedback/feedback.test.tsx src/shared/ui/states/states.test.tsx src/shared/ui/indicators/indicators.test.tsx src/shared/ui/surfaces/surfaces.test.tsx

PASS — 9 arquivos, 33 testes, duração 3.72 s, exit code 0.
```

`surfaces/surfaces.test.tsx` foi incluído para confirmar o entorno, mas `Surface` e `Card` não fazem parte dos 19 exports atribuídos à TASK-110.

## Legenda

- **P**: provado diretamente por teste existente.
- **N**: comportamento nativo/implementado, mas sem prova direta no teste proprietário.
- **NA**: critério não aplicável ao componente.
- **GAP**: célula descoberta que merece teste adicional.
- “loading” não é uma prop/estado de nenhum dos 19 exports. O estado visual assíncrono disponível no escopo é `Skeleton`; inventar uma API `loading` para botões ampliaria o escopo sem RED.

## Matriz componente × critério

| Export | Teclado | Foco | Disabled / loading | Error / empty / skeleton | Nome, role, descrição | `aria-current` / live region | Situação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Button | clique e semântica nativa P; Enter/Space N | foco nativo N | disabled P; loading NA | NA | role/name P | NA | GAP: prova explícita Enter/Space e bloqueio disabled |
| IconButton | semântica nativa N | foco nativo N | disabled herdado N; loading NA | NA | label obrigatório e ícone oculto P | NA | GAP: disabled/foco somente se necessário; Button já cobre a primitive |
| LinkButton | ativação nativa N | foco N | disabled/loading NA | NA | role/name/href P | NA | GAP: foco e ativação por Enter não estão provados |
| Input | mudança P; edição nativa | foco nativo N | disabled N; loading NA | erro P | label, hint, invalid e descrição P | NA | GAP: disabled; foco é baixo valor por ser input nativo |
| Select | opções P; mudança/teclado N | foco nativo N | disabled N; loading NA | erro P | combobox/name/descrição P | NA | GAP: mudança por teclado e disabled |
| Checkbox | Space/checked N | foco nativo N | disabled N; loading NA | erro não exercitado | role/name/descrição P | NA | GAP: Space/checked, disabled e descrição de erro |
| FormErrorSummary | link nativo N | `tabIndex=-1` P, foco programático N | NA | error P; vazio P | alert, título e links P | live por `alert` P | GAP: chamar `.focus()` e verificar foco; descrição do campo já é implementada em `Input` |
| QuantityInput | setas/Home/End P; botões P | nativo N | limites e disabled integral P | NA | spinbutton e nomes dos botões P | NA | cobertura suficiente |
| Pagination | setas/Home/End P; botões P | nativo N | limites P | NA | navigation e nomes P | `aria-current=page` P | cobertura suficiente; limite de teclado já provado |
| Dialog | Tab/Shift+Tab/Escape P | inicial, trap e retorno P | closeDisabled P; loading NA | NA | dialog/name; descrição implementada, não testada | NA | GAP pequeno: `aria-describedby`; núcleo integralmente coberto |
| DropdownMenu | setas, Home/End, Enter, Escape P | primeiro/último e retorno P | item disabled implementado, não testado | NA | trigger/menu/menuitem names e roles P | NA | GAP: item disabled deve ser pulado e não ativado |
| DropdownMenuItem | Enter P em item habilitado | navegação P | disabled N | NA | menuitem/name P | NA | mesma GAP do menu |
| InlineAlert | ação é botão nativo N | ação nativa N | NA | error P | alert, título e ação P | `alert` P; variante não-error `status` N | GAP: variante informativa como região viva/status |
| Toast | dismiss por clique P | botão nativo N | NA | error variant não testada | status/texto e nome do dismiss P | `status` P; `aria-live=polite` não afirmado; error/assertive N | GAP: error/assertive e atributo live; teclado do botão é nativo |
| EmptyState | ação nativa N | ação nativa N | NA | empty P | heading, descrição e ação P | NA | cobertura suficiente |
| ErrorState | retry nativo N | ação nativa N | NA | error/retry P | alert, heading/descrição/texto P | `alert` P | cobertura suficiente |
| Skeleton | NA | NA | loading visual P | skeleton P | oculto de AT P | NA | cobertura suficiente; também possui `motion-reduce:animate-none` no produto |
| Badge | NA | NA | NA | status visual P | texto P; não possui role especial | NA | cobertura suficiente para indicador textual |
| Chip | clique P; Enter/Space nativo N | foco nativo N | disabled P | NA | button/name/pressed P | NA | GAP opcional: ativação por teclado; semântica nativa já é preservada |

## Lacunas RED reais

Não foi identificado defeito de produto reproduzível na leitura ou na baseline. Portanto, **não existe RED de produto confirmado** nesta exploração. As lacunas são testes ausentes que devem nascer GREEN se escritos contra os contratos nativos já implementados:

1. `buttons.test.tsx`: ativação por Enter/Space (idealmente com interação de usuário que sintetize clique) e ausência de ativação quando disabled; foco/Enter do `LinkButton`.
2. `forms.test.tsx`: `Input` disabled; `Select` disabled e mudança por teclado; `Checkbox` Space/checked, disabled e erro descrito; foco programático do `FormErrorSummary`.
3. `overlays.test.tsx`: item disabled do menu é ignorado pela navegação e não dispara callback; descrição acessível do dialog.
4. `feedback.test.tsx`: `InlineAlert` não-error como `status`; `Toast` error como `alert`/`aria-live=assertive` e sucesso como `polite`.

Os itens 1–4 são RED de **cobertura** (teste ainda inexistente), não evidência para alterar componentes. Se algum novo teste falhar, aí a falha deve ser reproduzida isoladamente antes de modificar produto.

## Sobre `baseComponents.hardening.test.tsx`

O grande teste proposto no plano duplicaria substancialmente a cobertura:

- replica role/name/href/disabled já cobertos em `buttons.test.tsx`;
- replica label/error/descrição/opções de `forms.test.tsx`;
- replica setas/Home/End/limites de `QuantityInput.test.tsx` e `Pagination.test.tsx`;
- replica toda a prova crítica de foco/Escape/retorno do dialog e teclado do menu de `overlays.test.tsx`;
- replica live regions/dismiss de `feedback.test.tsx`, estados de `states.test.tsx` e tokens/pressed/disabled de `indicators.test.tsx`.

Além disso, os blocos que usam somente `fireEvent.keyDown` em `Button`/`Checkbox` não comprovam ativação nativa: em jsdom, `keyDown` isolado não sintetiza necessariamente o `click` que um navegador produz. A asserção de que um controle disabled não chamou o handler pode passar sem testar o caminho real de ativação.

Recomendação: **não criar o arquivo monolítico**. Acrescentar somente as células GAP nos testes proprietários, mantendo uma linha por export no relatório final `docs/frontend-quality/task-110-component-matrix.md`. Isso satisfaz rastreabilidade com menos duplicação e falhas mais localizadas.

## Conclusão para o implementador

- Produto: nenhuma alteração autorizada pela evidência atual.
- Testes: ampliar apenas as células GAP acima; priorizar disabled/teclado dos controles nativos, menuitem disabled e variantes de live region.
- Matriz final: registrar as 19 linhas e apontar testes proprietários.
- Gates após os novos testes: suíte focada da TASK-110, `npm --prefix frontend run typecheck` e `npm --prefix frontend run lint`.
