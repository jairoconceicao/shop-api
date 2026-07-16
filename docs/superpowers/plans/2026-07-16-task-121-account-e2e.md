# TASK-121 — Dados Pessoais e Senha E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** provar em Chromium que um cliente autenticado carrega a área da conta, confirma e salva uma alteração de CPF junto aos demais dados, preserva o perfil confirmado após refresh, vê regras e erro remoto de senha, conclui uma segunda troca de senha e termina sem valores sensíveis nos campos.

**Architecture:** estender o backend Playwright determinístico da `TASK-117` com estado mutável de cliente e dois endpoints estritos: `PUT /api/v1/cliente/{id}` e `PUT /api/v1/cliente/{id}/senha`. Uma única jornada autentica pela UI, percorre as duas rotas reais da conta e valida tanto o estado visível quanto o estado canônico mantido pelo helper, sem semear sessão em storage ou chamar serviços diretamente.

**Tech Stack:** React 19, TypeScript 5.7, Zustand 5, TanStack Query 5, React Hook Form 7, Zod 4, Playwright 1.61, Vite 6.

## Global Constraints

- Escopo exclusivo: frontend E2E e documentação da `TASK-121`; não alterar código de produto nem backend ASP.NET.
- Registrar `BASE_COMMIT=$(git rev-parse HEAD)` antes de qualquer alteração.
- O agente principal apenas orquestra: explorador, implementador e revisor são agentes distintos.
- Não executar dois agentes com permissão de escrita simultaneamente no mesmo checkout.
- Reutilizar `frontend/e2e/fixtures.ts` e `frontend/e2e/support/authApi.ts`; não criar nova fixture, interceptador ou sessão injetada em storage.
- Autenticar pela UI com `authApi.seedCustomer()`; não chamar serviços diretamente, não usar `page.request` e não escrever auth em `localStorage` ou `sessionStorage`.
- Requests não declarados, rota ou método incorreto, token ausente, body extra/ausente e ID divergente devem falhar.
- Usar seletores semânticos; não usar CSS, XPath, `data-testid`, `nth`, `first`, `last` ou `waitForTimeout`.
- O perfil atualizado usa valores derivados deterministicamente dos dados do teste:
  - `updatedCpf = \`8000000${data.cpf.slice(-4)}\``
  - `updatedName = \`${data.name} Atualizado\``
  - `updatedEmail = \`atualizado-${data.email}\``
  - `updatedStreet = \`${data.street} Atualizada\``
- A alteração de CPF deve abrir o dialog “Confirmar alteração do CPF”, exibir CPF atual e novo mascarados e somente enviar o PUT após “Confirmar alteração”.
- O PUT de perfil contém exatamente `cpf`, `nome`, `dataNascimento`, `email`, `endereco` e `celular`; não contém `clienteId`, `senha` ou qualquer campo extra.
- O backend E2E atualiza `registeredCustomer` somente depois de validar integralmente o PUT e responde `{ status: true, data: { clienteId } }`.
- O perfil é lido exatamente três vezes: carga inicial da rota, refetch após a mutação aceita e nova carga após `page.reload()`.
- A rota de senha deve exibir as quatro regras literais e seus estados; a tentativa local inválida não emite request.
- A primeira tentativa HTTP usa `{ senhaAtual: data.password, senhaNova: firstNewPassword }`, recebe `422` com `SenhaAtual`, preserva a senha atual e limpa a nova.
- A segunda tentativa usa `{ senhaAtual: data.password, senhaNova: finalNewPassword }`, recebe sucesso, atualiza a senha em memória e limpa ambos os campos.
- `firstNewPassword = \`Primeira@${data.cpf.slice(-4)}A\`` e `finalNewPassword = \`Final@${data.cpf.slice(-4)}B\`` atendem às quatro regras locais.
- `AuthApi.customerSnapshot()` continua omitindo senha. O teste prova limpeza de valores sensíveis apenas pelos inputs e nunca expõe senha em snapshot, erro ou log.
- Contagens brutas esperadas: `login=1`, `categories=3`, `profile=3`, `profileUpdate=1`, `passwordUpdate=2`; todas as demais são zero.
- As três categorias correspondem à montagem inicial da rota protegida antes do login, à remontagem autenticada e à nova carga completa causada por `page.reload()`. A navegação SPA entre dados e senha não adiciona outra leitura.
- Commits de implementação permitidos: `test(TASK-121): Estender backend E2E para conta` e `test(TASK-121): Cobrir jornada E2E da conta`.
- Gate mínimo: spec isolada, repetição dupla, jornadas autenticadas relacionadas, suíte Chromium, suíte Chromium repetida, typecheck, lint, build e `git diff --check`.

