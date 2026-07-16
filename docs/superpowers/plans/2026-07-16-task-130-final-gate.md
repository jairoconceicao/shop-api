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
- Falha funcional comprovada reabre a task dona; falha ambiental, de
  infraestrutura ou do executor não reabre task funcional.
- Não restaurar mudanças exceto CRLF/EOL semântico-zero de `frontend/public/mockServiceWorker.js`, comprovado antes.
- Backlog só muda depois da revisão independente aprovada.
- Tentativa 1 foi falha de executor por `-replace '\','/'`; nenhum resultado
  parcial vale e o gate integral deve recomeçar no novo `HEAD`.

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
$worktreePorcelain = @(git worktree list --porcelain)
if ($LASTEXITCODE -ne 0) { throw "Falha ao listar worktrees" }
$firstWorktreeLine = $worktreePorcelain | Where-Object { $_ -like 'worktree *' } |
  Select-Object -First 1
if (-not $firstWorktreeLine) { throw "Checkout administrativo não encontrado" }
$mainRoot = [IO.Path]::GetFullPath($firstWorktreeLine.Substring(9))
$mainBranch = (git -C $mainRoot branch --show-current).Trim()
if ($mainBranch -notin @('main', 'codex/phase-8-hardening-plan')) {
  throw "Primeiro checkout não é main/admin: $mainBranch"
}
$worktreeParent = [IO.Path]::GetFullPath((Join-Path $mainRoot '.worktrees'))
$gateWorktree = [IO.Path]::GetFullPath(
  (Join-Path $worktreeParent 'task-130-final-gate')
)
$tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$logRoot = Join-Path $tempRoot "shop-api-task-130-$targetCommit"
$logRoot = [IO.Path]::GetFullPath($logRoot)

function Convert-ToGitPath {
  param([Parameter(Mandatory)][string]$Path)
  return $Path.Replace([char]92, [char]47)
}

$normalizationCases = @{
  'C:\repo\.worktrees\x' = 'C:/repo/.worktrees/x'
  'C:/repo/.worktrees/x' = 'C:/repo/.worktrees/x'
}
foreach ($case in $normalizationCases.GetEnumerator()) {
  $actual = Convert-ToGitPath $case.Key
  if ($actual -ne $case.Value) {
    throw "Self-check de normalização falhou: '$($case.Key)' => '$actual'"
  }
}

if ((Split-Path -Parent $gateWorktree) -ne $worktreeParent) {
  throw "Worktree não é filho direto de .worktrees: $gateWorktree"
}
if (-not $logRoot.StartsWith($tempRoot)) {
  throw "Logs fora do temp do sistema: $logRoot"
}
if (Test-Path -LiteralPath $logRoot) { throw "Diretório de logs já existe" }

