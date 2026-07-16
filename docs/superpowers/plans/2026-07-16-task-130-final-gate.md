# TASK-130 Final Gate do MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Executar em checkout limpo e imutável os gates finais do frontend, preservar evidência reproduzível e concluir o MVP somente após revisão independente.

**Architecture:** Criar um worktree temporário detached no commit aprovado e manter todos os logs fora dele. Um executor PowerShell roda seis comandos obrigatórios em ordem, mede cada um, interrompe no primeiro erro e então executa auditorias complementares e verificações Git; nenhuma falha é corrigida dentro da TASK-130.

**Tech Stack:** Git worktrees, PowerShell, npm, TypeScript, ESLint, Vitest, Playwright Chromium, Vite e auditores Node versionados.

## Global Constraints

- `BASE_COMMIT`: `2a8bddf47eb856ebd7fe8ea187fa06173fb176c1`.
- Não executar o gate durante planejamento ou revisão do plano.
- O commit alvo é o `HEAD` aprovado imediatamente antes da execução e deve ser registrado por SHA completo.
- Executar em worktree detached limpo; logs e resumo ficam fora dele.
- Executar exatamente um comando por vez e interromper no primeiro exit code diferente de zero.
- E2E deve executar com `CI=true`.
- Não criar listener de `unhandledRejection`, console, page error ou runner.
- Falha reabre a task dona; TASK-130 não altera produto, teste ou configuração.
- Não restaurar mudanças exceto CRLF/EOL semântico-zero de `frontend/public/mockServiceWorker.js`, comprovado antes.
- Backlog só muda depois da revisão independente aprovada.

---

### Task 1: Preparar o checkout detached e o ledger externo

**Files:**
- Read: `docs/frontend-tasks-v2.md`
- Read: `frontend/package.json`
- Read: `frontend/playwright.config.ts`
- Produce externally: `<temp>/task-130-<target-sha>/summary.tsv`
- Produce externally: `<temp>/task-130-<target-sha>/*.log`

**Interfaces:**
- Consumes: branch da feature limpa e commit alvo aprovado.
- Produces: `$targetCommit`, `$gateWorktree`, `$logRoot` e ledger externo.

- [ ] **Step 1: Confirmar elegibilidade e registrar o alvo**

```powershell
$repo = (git rev-parse --show-toplevel).Trim()
$targetCommit = (git rev-parse HEAD).Trim()
$branch = (git branch --show-current).Trim()
git status --short
git rev-parse "$targetCommit^{commit}"
rg -n "^\[ \] TASK-130|Status: READY|Depends on:" docs/frontend-tasks-v2.md
```

Expected: branch `codex/phase-8-hardening`, status vazio, SHA completo válido,
TASK-130 `READY` e TASK-106 a TASK-129 `DONE`. Se qualquer condição falhar,
parar sem criar worktree.

- [ ] **Step 2: Derivar caminhos seguros**

```powershell
$commonDir = (git rev-parse --path-format=absolute --git-common-dir).Trim()
$worktreeParent = Split-Path -Parent $commonDir
$gateWorktree = Join-Path $worktreeParent "task-130-final-gate"
$tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$logRoot = Join-Path $tempRoot "shop-api-task-130-$targetCommit"
$gateWorktree = [IO.Path]::GetFullPath($gateWorktree)
$logRoot = [IO.Path]::GetFullPath($logRoot)

if (-not $gateWorktree.StartsWith(([IO.Path]::GetFullPath($worktreeParent) + [IO.Path]::DirectorySeparatorChar))) {
  throw "Worktree fora do diretório administrativo: $gateWorktree"
}
if (-not $logRoot.StartsWith($tempRoot)) {
  throw "Logs fora do temp do sistema: $logRoot"
}
if (Test-Path -LiteralPath $gateWorktree) { throw "Worktree alvo já existe" }
if (Test-Path -LiteralPath $logRoot) { throw "Diretório de logs já existe" }
New-Item -ItemType Directory -Path $logRoot | Out-Null
```

Expected: dois caminhos absolutos inéditos; nenhum delete é executado.

- [ ] **Step 3: Criar e validar o worktree**

```powershell
git worktree add --detach $gateWorktree $targetCommit
if ($LASTEXITCODE -ne 0) { throw "Falha ao criar worktree" }
git worktree list --porcelain | Tee-Object -FilePath (Join-Path $logRoot 'worktrees-before.txt')
git -C $gateWorktree rev-parse HEAD
git -C $gateWorktree status --short
```

Expected: HEAD exatamente `$targetCommit`, entrada exata para
`$gateWorktree`, checkout detached e status vazio.

### Task 2: Executar os seis comandos obrigatórios

**Files:**
- Read: `frontend/package-lock.json`
- Read: `frontend/playwright.config.ts`
- Produce externally: `<logRoot>/01-npm-ci.log` até `<logRoot>/06-build.log`
- Produce externally: `<logRoot>/summary.tsv`

**Interfaces:**
- Consumes: worktree detached limpo.
- Produces: seis exit codes, durações e snapshots Git.