---

## File Map

- Modify: `frontend/e2e/support/authApi.ts` — adicionar contadores, contratos estritos, perfil mutável, recusa determinística da primeira senha e aceitação da segunda.
- Create: `frontend/e2e/account.spec.ts` — jornada UI login → dados → confirmação de CPF → refresh → senha inválida/local → erro remoto → sucesso.
- Modify: `docs/superpowers/plans/2026-07-15-fase-8-testes-hardening.md` — ligar `TASK-121` a este plano.
- Do not modify: `frontend/e2e/fixtures.ts` — isolamento, assert no `finally`, limpeza de storage e reset do helper já cobrem o novo estado.
- Do not modify: `frontend/src/features/customer/**`, `frontend/src/features/auth/**` ou `frontend/src/app/**` — o produto real é o objeto do E2E.
- Do not modify: `docs/frontend-tasks-v2.md` durante implementação — somente o orquestrador atualiza o backlog após implementação e revisão aprovadas.

## Inspected Interfaces and Exact Traffic

```ts
PUT /api/v1/cliente/${data.customerId}
Authorization: Bearer task-117.header.payload
{
  cpf: updatedCpf,
  nome: updatedName,
  dataNascimento: data.birthDate,
  email: updatedEmail,
  endereco: {
    logradouro: updatedStreet,
    numero: data.number,
    complemento: null,
    cep: data.postalCode,
    bairro: data.district,
    cidade: data.city,
    uf: data.state,
  },
  celular: {
    ddd: data.areaCode,
    numero: data.phone,
    whatsApp: true,
  },
}
```

```ts
// primeira tentativa, recusada
PUT /api/v1/cliente/${data.customerId}/senha
Authorization: Bearer task-117.header.payload
{ senhaAtual: data.password, senhaNova: firstNewPassword }

// 422
{
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Revise os dados informados.',
    details: [{
      propertyName: 'SenhaAtual',
      message: 'Senha atual incorreta.',
    }],
  },
}
```

```ts
// segunda tentativa, aceita
PUT /api/v1/cliente/${data.customerId}/senha
Authorization: Bearer task-117.header.payload
{ senhaAtual: data.password, senhaNova: finalNewPassword }

// 200
{ status: true, data: { clienteId: data.customerId } }
```

```text
register=0 login=1 categories=3 profile=3 profileUpdate=1 passwordUpdate=2
logout=0 product=0 cartCreate=0 cartAdd=0 cartGet=0 cartUpdate=0
cartDelete=0 orderCreate=0
```

---

### Task 1: Register Baseline and Confirm Eligibility

**Files:**
- Read: `docs/frontend-tasks-v2.md`
- Read: `docs/superpowers/specs/2026-07-15-fase-8-testes-hardening-design.md`
- Read: `frontend/e2e/support/authApi.ts`
- Read: `frontend/src/features/customer/pages/CustomerDataPage.tsx`
- Read: `frontend/src/features/customer/pages/CustomerPasswordPage.tsx`

**Interfaces:**
- Consumes: `TASK-111`–`TASK-117` in `DONE`, every dependency of `TASK-121` in `DONE`, `TASK-121` in `READY`.
- Produces: immutable `BASE_COMMIT` for implementation and review.

- [ ] **Step 1: Confirm branch, cleanliness and baseline**

Run:

```bash
git status --short --branch
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
```