$listedRoots = @(
  $worktreePorcelain |
    Where-Object { $_ -like 'worktree *' } |
    ForEach-Object { [IO.Path]::GetFullPath($_.Substring(9)) }
)
foreach ($listedRoot in $listedRoots) {
  # O destino administrativo fica fisicamente sob mainRoot/.worktrees por
  # contrato; a sobreposição proibida é com qualquer outro checkout listado.
  if ($listedRoot -eq $mainRoot) { continue }
  # O caminho exato pode ser o checkout preservado da tentativa 1; Step 2A
  # exige que esteja limpo e o remove sem force antes do novo add.
  if ($listedRoot -eq $gateWorktree) { continue }
  $listedPrefix = $listedRoot.TrimEnd('\') + '\'
  $gatePrefix = $gateWorktree.TrimEnd('\') + '\'
  if ($gateWorktree.StartsWith($listedPrefix) -or
      $listedRoot.StartsWith($gatePrefix)) {
    throw "Destino contém ou está contido em checkout listado: $listedRoot"
  }
}
New-Item -ItemType Directory -Path $logRoot | Out-Null
```

Expected: `mainRoot` vem da primeira entrada administrativa; destino é
exatamente `<mainRoot>/.worktrees/task-130-final-gate`, filho direto, sem
sobreposição com checkout listado, exceto o caminho exato preservado da
tentativa 1 que será tratado no Step 2A; self-check cobre barras Windows e
caminho já normalizado; nenhum delete é executado neste step.

- [ ] **Step 2A: Limpar com segurança checkout preservado da tentativa 1**

Se `<mainRoot>/.worktrees/task-130-final-gate` existir, tratá-lo exclusivamente
como candidato preservado da tentativa 1 e executar antes de criar o novo
checkout. Se não existir, pular este step.

```powershell
$preserved = $gateWorktree
# Executar o restante deste bloco somente quando Test-Path $preserved for true.
$listedBeforeRetry = git worktree list --porcelain
if ($LASTEXITCODE -ne 0) { throw "Falha ao listar tentativa preservada" }
$preservedGitPath = Convert-ToGitPath $preserved
$preservedPattern = [regex]::Escape($preservedGitPath)
$isListed = $listedBeforeRetry -match "(?m)^worktree $preservedPattern$"
$isDirectChild = (Split-Path -Parent $preserved) -eq $worktreeParent
$preservedStatus = @(git -C $preserved status --short)
$statusOk = $LASTEXITCODE -eq 0 -and $preservedStatus.Count -eq 0

git -C $preserved rev-parse HEAD *>&1 |
  Set-Content -LiteralPath (Join-Path $logRoot 'attempt-1-head.log')
git -C $preserved status --short *>&1 |
  Set-Content -LiteralPath (Join-Path $logRoot 'attempt-1-status.log')
git -C $preserved diff --binary *>&1 |
  Set-Content -LiteralPath (Join-Path $logRoot 'attempt-1.patch')

if (-not ($isListed -and $isDirectChild -and $statusOk)) {
  throw "Tentativa 1 preservada não pode ser removida com segurança"
}
git worktree remove -- $preserved
if ($LASTEXITCODE -ne 0) { throw "Falha ao remover tentativa 1 sem force" }
git worktree prune
if (Test-Path -LiteralPath $preserved) {
  throw "Diretório da tentativa 1 ainda existe"
}
```

Expected: capturas externas existem, checkout está listado, limpo e no filho
direto exato; remoção ocorre sem `--force`. Se qualquer validação falhar,
preservar o checkout e parar. Depois, criar novo detached no novo `$targetCommit`
e repetir os seis comandos desde `npm ci`.

- [ ] **Step 3: Criar e validar o worktree**

```powershell
git worktree add --detach $gateWorktree $targetCommit
if ($LASTEXITCODE -ne 0) { throw "Falha ao criar worktree" }
git worktree list --porcelain | Tee-Object -FilePath (Join-Path $logRoot 'worktrees-before.txt')
git -C $gateWorktree rev-parse HEAD
git -C $gateWorktree status --short
```

Expected: HEAD exatamente `$targetCommit`, entrada exata para
`$gateWorktree`, checkout detached e status vazio. A partir do sucesso de
`git worktree add`, envolver todas as Tasks 2–4 em um `try/finally` externo; o
`finally` da Task 4 é obrigatório tanto em sucesso quanto em falha.

```powershell
try {
  # Executar integralmente as Tasks 2 e 3 e a classificação da Task 4.
  # O bloco finally correspondente está definido na Task 4, Step 2.
```

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
"step`tcommand`tstartedUtc`tdurationMs`texitCode`tstatusBeforeNormalization`tfinalGitStatus" |
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

  $statusBeforeNormalization = @(git -C $gateWorktree status --short)
  $statusLines = $statusBeforeNormalization

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

  $beforeText = ($statusBeforeNormalization -join ' | ')
  $finalText = ($statusLines -join ' | ')
  "$Number`t$Name`t$($started.ToString('O'))`t$($watch.ElapsedMilliseconds)`t$exitCode`t$beforeText`t$finalText" |
    Add-Content -LiteralPath $summary -Encoding utf8

  if ($exitCode -ne 0) { throw "Gate $Name falhou com exit $exitCode" }
  if ($statusLines.Count -ne 0) { throw "Gate $Name sujou checkout: $($statusLines -join ', ')" }
}
```

Expected: a função preserva log integral, stopwatch, exit code,
`statusBeforeNormalization` e `finalGitStatus`; o resumo usa o status final.
Ela restaura somente EOL semântico-zero do worker; qualquer outra mudança
falha.

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

- [ ] **Step 3: Registrar sinais reportados pelos runners**

```powershell
$runnerPatterns = 'Unhandled Errors|Unhandled Rejection|Test runner error|Worker process exited unexpectedly'
$runnerSignalLog = Join-Path $logRoot 'runner-signals.log'
rg -n -i $runnerPatterns `
  (Join-Path $logRoot '04-vitest.log') `
  (Join-Path $logRoot '05-playwright.log') *>&1 |
  Set-Content -LiteralPath $runnerSignalLog
if ($LASTEXITCODE -gt 1) { throw "Falha ao inspecionar logs dos runners" }
```

Expected: o arquivo registra zero ou mais sinais para revisão. Substrings não
reprovam o gate sozinhas; exit codes e resumos estruturados dos runners são a
decisão automática. Não adicionar listeners.

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

- [ ] **Step 2: Rejeitar modifiers incondicionais e revisar condicionais**

```powershell
$focusLog = Join-Path $logRoot '09-focused-or-skipped-tests.log'
$unconditional = rg -n `
  --glob '!node_modules/**' `
  --glob '!dist/**' `
  --glob '!playwright-report/**' `
  --glob '!test-results/**' `
  '\b(?:test|it|describe)\.only\s*\(|\b(?:test|it|describe)\.skip\s*\(\s*[''"]' `
  $frontend 2>&1 | Tee-Object -FilePath $focusLog
$focusExit = $LASTEXITCODE
if ($focusExit -eq 0) { throw "Existem modifiers incondicionais: $unconditional" }
if ($focusExit -ne 1) { throw "Busca de .only/.skip falhou com exit $focusExit" }

$conditionalLog = Join-Path $logRoot '09b-conditional-skips.log'
rg -n `
  --glob '!node_modules/**' `
  --glob '!dist/**' `
  '\b(?:test|it|describe)\.skip\s*\(' `
  $frontend 2>&1 | Set-Content -LiteralPath $conditionalLog
if ($LASTEXITCODE -gt 1) { throw "Inventário de skips condicionais falhou" }
```

Expected: nenhuma chamada incondicional. O segundo arquivo é inventário para
revisão manual: cada ocorrência condicional recebe justificativa explícita;
regex textual não decide sozinha quando a assinatura recebe uma condição.

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

Se qualquer passo falhar, não editar frontend. Primeiro classificar como
`environment`, `infrastructure`, `executor` ou `functional`; ownership
funcional só pode ser atribuído após reprodução e evidência. Registrar:

```text
targetCommit=<SHA>
failedStep=<número e comando>
exitCode=<código>
classification=<environment|infrastructure|executor|functional>
ownerTask=<TASK-ID somente se functional comprovada; caso contrário none>
log=<caminho absoluto>
decision=<bloquear TASK-130 e corrigir ambiente/infra/executor, ou reabrir ownerTask functional>; repetir gate completo
```

Expected: environment/infrastructure/executor mantêm TASK-130 não concluída ou
bloqueada e corrigem o procedimento sem reabrir task funcional. Somente falha
functional reproduzida reabre a task dona; a correção segue explorador →
implementador → revisor. O gate inteiro recomeça desde `npm ci`.

- [ ] **Step 2: Capturar evidência e limpar no `finally` externo**

```powershell
finally {
  $captureSucceeded = $false
  try {
    git -C $gateWorktree rev-parse HEAD *>&1 |
      Set-Content -LiteralPath (Join-Path $logRoot 'final-head.log')
    if ($LASTEXITCODE -ne 0) { throw "Falha ao capturar HEAD" }
    git -C $gateWorktree status --short *>&1 |
      Set-Content -LiteralPath (Join-Path $logRoot 'final-status.log')
    if ($LASTEXITCODE -ne 0) { throw "Falha ao capturar status" }
    git -C $gateWorktree diff --binary *>&1 |
      Set-Content -LiteralPath (Join-Path $logRoot 'failure-or-final.patch')
    if ($LASTEXITCODE -ne 0) { throw "Falha ao capturar patch" }
    git -C $gateWorktree diff --name-status *>&1 |
      Set-Content -LiteralPath (Join-Path $logRoot 'final-name-status.log')
    if ($LASTEXITCODE -ne 0) { throw "Falha ao capturar nomes" }
    git worktree list --porcelain *>&1 |
      Set-Content -LiteralPath (Join-Path $logRoot 'worktrees-final.txt')
    if ($LASTEXITCODE -ne 0) { throw "Falha ao capturar worktrees" }
    $captureSucceeded = $true
  } catch {
    $_ | Out-String |
      Set-Content -LiteralPath (Join-Path $logRoot 'capture-error.log')
  }

  $listed = git worktree list --porcelain
  $normalizedGateWorktree = Convert-ToGitPath $gateWorktree
  if ((Convert-ToGitPath 'C:\repo\.worktrees\x') -ne
      'C:/repo/.worktrees/x') {
    throw "Self-check de normalização falhou antes do cleanup"
  }
  $escaped = [regex]::Escape($normalizedGateWorktree)
  $isDirectChild = (Split-Path -Parent $gateWorktree) -eq $worktreeParent
  $unexpectedStatus = @(git -C $gateWorktree status --short)
  $isClean = $LASTEXITCODE -eq 0 -and $unexpectedStatus.Count -eq 0
  if ($captureSucceeded -and $isDirectChild -and $isClean -and
      $listed -match "(?m)^worktree $escaped$") {
    git worktree remove -- $gateWorktree
    if ($LASTEXITCODE -eq 0) {
      git worktree prune
    } else {
      "Remoção falhou; worktree preservado em $gateWorktree" |
        Set-Content -LiteralPath (Join-Path $logRoot 'cleanup-error.log')
    }
  } else {
    "Captura/validação insegura ou status não limpo; worktree preservado em $gateWorktree. Status: $($unexpectedStatus -join ' | ')" |
      Set-Content -LiteralPath (Join-Path $logRoot 'cleanup-skipped.log')
  }
}
```

Expected: HEAD, status, patch binário e inventário são externos antes de
qualquer remoção. Somente checkout limpo (inclusive após EOL restaurado) é
removido. Qualquer alteração real ou untracked inesperado preserva o worktree,
pois patch Git não arquiva seu conteúdo; remoção é sempre sem `--force`.
`$logRoot` sempre permanece.

- [ ] **Step 3: Delegar revisão independente**

Entregar ao revisor:

- commit alvo e `BASE_COMMIT`;
- exploração e este plano;
- `summary.tsv` e todos os logs externos;
- contagens Vitest/E2E, bytes/chunks e auditoria privada;
- evidência de `CI=true`, ausência de modifiers incondicionais, revisão dos
  condicionais, sinais dos runners, diff e status;
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