- [ ] **Step 1: Definir o executor sequencial**

```powershell
$frontend = Join-Path $gateWorktree 'frontend'
$summary = Join-Path $logRoot 'summary.tsv'
"step`tcommand`tstartedUtc`tdurationMs`texitCode`tgitStatus" |
  Set-Content -LiteralPath $summary -Encoding utf8

function Invoke-GateStep {
  param(
    [int]$Number,
    [string]$Name,
    [scriptblock]$Action,
    [hashtable]$Environment = @{}
  )

  $log = Join-Path $logRoot ('{0:D2}-{1}.log' -f $Number, $Name)
  $started = [DateTimeOffset]::UtcNow
  $watch = [Diagnostics.Stopwatch]::StartNew()
  $oldValues = @{}
  try {
    foreach ($key in $Environment.Keys) {
      $oldValues[$key] = [Environment]::GetEnvironmentVariable($key, 'Process')
      [Environment]::SetEnvironmentVariable($key, $Environment[$key], 'Process')
    }
    & $Action *>&1 | Tee-Object -FilePath $log
    $exitCode = $LASTEXITCODE
  } finally {
    $watch.Stop()
    foreach ($key in $Environment.Keys) {
      [Environment]::SetEnvironmentVariable($key, $oldValues[$key], 'Process')
    }
  }

  $statusLines = @(git -C $gateWorktree status --short)
  $statusText = ($statusLines -join ' | ')
  "$Number`t$Name`t$($started.ToString('O'))`t$($watch.ElapsedMilliseconds)`t$exitCode`t$statusText" |
    Add-Content -LiteralPath $summary -Encoding utf8

  if ($statusLines.Count -gt 0 -and
      $statusLines.Count -eq 1 -and
      $statusLines[0] -match 'frontend/public/mockServiceWorker\.js$') {
    git -C $gateWorktree diff --ignore-space-at-eol --exit-code -- frontend/public/mockServiceWorker.js
    if ($LASTEXITCODE -ne 0) { throw "mockServiceWorker.js tem mudança semântica" }
    "CRLF/EOL de mockServiceWorker.js restaurado após $Name" |
      Add-Content -LiteralPath $log
    git -C $gateWorktree restore --source=HEAD --worktree -- frontend/public/mockServiceWorker.js
    $statusLines = @(git -C $gateWorktree status --short)
  }

  if ($exitCode -ne 0) { throw "Gate $Name falhou com exit $exitCode" }
  if ($statusLines.Count -ne 0) { throw "Gate $Name sujou checkout: $($statusLines -join ', ')" }
}
```

Expected: a função preserva log integral, stopwatch, exit code e status. Ela
restaura somente EOL semântico-zero do worker; qualquer outra mudança falha.

- [ ] **Step 2: Executar a sequência exata**

```powershell
Push-Location $frontend
try {
  Invoke-GateStep 1 'npm-ci' { npm ci }
  Invoke-GateStep 2 'typecheck' { npm run typecheck }
  Invoke-GateStep 3 'lint' { npm run lint }
  Invoke-GateStep 4 'vitest' { npm test }
  Invoke-GateStep 5 'playwright' { npm run test:e2e } @{ CI = 'true' }
  Invoke-GateStep 6 'build' { npm run build }
} finally {
  Pop-Location
}
```

Expected: `npm ci`, typecheck, lint, Vitest, Playwright e build, nessa ordem,
todos exit 0; E2E mostra o total Chromium aprovado e usa `CI=true`. O executor
não alcança o próximo passo depois de falha.

- [ ] **Step 3: Auditar erros reportados pelos runners**

```powershell
$runnerPatterns = 'Unhandled Errors|Unhandled Rejection|Test runner error|Worker process exited unexpectedly'
$runnerHits = rg -n -i $runnerPatterns `
  (Join-Path $logRoot '04-vitest.log') `
  (Join-Path $logRoot '05-playwright.log')
if ($LASTEXITCODE -eq 0) { throw "Runner reportou erro não tratado: $runnerHits" }
if ($LASTEXITCODE -ne 1) { throw "Falha ao auditar logs dos runners" }
```

Expected: `rg` exit 1, sem assinaturas. Não adicionar listeners: Vitest,
Playwright, seus exit codes e logs integrais são a fonte de verdade.

### Task 3: Executar auditorias adicionais e integridade final

**Files:**
- Read: `frontend/scripts/verify-production-graph.mjs`
- Read: `frontend/scripts/audit-private-data.mjs`
- Produce externally: logs 07 a 11.

**Interfaces:**
- Consumes: build aprovado e checkout limpo.
- Produces: grafo, privacidade, foco/skip, diff-check e status aprovados.

- [ ] **Step 1: Executar auditores versionados sem repetir build**

```powershell
Push-Location $frontend
try {
  Invoke-GateStep 7 'production-graph' { npm run verify:production-graph }
  Invoke-GateStep 8 'private-data' { npm run audit:private-data }
} finally {
  Pop-Location
}
```

Expected: exit 0; grafo confirma entry abaixo de 500 kB e seis rotas lazy;
auditor privado e self-test aprovados.

- [ ] **Step 2: Rejeitar testes focados ou ignorados**

```powershell
$focusLog = Join-Path $logRoot '09-focused-or-skipped-tests.log'
$testModifiers = rg -n `
  --glob '!node_modules/**' `
  --glob '!dist/**' `
  --glob '!playwright-report/**' `
  --glob '!test-results/**' `
  '\b(?:test|it|describe)\.(?:only|skip)\s*\(' `
  $frontend 2>&1 | Tee-Object -FilePath $focusLog