Expected: branch `codex/phase-8-hardening`, clean worktree, SHA recorded as `BASE_COMMIT`.

- [ ] **Step 2: Confirm backlog eligibility**

Run:

```bash
rg -n -A 12 "TASK-111:|TASK-112:|TASK-113:|TASK-114:|TASK-115:|TASK-116:|TASK-117:|TASK-121:" docs/frontend-tasks-v2.md
```

Expected: dependencies are `DONE`; `TASK-121` is `READY`; acceptance criteria are defined.

---

### Task 2: Write the Complete Journey Against the Missing Mutable APIs

**Files:**
- Create: `frontend/e2e/account.spec.ts`
- Test: `frontend/e2e/account.spec.ts`

**Interfaces:**
- Consumes: `test`, `expect`, `AuthApi.seedCustomer()`, semantic controls from both account pages.
- Produces: typed requirements for `profileUpdate`, `passwordUpdate` and the mutable profile/password handlers.

- [ ] **Step 1: Create the E2E spec**

Create `frontend/e2e/account.spec.ts`:

```ts
import { expect, test } from './fixtures'

test('atualiza dados e troca a senha com confirmação e limpeza sensível', async ({
  authApi,
  page,
}) => {
  const { data } = authApi
  const updatedCpf = `8000000${data.cpf.slice(-4)}`
  const updatedName = `${data.name} Atualizado`
  const updatedEmail = `atualizado-${data.email}`
  const updatedStreet = `${data.street} Atualizada`
  const firstNewPassword = `Primeira@${data.cpf.slice(-4)}A`
  const finalNewPassword = `Final@${data.cpf.slice(-4)}B`

  authApi.seedCustomer()
  authApi.expectRequestCounts({
    login: 1,
    categories: 3,
    profile: 3,
    profileUpdate: 1,
    passwordUpdate: 2,
  })

  await page.goto('/minha-conta/dados')
  await expect(page).toHaveURL('/entrar')
  await page.getByLabel('E-mail').fill(data.email)
  await page.getByLabel('Senha').fill(data.password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()

  await expect(page).toHaveURL('/minha-conta/dados')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Meus dados' }),
  ).toBeVisible()
  await expect(page.getByLabel('Nome completo')).toHaveValue(data.name)
  await expect(page.getByLabel('CPF')).toHaveValue(
    data.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
  )

  await page.getByLabel('Nome completo').fill(updatedName)
  await page.getByLabel('CPF').fill(updatedCpf)
  await page.getByLabel('E-mail').fill(updatedEmail)
  await page.getByLabel('Logradouro').fill(updatedStreet)
  await page.getByRole('button', { name: 'Salvar alterações' }).click()

  const cpfDialog = page.getByRole('dialog', {
    name: 'Confirmar alteração do CPF',
  })
  await expect(cpfDialog).toBeVisible()
  await expect(cpfDialog).toContainText('CPF atual')
  await expect(cpfDialog).toContainText('Novo CPF')
  await expect(cpfDialog).toContainText(
    data.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
  )
  await expect(cpfDialog).toContainText(
    updatedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
  )
  expect(authApi.requestCounts().profileUpdate).toBe(0)
  await cpfDialog.getByRole('button', { name: 'Confirmar alteração' }).click()

  await expect(
    page.getByRole('status').filter({
      hasText: 'Dados atualizados com sucesso.',
    }),
  ).toBeVisible()
  await expect(page.getByLabel('Nome completo')).toHaveValue(updatedName)
  await expect(page.getByLabel('CPF')).toHaveValue(
    updatedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
  )
  await expect(page.getByLabel('E-mail')).toHaveValue(updatedEmail)
  await expect(page.getByLabel('Logradouro')).toHaveValue(updatedStreet)
  await expect.poll(() => authApi.customerSnapshot()).toMatchObject({
    cpf: updatedCpf,
    nome: updatedName,
    email: updatedEmail,
    endereco: { logradouro: updatedStreet },
  })

  await page.reload()
  await expect(page).toHaveURL('/minha-conta/dados')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Meus dados' }),
  ).toBeVisible()
  await expect(page.getByLabel('Nome completo')).toHaveValue(updatedName)
  await expect(page.getByLabel('CPF')).toHaveValue(
    updatedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
  )
  await expect(page.getByLabel('E-mail')).toHaveValue(updatedEmail)
  await expect(page.getByLabel('Logradouro')).toHaveValue(updatedStreet)

  await page.getByRole('link', { name: 'Trocar senha' }).click()
  await expect(page).toHaveURL('/minha-conta/senha')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Alterar senha' }),
  ).toBeVisible()
  const rules = page.getByRole('list', { name: 'Regras da nova senha' })
  await expect(rules).toContainText('Mínimo de oito caracteres')
  await expect(rules).toContainText('Uma letra maiúscula')
  await expect(rules).toContainText('Um número')
  await expect(rules).toContainText('Um caractere especial entre !@#$%')

  await page.getByLabel('Senha atual').fill(data.password)
  await page.getByLabel('Nova senha').fill('curta')
  await page.getByRole('button', { name: 'Alterar senha' }).click()
  await expect(page.getByRole('alert')).toContainText(
    'A nova senha deve atender a todas as regras.',
  )
  expect(authApi.requestCounts().passwordUpdate).toBe(0)

  await page.getByLabel('Nova senha').fill(firstNewPassword)
  await expect(rules).toContainText('Atendida')
  await page.getByRole('button', { name: 'Alterar senha' }).click()
  await expect(page.getByRole('alert')).toContainText('Senha atual incorreta.')
  await expect(page.getByLabel('Senha atual')).toHaveValue(data.password)
  await expect(page.getByLabel('Nova senha')).toHaveValue('')

  await page.getByLabel('Nova senha').fill(finalNewPassword)
  await page.getByRole('button', { name: 'Alterar senha' }).click()
  await expect(
    page.getByRole('status').filter({
      hasText: 'Senha alterada com sucesso.',
    }),
  ).toBeVisible()
  await expect(page.getByLabel('Senha atual')).toHaveValue('')
  await expect(page.getByLabel('Nova senha')).toHaveValue('')

  await expect.poll(() => authApi.requestCounts()).toMatchObject({
    login: 1,
    categories: 3,
    profile: 3,
    profileUpdate: 1,
    passwordUpdate: 2,
  })
})
```

