# TASK-130 — Exploração do gate final do MVP

## Base e elegibilidade

- `BASE_COMMIT`: `2a8bddf47eb856ebd7fe8ea187fa06173fb176c1`.
- A TASK-130 está `READY`; TASK-106 a TASK-129 estão `DONE`.
- Escopo: executar e registrar o gate final do frontend. Falhas não autorizam
  correção de produto nesta task: a task dona do comportamento deve ser
  reaberta e a TASK-130 volta a `BLOCKED`.
- Esta exploração e o plano são somente documentais. Nenhum gate foi executado.

## Fontes factuais

O `frontend/package.json` expõe os cinco gates pedidos no backlog:

1. `npm run typecheck`;
2. `npm run lint`;
3. `npm test`;
4. `npm run test:e2e`;
5. `npm run build`.

Para comprovar instalação reproduzível, `npm ci` precede esses cinco comandos,
formando a sequência obrigatória de seis comandos. Depois dela, sem substituir
nenhum gate, devem rodar:

- `npm run verify:production-graph`;
- `npm run audit:private-data`;
- busca estática por testes focados ou ignorados;
- `git diff --check` e `git status --short`.

`npm run audit:performance` não deve ser usado no gate final porque repete o
build. A cobertura equivalente e mais precisa é `npm run build` seguido de
`npm run verify:production-graph`.

## Isolamento e evidência

O gate deve ocorrer em worktree temporário detached no commit exato aprovado
para execução, nunca no checkout da feature. O caminho deve ser irmão dos
outros worktrees sob o diretório administrativo compartilhado e validado por
`git worktree list --porcelain` antes de criação e remoção.

Logs, resumo e arquivo de durações devem ficar fora do worktree validado, em um
diretório temporário absoluto criado com `Join-Path ([IO.Path]::GetTempPath())`.
Assim, a coleta não suja o checkout e o `git status --short` continua sendo uma
evidência útil. Cada comando deve:

- executar sequencialmente, sem continuar depois de exit code diferente de 0;
- ser medido por um `System.Diagnostics.Stopwatch` próprio;
- gravar stdout e stderr juntos em um log externo;
- registrar comando, início UTC, duração, exit code, status antes de eventual
  normalização e status final;
- exigir exit code 0 e status vazio antes de avançar.

O E2E deve ser chamado com `CI=true`, o que ativa `forbidOnly`, retries e um
worker na configuração Playwright. O runner já é a fonte de page errors,
console errors e falhas de assertions das specs. Vitest já reporta unhandled
errors/rejections no resumo e encerra com falha quando eles existem. Portanto,
o executor não deve inventar `process.on`, listeners de browser ou alterar
configuração: ele preserva o log integral, exige exit code 0 e o resumo
estruturado de sucesso do runner. Cabeçalhos como `Unhandled Errors`,
`Unhandled Rejection`, `Test runner error` e `Worker process exited
unexpectedly` são sinais para revisão, não falha autônoma por substring.

## Integridade do checkout

`npm ci` pode normalizar somente a terminação de linha de
`frontend/public/mockServiceWorker.js`. Se isso ocorrer e
`git diff --ignore-space-at-eol --exit-code -- frontend/public/mockServiceWorker.js`
confirmar ausência de mudança semântica, o executor deve registrar o fato e
restaurar apenas esse arquivo com
`git restore --source=HEAD --worktree -- frontend/public/mockServiceWorker.js`.
Não restaurar qualquer outro arquivo e não usar `reset --hard`.

Depois de cada comando, qualquer outro status é falha do gate. Os diretórios
ignorados `node_modules`, `dist`, `test-results` e `playwright-report` podem
existir, mas nenhum artifact pode aparecer como tracked ou untracked.

Chamadas incondicionais a `.only` e `.skip` são proibidas. Formas
condicionais devem ser inventariadas por regex precisa ou AST e revisadas
manualmente; uma regex ampla não pode reprovar um skip condicionado legítimo.

## Política de falha e ownership

- Interromper no primeiro comando com exit code não zero, status inesperado,
  teste `.only`/`.skip`, erro não tratado ou auditoria reprovada.
- Preservar logs externos e identificar a task dona pelo arquivo/feature e pelo
  histórico do backlog.
- Não editar produto, teste ou configuração na TASK-130.
- Classificar antes de atribuir ownership. Falhas de ambiente, infraestrutura
  ou do executor deixam TASK-130 não concluída/bloqueada sem reabrir task
  funcional.
- Reabrir a task dona somente após reprodução e evidência associarem a falha
  ao comportamento introduzido ou coberto por ela.
- Depois da correção, revisão e novo `DONE` da task dona, criar um novo commit
  alvo e repetir o gate inteiro desde `npm ci`; não reaproveitar resultados.

## Cleanup seguro

Todo o fluxo posterior a `git worktree add` deve estar em um `try/finally`
externo. O `finally` captura HEAD, status, diff binário, lista de arquivos e
worktrees em logs externos antes de considerar remoção. Antes de remover,
resolver o
caminho absoluto e comprovar que ele é exatamente o caminho temporário
registrado e está listado por `git worktree list --porcelain`. Usar
`git worktree remove --force -- <caminho>` somente se o checkout estiver limpo,
contiver apenas EOL semântico-zero já restaurado, ou se qualquer alteração real
já estiver arquivada externamente. Se a captura falhar, manter o worktree para
investigação. Depois da remoção segura, executar `git worktree prune`.

## Conclusão esperada

Após os seis comandos, auditorias, diff e status aprovados, um revisor
independente deve conferir o commit alvo, os logs, as durações, contagens,
ausência de testes focados/ignorados e o cleanup. Somente após aprovação sem
findings CRITICAL ou IMPORTANT o backlog pode marcar TASK-130 `DONE` e receber
a evidência final.