$focusExit = $LASTEXITCODE
if ($focusExit -eq 0) { throw "Existem testes .only/.skip: $testModifiers" }
if ($focusExit -ne 1) { throw "Busca de .only/.skip falhou com exit $focusExit" }
```

Expected: exit 1 do `rg`, significando zero ocorrências. Comentários e docs não
entram como exceção: qualquer chamada real ou textual deve ser revisada.

- [ ] **Step 3: Validar diff e status**

```powershell
git -C $gateWorktree diff --check 2>&1 |
  Tee-Object -FilePath (Join-Path $logRoot '10-diff-check.log')
if ($LASTEXITCODE -ne 0) { throw "diff-check falhou" }

$finalStatus = @(git -C $gateWorktree status --short)
$finalStatus | Set-Content -LiteralPath (Join-Path $logRoot '11-status.log')
if ($finalStatus.Count -ne 0) { throw "Checkout final não está limpo" }

git -C $gateWorktree rev-parse HEAD |
  Set-Content -LiteralPath (Join-Path $logRoot 'target-head.txt')
```

Expected: diff-check sem saída, status vazio e HEAD igual ao alvo.

### Task 4: Tratar falha ou preparar revisão

**Files:**
- Modify only after approval: `docs/frontend-tasks-v2.md`
- Preserve externally: todos os logs e `summary.tsv`

**Interfaces:**
- Consumes: resultado completo ou primeiro erro.
- Produces: task dona reaberta, ou pacote pronto para revisão independente.

- [ ] **Step 1: Aplicar a política de falha**

Se qualquer passo falhar, não editar frontend. Registrar no relatório:

```text
targetCommit=<SHA>
failedStep=<número e comando>
exitCode=<código>
ownerTask=<TASK-ID identificada pelo arquivo/feature>
log=<caminho absoluto>
decision=TASK-130 BLOCKED; reabrir ownerTask; repetir gate completo após correção aprovada
```

Expected: a task dona volta a não concluída por commit administrativo do
orquestrador; a correção segue o workflow explorador → implementador → revisor.
O gate inteiro recomeça em novo detached, desde `npm ci`.

- [ ] **Step 2: Fazer cleanup seguro do worktree**

```powershell
$listed = git worktree list --porcelain
$escaped = [regex]::Escape(($gateWorktree -replace '\\','/'))
if ($listed -notmatch "(?m)^worktree $escaped$") {
  throw "Worktree temporário não está listado; cleanup abortado"
}
if (-not $gateWorktree.StartsWith(([IO.Path]::GetFullPath($worktreeParent) + [IO.Path]::DirectorySeparatorChar))) {
  throw "Caminho de cleanup fora do diretório permitido"
}
git worktree remove --force -- $gateWorktree
if ($LASTEXITCODE -ne 0) { throw "Falha ao remover worktree temporário" }
git worktree prune
if (Test-Path -LiteralPath $gateWorktree) { throw "Worktree ainda existe" }
```

Expected: somente o worktree registrado é removido. `$logRoot` permanece.

- [ ] **Step 3: Delegar revisão independente**

Entregar ao revisor:

- commit alvo e `BASE_COMMIT`;
- exploração e este plano;
- `summary.tsv` e todos os logs externos;
- contagens Vitest/E2E, bytes/chunks e auditoria privada;
- evidência de `CI=true`, ausência de `.only/.skip`, runner errors, diff e status;
- `git diff 2a8bddf47eb856ebd7fe8ea187fa06173fb176c1..HEAD`;
- evidência de remoção do worktree.

Expected: revisão explícita sem findings CRITICAL ou IMPORTANT. Findings
bloqueadores seguem a política de ownership e exigem novo gate completo.

- [ ] **Step 4: Atualizar backlog somente após aprovação**

Alterar somente a entrada TASK-130 para `[x]`, `Status: DONE` e uma evidência
com commit alvo, commit do plano, revisão, versões, seis comandos com
contagens/durações/exit 0, auditores, busca `.only/.skip`, ausência de runner
errors, diff/status e cleanup. Então:

```powershell
git diff --check
git diff -- docs/frontend-tasks-v2.md
git status --short
git add docs/frontend-tasks-v2.md
git diff --cached --check
git commit -m "test(TASK-130): Registrar gate final do MVP"
```

Expected: somente backlog alterado no commit final. Não remover `$logRoot`
antes da aprovação e do registro das evidências.