- [ ] **Step 2: Run the RED typecheck**

Run:

```bash
npm --prefix frontend run typecheck
```

Expected: FAIL because `profileUpdate` and `passwordUpdate` are absent from `RequestName`, `RequestCounts` and `ExpectedRequestCounts`.

- [ ] **Step 3: Apply only the temporary counter declarations**

Add these literals to `RequestName` and the `counts` initializer in `frontend/e2e/support/authApi.ts`:

```ts
| 'profileUpdate'
| 'passwordUpdate'
```

```ts
profileUpdate: 0,
passwordUpdate: 0,
```

Do not add endpoint behavior and do not commit this incomplete state.

- [ ] **Step 4: Run the behavioral RED**

Run:

```bash
npm --prefix frontend run test:e2e -- account.spec.ts --project=chromium
```

Expected: FAIL when the first `PUT /api/v1/cliente/{id}` reaches the existing GET-only profile handler; login, profile load, edits and CPF dialog must already pass.

---

### Task 3: Add the Strict Mutable Account Endpoints

**Files:**
- Modify: `frontend/e2e/support/authApi.ts`
- Test: `frontend/e2e/account.spec.ts`

**Interfaces:**
- Consumes: `registeredCustomer`, `requireAuthorization`, `readJson`, `json`, `increment`.
- Produces: exact mutable profile API, deterministic two-attempt password API and generic reset compatibility.

- [ ] **Step 1: Add exact request types after `LoginRequest`**

```ts
type UpdateCustomerRequest = Omit<RegistrationRequest, 'senha'>

type UpdatePasswordRequest = {
  senhaAtual: string
  senhaNova: string
}
```

- [ ] **Step 2: Add deterministic derived values inside `installAuthApi`**

Immediately after `const data = buildRegistrationData(testInfo)`, add:

