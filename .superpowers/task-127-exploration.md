# TASK-127 — Exploração da auditoria responsiva

## Base e escopo

- `BASE_COMMIT`: `9f0095161597e03d5dfcf36065f36e280aa6809f`
- A TASK-127 está `READY` e todas as dependências estão `DONE`.
- Escopo: frontend, teste E2E responsivo, marcação documental dos scrollers
  intencionais, relatório e rastreabilidade.
- Esta exploração não altera código de produção.

## Resultado da inspeção

A inspeção manual/automatizada inicial cobriu 13 estados em cada uma das cinco
larguras exigidas (`320`, `375`, `768`, `1024` e `1920` px): 65 de 65
combinações não apresentaram overflow horizontal no documento.

Os 13 estados são:

1. catálogo;
2. detalhe de produto;
3. login;
4. cadastro;
5. carrinho preenchido;
6. dialog de remoção do carrinho;
7. checkout;
8. confirmação do pedido;
9. dados pessoais;
10. alteração de senha;
11. lista de pedidos;
12. detalhe do pedido;
13. dialog de cancelamento do pedido.

A seleção cobre todas as famílias de layout da aplicação, os formulários
públicos e privados, os dois dialogs de confirmação, cartões/listas com dados,
checkout e as seis rotas lazy. A página 404 não introduz um shell diferente e
fica coberta pelos testes de layout existentes; adicioná-la elevaria custo sem
aumentar a cobertura dos critérios da task.

## Rolagem horizontal intencional

Existem exatamente três scrollers horizontais deliberados:

| Componente | Elemento | Motivo |
|---|---|---|
| `Header` | navegação de categorias | mantém nomes de categorias em uma linha no mobile |
| `AccountLayout` | navegação da conta | mantém três destinos acionáveis sem comprimir os rótulos |
| `Pagination` | lista de páginas | mantém botões de 40 px utilizáveis em paginações extensas |

Eles usam `overflow-x-auto`, mas ainda não possuem documentação semântica
consumível pela auditoria. A implementação deve adicionar somente
`data-responsive-overflow="categories"`,
`data-responsive-overflow="account-navigation"` e
`data-responsive-overflow="pagination"` nos elementos que já rolam. O atributo
é uma allowlist explícita, não um seletor de produto nem permissão genérica.

Conteúdo descendente desses três elementos pode ultrapassar o `clientWidth` do
scroller, mas o scroller e seus ancestrais não podem ultrapassar o documento.
Qualquer quarto marcador, marcador com valor desconhecido ou overflow fora do
ancestral marcado deve falhar.

## Estratégia de teste

Usar uma spec Playwright data-driven com uma jornada sequencial por viewport.
Cada uma das cinco jornadas:

1. recebe `test.use({ viewport })` por bloco ou projeto local;
2. usa o `authApi` isolado e um cliente semeado próprio;
3. percorre os 13 estados na mesma página/sessão;
4. executa o auditor após a estabilização semântica de cada estado;
5. anexa uma screenshot de página inteira com `testInfo.attach`;
6. termina com ledger exato de todas as requests.

Isso produz cinco testes e 65 checkpoints. Os cinco testes podem executar em
paralelo ou ser distribuídos com `--shard=1/5` a `--shard=5/5`; dentro de cada
teste os estados permanecem sequenciais para reutilizar login, carrinho e
pedido. Screenshots ficam nos artefatos do Playwright e não entram no Git.

## Helpers necessários

`frontend/e2e/support/responsiveAudit.ts` deve concentrar:

- a tupla literal dos cinco viewports;
- a tupla literal dos 13 estados;
- `assertResponsiveDocument(page, expectedMarkers)`, que comprova
  `document.documentElement.scrollWidth <= clientWidth`;
- coleta de offenders por geometria e por `scrollWidth > clientWidth`;
- reconhecimento exclusivo dos três valores de `data-responsive-overflow`;
- prova de que o próprio scroller permitido está contido no documento;
- `assertActionableControls(page, scope?)`, que verifica controles visíveis,
  habilitados, com caixa positiva e inteiramente alcançáveis na horizontal;
- `attachResponsiveScreenshot(page, testInfo, viewport, state)`, usando
  `page.screenshot({ fullPage: true })` e `testInfo.attach`.

