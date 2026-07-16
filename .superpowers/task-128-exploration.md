# TASK-128 — Exploração da auditoria de acessibilidade

## Base e escopo

- `BASE_COMMIT`: `f6bc9e502bbeb2d81896e2439c83c082cef5be47`.
- A TASK-128 está `READY`; todas as dependências estão `DONE`.
- Escopo: auditoria E2E de composição, correções mínimas reproduzidas por RED,
  checklist manual e evidências em artifacts do Playwright.
- Esta exploração não altera dependências, testes nem código de produção.

## Cobertura existente e fronteira

TASK-110 já cobre primitives isoladas: `Dialog`, `DropdownMenu`, inputs,
feedback, focus trap e restauração. TASK-128 deve verificar essas garantias
nas jornadas reais, além de landmarks, headings, regiões vivas, contraste e
movimento reduzido.

A matriz responsiva de 65 estados da TASK-127 não deve ser repetida. A
auditoria de acessibilidade usará uma jornada desktop representativa com os
estados que mudam a árvore semântica:

1. catálogo com produto;
2. login com erro de validação;
3. cadastro com resumo de erros;
4. carrinho e dialog de remoção;
5. checkout;
6. conta, alteração de CPF e dialog de confirmação;
7. pedido e dialog de cancelamento.

Esses estados cobrem os shells público/privado, formulários, menus, dialogs,
feedback e as principais famílias de conteúdo sem multiplicar a matriz por
viewports.

## Reprodução do foco após rota

Foi iniciado o frontend de produção E2E e executada navegação somente por
teclado:

1. abrir `/entrar`;
2. focar o link `Criar agora`;
3. pressionar `Enter`;
4. aguardar `/cadastro` e o heading `Cadastro de cliente`;
5. inspecionar `document.activeElement`.

Resultado:

```text
before: A "Criar agora" href="/cadastro"
after:  BODY, sem id e sem tabindex
```

O link desmontado perde foco e nenhuma região da nova página o recebe. A
implementação deve criar um boundary global, acionado por mudança de
`pathname/search/hash`, que focaliza o `h1` principal com `tabIndex={-1}` após
o conteúdo da rota estabilizar. O boundary não deve roubar foco em mudanças
internas da mesma localização nem interferir na restauração explícita de
`Dialog` e `DropdownMenu`.

## Semântica e nomes

- Exigir exatamente um `main` e um `h1` por estado.
- Exigir nomes acessíveis não vazios para links, botões, campos, menus,
  dialogs e regiões de navegação.
- O header renderiza duas buscas responsivas com o mesmo nome `Buscar
  produtos`. Isso é aceitável somente se uma estiver efetivamente oculta da
  árvore de acessibilidade no breakpoint; a auditoria deve falhar quando duas
  regiões `search` nomeadas e simultaneamente perceptíveis forem expostas.
- Landmarks repetidos (`nav`, `search`) precisam de nomes distintos.
- Headings não podem saltar nível dentro da mesma seção sem justificativa.

## Jornada somente por teclado

O teste não usa `.click()` nos checkpoints de teclado. `Tab`, `Shift+Tab`,
`Enter`, `Space`, setas e `Escape` devem:

- percorrer controles em ordem visual previsível e com foco visível;
- abrir o menu de conta, mover entre itens, fechar com `Escape` e restaurar o
  trigger;
- abrir dialogs de carrinho, CPF e pedido, manter `Tab`/`Shift+Tab` dentro do
  dialog, iniciar na ação segura e restaurar o trigger ao fechar;
- submeter login e cadastro inválidos e focalizar o resumo de erros;
- navegar entre rotas e focalizar o novo `h1`.

O auditor de foco deve comprovar que o elemento ativo é visível, possui caixa
positiva e apresenta outline ou box-shadow perceptível no estado
`:focus-visible`.

## Axe e artifacts

Adicionar `@axe-core/playwright` como `devDependency`, atualizando
`frontend/package.json` e `frontend/package-lock.json` pelo npm. Cada estado
executa `new AxeBuilder({ page }).analyze()` e falha em violações com
`impact === "serious"` ou `"critical"`.

O resultado completo de cada estado, inclusive violações menores, deve ser
anexado como JSON via `testInfo.attach`; screenshots de checkpoints e findings
também são attachments, nunca arquivos rastreados.

## Contraste computado

O auditor deve medir pares reais de foreground/background no browser:

- resolver `color` e a cadeia de backgrounds até obter cor opaca;
- compor canais alpha antes de calcular luminância relativa;
- exigir `4.5:1` para texto normal e `3:1` para texto grande
  (`>= 24px`, ou `>= 18.66px` com peso `>= 700`);
- ignorar apenas controles realmente `disabled` ou `aria-disabled="true"`;
- registrar seletor/label, cores compostas, tamanho, peso e razão.

Classes `text-zinc-500` e `text-zinc-600` são candidatas, não findings
automáticos. Devem ser corrigidas caso a caso somente quando o RED medir razão
abaixo do threshold no background efetivo. Não haverá substituição global de
tokens.

## Regiões vivas e movimento reduzido

Erros de login/cadastro devem usar `role="alert"` ou região assertiva,
associar campos por `aria-describedby`/`aria-invalid` e focalizar o resumo.
Status assíncronos e toasts de sucesso devem usar região `polite`; mensagens
não podem ser anunciadas por duplicidade de regiões aninhadas.

Com `page.emulateMedia({ reducedMotion: "reduce" })`, o auditor deve medir
estilos computados e comprovar:

- `html` e elementos auditados com `scroll-behavior: auto`;
- animações não essenciais com duração efetiva `<= 0.01ms` e uma iteração;
- transições não essenciais com duração efetiva `<= 0.01ms`.

O CSS global já contém essa política; o teste deve prová-la na composição.

## Gates e estabilidade

- spec isolada: PASS;
- spec isolada `--workers=1 --repeat-each=10`: 10/10;
- suíte Chromium completa;
- suíte Chromium completa `--repeat-each=2`;
- `npm run typecheck`;
- `npm run lint`;
- `npm test`;
- `npm run build`;
- `git diff --check f6bc9e5..HEAD`;
- nenhum artifact Playwright rastreado.

## Arquivos prováveis

- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/e2e/accessibility.spec.ts`
- `frontend/e2e/support/accessibilityAudit.ts`
- `frontend/src/app/router/RouteFocusBoundary.tsx`
- `frontend/src/app/router/AppRouter.tsx`
- componentes apontados por REDs de semântica, live region ou contraste
- `.superpowers/task-128-implementation-report.md`
- `docs/frontend-tasks-v2.md` somente após revisão aprovada

## Fora de escopo

- matriz 65× da TASK-127;
- conformidade WCAG AAA;
- redesign ou mudança preventiva de paleta;
- correção em massa de `zinc-500/600`;
- backend;
- snapshots visuais versionados;
- aceitar violações serious/critical por allowlist.