```ts
const updatedCpf = `8000000${data.cpf.slice(-4)}`
const updatedName = `${data.name} Atualizado`
const updatedEmail = `atualizado-${data.email}`
const updatedStreet = `${data.street} Atualizada`
const firstNewPassword = `Primeira@${data.cpf.slice(-4)}A`
const finalNewPassword = `Final@${data.cpf.slice(-4)}B`
```

Immediately after `let registeredCustomer`, add:

```ts
let passwordAttempts = 0
```

- [ ] **Step 3: Add the password endpoint before the generic customer route**

```ts
if (url.pathname === `/api/v1/cliente/${data.customerId}/senha`) {
  requireMethod(route, 'PUT')
  requireAuthorization(route)
  increment('passwordUpdate')

  if (registeredCustomer === null) {
    throw new Error('Password update requested before customer seed')
  }

  const body = readJson<UpdatePasswordRequest>(route)
  const expectedNewPassword =
    passwordAttempts === 0 ? firstNewPassword : finalNewPassword
  const expectedBody = {
    senhaAtual: data.password,
    senhaNova: expectedNewPassword,
  }
  if (JSON.stringify(body) !== JSON.stringify(expectedBody)) {
    throw new Error('Unexpected password update body')
  }

  passwordAttempts += 1
  if (passwordAttempts === 1) {
    await json(route, {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Revise os dados informados.',
        details: [{
          propertyName: 'SenhaAtual',
          message: 'Senha atual incorreta.',
        }],
      },
    }, 422)
    return
  }

  registeredCustomer = {
    ...registeredCustomer,
    senha: body.senhaNova,
  }
  await json(route, {
    status: true,
    data: { clienteId: data.customerId },
  })
  return
}
```

The handler rejects a missing/extra key through exact JSON comparison, never returns either password, mutates the stored password only on the accepted second attempt and rejects any third attempt because its body cannot match the second-attempt contract and the final count gate is two.

- [ ] **Step 4: Replace the GET-only profile handler with method branches**

Replace the current `/api/v1/cliente/${data.customerId}` block with:

```ts
if (url.pathname === `/api/v1/cliente/${data.customerId}`) {
  requireAuthorization(route)

  if (request.method() === 'GET') {
    increment('profile')
    if (registeredCustomer === null) {
      throw new Error('Profile requested before registration')
    }
    await json(route, {
      status: true,
      data: {
        clienteId: data.customerId,
        cpf: registeredCustomer.cpf,
        nome: registeredCustomer.nome,
        dataNascimento: registeredCustomer.dataNascimento,
        email: registeredCustomer.email,
        endereco: registeredCustomer.endereco,
        celular: registeredCustomer.celular,
      },
    })
    return
  }

  if (request.method() === 'PUT') {
    increment('profileUpdate')
    if (registeredCustomer === null) {
      throw new Error('Profile update requested before customer seed')
    }

    const body = readJson<UpdateCustomerRequest>(route)
    const expectedBody: UpdateCustomerRequest = {
      cpf: updatedCpf,
      nome: updatedName,
      dataNascimento: data.birthDate,
      email: updatedEmail,
      endereco: {
        logradouro: updatedStreet,
        numero: data.number,
        complemento: null,
        cep: data.postalCode,
        bairro: data.district,
        cidade: data.city,
        uf: data.state,
      },
      celular: {
        ddd: data.areaCode,
        numero: data.phone,
        whatsApp: true,
      },
    }
    if (JSON.stringify(body) !== JSON.stringify(expectedBody)) {
      throw new Error(`Unexpected profile update body: ${JSON.stringify(body)}`)
    }
    if ('clienteId' in body || 'senha' in body) {
      throw new Error(`Forbidden profile fields: ${JSON.stringify(body)}`)
    }

    registeredCustomer = {
      ...registeredCustomer,
      ...body,
      endereco: { ...body.endereco },
      celular: { ...body.celular },
    }
    await json(route, {
      status: true,
      data: { clienteId: data.customerId },
    })
    return
  }

  throw new Error(
    `Expected GET or PUT ${request.url()}, received ${request.method()}`,
  )
}
```