O diagnóstico de falha deve listar tag, role/nome quando disponíveis, marcador,
`scrollWidth`, `clientWidth` e retângulo. Não deve corrigir ou esconder
offenders.

## Formulários, dialogs e controles

- Login e cadastro: preencher ao menos um campo e confirmar que inputs e botão
  permanecem visíveis e acionáveis; não enviar cadastro para evitar mutação
  desnecessária.
- Carrinho: abrir o dialog de remoção, auditar dialog e botões, fechá-lo pela
  ação de cancelar para preservar o item.
- Checkout: preencher/alterar o campo de logradouro e selecionar pagamento;
  enviar uma vez para alcançar confirmação.
- Dados pessoais e senha: preencher campos sem submeter mutations; provar
  campos e submitters acionáveis.
- Detalhe do pedido: abrir o dialog de cancelamento, auditar conteúdo e ações e
  fechá-lo sem enviar o PATCH.

“Acionável” significa visível, habilitado, com bounding box não nula, sem corte
horizontal pelo viewport e capaz de receber a ação Playwright correspondente.
Não exige todos os elementos simultaneamente dentro da altura; rolagem vertical
é permitida.

## Requests e isolamento

- Cada viewport usa a fixture `authApi`, `seedCustomer()` e storages limpos.
- A navegação acontece somente pela UI ou por `page.goto` para rotas públicas;
  estado privado não é escrito diretamente.
- A primeira execução RED registra o ledger real da jornada. Antes do GREEN,
  `expectRequestCounts` deve conter todas as 19 chaves, inclusive zeros, e o
  relatório deve registrar o objeto exato.
- O mock continua abortando toda rota inesperada, validando método, autorização,
  query e body.
- A repetição isolada deve usar `--workers=1 --repeat-each=5`; a suíte completa
  deve rodar normalmente e com `--repeat-each=2`.

Como o fixture atual retorna catálogo vazio e apenas uma página de pedidos, a
implementação deve adicionar `enableResponsiveCatalog()` ao `authApi`. Quando
ativado, somente o GET de catálogo retorna o produto determinístico, dez
páginas e total coerente, tornando `Pagination` visível. O modo deve iniciar
desligado e voltar a `false` em `reset()`, sem alterar specs existentes. Não se
deve afrouxar contratos existentes.

## Política de correção

O baseline de 65/65 sem overflow indica que não há correção CSS justificada.
Primeiro escrever e executar o teste para obter um RED estrutural pela ausência
dos três marcadores documentais. Adicionar os marcadores é o GREEN esperado.

CSS só pode ser alterado se o teste reproduzir um offender real em uma das 65
combinações. Nesse caso:

1. registrar estado, viewport, seletor diagnóstico e screenshot;
2. criar um RED focado;
3. aplicar a menor correção no componente responsável;
4. repetir as 65 combinações.

Não são permitidos `overflow-x-hidden` no documento, allowlists genéricas,
tolerâncias em pixels ou exclusões por seletor arbitrário.

## Gates

- spec isolada: 5/5;
- repetição isolada: 25/25;
- Chromium completo;
- Chromium completo com `--repeat-each=2`;
- `npm run typecheck`;
- `npm run lint`;
- `npm test`;
- `npm run build`;
- `git diff --check BASE_COMMIT..HEAD`;
- worktree limpo após relatório e revisão.

## Arquivos prováveis

- `frontend/e2e/responsive.spec.ts`
- `frontend/e2e/support/responsiveAudit.ts`
- `frontend/src/app/layouts/Header.tsx`
- `frontend/src/app/layouts/AccountLayout.tsx`
- `frontend/src/shared/ui/navigation/Pagination.tsx`
- `frontend/e2e/support/authApi.ts` — modo opt-in de catálogo paginado
- `.superpowers/task-127-implementation-report.md`
- `docs/frontend-tasks-v2.md` somente após revisão aprovada

## Fora de escopo

- redesign visual;
- novos breakpoints;
- correções preventivas de CSS sem RED;
- auditoria completa de teclado, foco, contraste ou movimento da TASK-128;
- alteração de backend;
- snapshots visuais versionados;
- inclusão de screenshots ou resultados Playwright no Git.