- [ ] **Step 5: Extend reset for password attempt isolation**

At the beginning of `reset()`, add:

```ts
passwordAttempts = 0
```

The existing generic counter loop clears `profileUpdate` and `passwordUpdate`; `registeredCustomer = null` removes the mutated profile and password after success or failure.

- [ ] **Step 6: Run GREEN typecheck and focused journey**

Run:

```bash
npm --prefix frontend run typecheck
npm --prefix frontend run test:e2e -- account.spec.ts --project=chromium
```

Expected: typecheck PASS and journey 1/1 PASS with one profile PUT and two password PUTs.

- [ ] **Step 7: Prove earlier authenticated journeys remain compatible**

Run:

```bash
npm --prefix frontend run test:e2e -- auth.spec.ts checkout.spec.ts account.spec.ts --project=chromium
```

Expected: 3/3 PASS; unmentioned new counters remain zero in earlier specs and the GET profile behavior is unchanged.

- [ ] **Step 8: Commit shared backend**

Run:

```bash
git add frontend/e2e/support/authApi.ts
git commit -m "test(TASK-121): Estender backend E2E para conta"
```

Expected: commit contains only deterministic E2E support.

---

### Task 4: Lock the Account Journey Assertions

**Files:**
- Create: `frontend/e2e/account.spec.ts`
- Test: `frontend/e2e/account.spec.ts`

**Interfaces:**
- Consumes: strict mutable account backend from Task 3.
- Produces: E2E proof of confirmed profile persistence, password rules/error/success and sensitive cleanup.

- [ ] **Step 1: Verify forbidden selectors and direct state manipulation**

Run:

```bash
rg -n "locator\\(|data-testid|waitForTimeout|nth\\(|\\.first\\(|\\.last\\(|xpath|css=|localStorage|sessionStorage|page\\.request|fetch\\(" frontend/e2e/account.spec.ts
```

Expected: no matches.

- [ ] **Step 2: Verify profile and CPF confirmation evidence**

Run:

```bash
rg -n "Confirmar alteração do CPF|CPF atual|Novo CPF|profileUpdate\\)\\.toBe\\(0\\)|Dados atualizados com sucesso|customerSnapshot|page\\.reload|updatedCpf|updatedName|updatedEmail|updatedStreet" frontend/e2e/account.spec.ts
```

Expected: dialog contents, pre-confirmation zero count, success, backend snapshot and post-refresh assertions are present.

- [ ] **Step 3: Verify password evidence**

Run:

```bash
rg -n "Mínimo de oito caracteres|Uma letra maiúscula|Um número|Um caractere especial|passwordUpdate\\)\\.toBe\\(0\\)|Senha atual incorreta|Primeira@|Final@|Senha alterada com sucesso|toHaveValue\\(''\\)" frontend/e2e/account.spec.ts
```

Expected: local no-request proof, first remote error, second success and cleanup of both password fields are present.

- [ ] **Step 4: Run twice**

Run:

```bash
npm --prefix frontend run test:e2e -- account.spec.ts --project=chromium --repeat-each=2
```

Expected: 2/2 PASS with independent IDs, cleared storages, fresh profile, password and attempt counters.

- [ ] **Step 5: Commit journey**

Run:

```bash
git add frontend/e2e/account.spec.ts
git commit -m "test(TASK-121): Cobrir jornada E2E da conta"
```

Expected: commit contains only the new spec.

---

### Task 5: Run Gates and Prepare Independent Review

**Files:**
- Verify: `frontend/e2e/support/authApi.ts`
- Verify: `frontend/e2e/account.spec.ts`

**Interfaces:**
- Consumes: `BASE_COMMIT` and both implementation commits.
- Produces: reproducible evidence and bounded review diff.

- [ ] **Step 1: Run complete Chromium suite**

```bash
npm --prefix frontend run test:e2e -- --project=chromium
```

Expected: every spec PASS.

- [ ] **Step 2: Run complete Chromium suite twice**

```bash
npm --prefix frontend run test:e2e -- --project=chromium --repeat-each=2
```

Expected: every journey PASS twice without order, worker or prior-state dependency.

- [ ] **Step 3: Run static and build gates**

```bash
npm --prefix frontend run typecheck
npm --prefix frontend run lint
npm --prefix frontend run build
git diff --check "$BASE_COMMIT"..HEAD
```

Expected: exit code `0` for every command. The pre-existing Vite chunk warning may be recorded but is not a failure.

- [ ] **Step 4: Produce review package**

```bash
git log --oneline "$BASE_COMMIT"..HEAD
git diff --stat "$BASE_COMMIT"..HEAD
git diff "$BASE_COMMIT"..HEAD -- frontend/e2e/support/authApi.ts frontend/e2e/account.spec.ts
```

Expected: only the account-capable E2E backend and account spec, in commits identified by `TASK-121`.

- [ ] **Step 5: Delegate independent review**

Reviewer checklist:

1. Login occurs only through visible UI and returns to `/minha-conta/dados`.
2. Initial profile fields come from the seeded backend and are visible before edits.
3. Changed CPF opens the named dialog with current and next masked values.
4. No profile PUT occurs before explicit CPF confirmation.
5. Profile PUT path, method, token and exact body match the production contract.
6. Profile body excludes ID, password and extra fields.
7. Accepted PUT mutates the server snapshot only after validation.
8. Success is visible; refetch and reload both show the confirmed profile.
9. Exactly three GETs, one profile PUT and no unrelated requests occur.
10. All four password rules are visible and the local invalid attempt emits zero requests.
11. First valid local attempt sends the exact body and receives the exact mapped `422`.
12. After `422`, current password remains and new password is empty.
13. Second attempt sends the exact final body, succeeds and updates server password without exposing it.
14. After success, both password fields are empty and the status is visible.
15. Exactly two password PUTs occur; any third or divergent body fails.
16. Fixture reset clears profile, password, counters and attempt index after success or failure.
17. Existing auth and checkout specs remain green.
18. No product, ASP.NET backend or backlog file changed.

Expected: no `CRITICAL` or `IMPORTANT`. Any such finding returns to the implementer, reruns affected gates and receives a new review.

---

### Task 6: Handoff Completion to the Orchestrator

**Files:**
- Later modify, only after approvals: `docs/frontend-tasks-v2.md`

**Interfaces:**
- Consumes: implementation approval, review approval, green gates and actual SHAs.
- Produces: evidence required to mark only `TASK-121` as `DONE`.

- [ ] **Step 1: Report evidence without editing backlog**

Report:

- `BASE_COMMIT`;
- both `TASK-121` implementation SHAs;
- focused 1/1 and repeated 2/2 results;
- related authenticated journeys result;
- full Chromium and repeated full Chromium results;
- typecheck, lint, build and diff-check;
- exact raw request counts and accepted bodies;
- explicit absence or list of pending `CRITICAL`/`IMPORTANT`.

- [ ] **Step 2: Let orchestrator update status**

The orchestrator marks only `TASK-121` as `DONE`, records evidence and commits, and changes dependent tasks only when every dependency and component-conflict gate permits.

---

## Self-Review

- **Spec coverage:** login, account load, profile edit, explicit CPF confirmation, accepted server snapshot, refresh persistence, password rules, local block, remote error, success and sensitive cleanup each map to a visible assertion and strict traffic validation.
- **Placeholder scan:** no placeholder, deferred implementation, implicit repetition, unspecified test or generic error-handling instruction remains.
- **Type consistency:** endpoint paths, Portuguese transport keys, profile fields, password fields, error detail and response ID match inspected production contracts.
- **Isolation:** existing fixture clears storage; explicit reset clears attempt index and mutable customer; generic counter handling covers both new counters.
- **Sensitive data:** snapshots omit password, assertions inspect password only through masked browser inputs, and helper errors never interpolate either password value.
- **Scope:** only shared E2E support, one E2E spec and the orchestration-plan link are planned.
