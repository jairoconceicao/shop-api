# Login Email Trim Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Normalizar os espaços externos do e-mail antes de validar o formato e enviar as credenciais de login.

**Architecture:** A correção fica no schema canônico `loginRequestSchema`, consumido tanto pelo formulário quanto por `loginService`, para que validação e transporte compartilhem a mesma saída normalizada. Os testes de contrato e serviço existentes fornecem o RED; a implementação mínima troca apenas a composição Zod do campo `email`, sem alterar serviço, mutation, formulário ou mapeamento de erros.

**Tech Stack:** TypeScript 5.7, Zod 4, Vitest 4, React 19 e Vite 6.

## Global Constraints

- Escopo exclusivo de frontend da TASK-132; nenhuma mudança de backend.
- Aplicar `trim` antes da validação do formato do e-mail.
- Preferir `z.string().trim().pipe(z.email())` e não introduzir a API deprecated `z.string().email()`.
- Preservar rejeições de e-mail inválido, senha vazia e o comportamento atual para propriedades extras.
- Não alterar `loginService`, mutations, formulário de login, resposta de autenticação ou mapeamento de erros.
- Usar os testes já falhando como RED e não enfraquecer suas asserções.
- Não marcar TASK-132 como `DONE` com testes falhando ou findings `CRITICAL` ou `IMPORTANT` pendentes.
- Commits devem seguir o formato do projeto e permanecer limitados à TASK-132.

---

## Estrutura de arquivos

- Modificar `frontend/src/features/auth/contracts/login.ts`: corrigir somente o pipeline Zod do e-mail em `loginRequestSchema`.
- Verificar sem modificar `frontend/src/features/auth/contracts/login.test.ts`: o teste existente exige a saída sem espaços e mantém as rejeições atuais.
- Verificar sem modificar `frontend/src/features/auth/services/loginService.test.ts`: o teste existente exige que o serviço envie o e-mail normalizado.
- Modificar `docs/frontend-tasks-v2.md` somente após os gates e a revisão: concluir TASK-132 com evidências reais.

### Task 1: Corrigir a ordem entre normalização e validação do e-mail

**Files:**
- Modify: `frontend/src/features/auth/contracts/login.ts:12-15`
- Test: `frontend/src/features/auth/contracts/login.test.ts:18-37`
- Test: `frontend/src/features/auth/services/loginService.test.ts:18-34`
- Modify after approval: `docs/frontend-tasks-v2.md:636-644`

**Interfaces:**
- Consumes: `z.string().trim(): ZodString`, `ZodType.pipe(z.email())` e o objeto `loginRequestSchema` já consumido por `LoginPage` e `login()`.
- Produces: `loginRequestSchema.parse({ email, senha }): LoginRequest`, com `email` validado após remoção de espaços externos e `senha` preservada sem normalização.

- [ ] **Step 1: Confirmar que o RED existente cobre contrato e transporte**

Não editar os testes. Confirmar que `frontend/src/features/auth/contracts/login.test.ts` já contém esta asserção:

```ts
expect(
  loginRequestSchema.parse({
    email: '  cliente@exemplo.com  ',
    senha: 'senha-secreta',
  }),
).toEqual({
  email: 'cliente@exemplo.com',
  senha: 'senha-secreta',
})
```

Confirmar também que `frontend/src/features/auth/services/loginService.test.ts` já exige o body normalizado:

```ts
expect(client.request).toHaveBeenCalledWith('/api/v1/auth/login', {
  method: 'POST',
  body: {
    email: 'cliente@exemplo.com',
    senha: 'senha-secreta',
  },
})
```

Os casos existentes abaixo devem permanecer inalterados para provar que a correção não aceita e-mail inválido nem senha vazia:

```ts
it.each([
  { email: 'email-invalido', senha: 'senha-secreta' },
  { email: 'cliente@exemplo.com', senha: '' },
])('rejects invalid login input: $email', (request) => {
  expect(() => loginRequestSchema.parse(request)).toThrow()
})
```

- [ ] **Step 2: Executar os testes já falhando e registrar RED**

Run:

```bash
cd frontend
npm test -- src/features/auth/contracts/login.test.ts src/features/auth/services/loginService.test.ts
```

Expected: FAIL em `validates the login request and normalizes surrounding email spaces` e `posts normalized credentials and adapts the session`, porque `z.email().trim()` valida o valor antes de remover os espaços. Os demais testes desses arquivos continuam passando.

- [ ] **Step 3: Implementar a correção mínima no schema**

Em `frontend/src/features/auth/contracts/login.ts`, substituir somente o campo `email` de `loginRequestSchema`:

```ts
export const loginRequestSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  senha: z.string().min(1),
})
```

Não modificar `loginResponseDataSchema`: o e-mail da resposta é dado de transporte e não faz parte da correção de normalização das credenciais enviadas.

- [ ] **Step 4: Executar os testes focados e confirmar GREEN**

Run:

```bash
cd frontend
npm test -- src/features/auth/contracts/login.test.ts src/features/auth/services/loginService.test.ts
```

Expected: PASS em todos os testes dos dois arquivos; o contrato retorna `cliente@exemplo.com`, o serviço envia esse valor normalizado, e as rejeições existentes continuam passando.

- [ ] **Step 5: Executar a suíte da feature de autenticação**

Run:

```bash
cd frontend
npm test -- src/features/auth
```

Expected: PASS em todos os testes sob `src/features/auth`, sem regressões no formulário, mutations, rotas, store, logout ou tratamento de `401`.

- [ ] **Step 6: Executar os gates globais do frontend**

Run:

```bash
cd frontend
npm test
npm run typecheck
npm run lint
npm run build
```

Expected: suíte global sem testes falhando; typecheck, lint e build encerram com código 0. Registrar as contagens reais e qualquer aviso não bloqueante para o backlog.

- [ ] **Step 7: Revisar escopo e criar o commit da correção**

Run:

```bash
git diff --check
git diff -- frontend/src/features/auth/contracts/login.ts
```

Expected: `git diff --check` sem saída; o diff de código contém somente a troca de `z.email().trim()` por `z.string().trim().pipe(z.email())`, sem mudanças nos testes já existentes ou em outros módulos de autenticação.

Commit:

```bash
git add frontend/src/features/auth/contracts/login.ts
git commit -m "fix(TASK-132): Normalizar e-mail antes da validação"
```

Expected: commit atômico contendo somente `frontend/src/features/auth/contracts/login.ts`.

- [ ] **Step 8: Submeter o diff à revisão obrigatória**

Run:

```bash
git show --stat --oneline HEAD
git show --format= HEAD -- frontend/src/features/auth/contracts/login.ts
```

Expected: o revisor confirma o pipeline `trim` → validação, a preservação dos contratos e o escopo de uma linha. Se houver finding `CRITICAL` ou `IMPORTANT`, devolver ao implementador, executar novamente os Steps 4–6 e reenviar o novo diff ao revisor.

- [ ] **Step 9: Fechar a TASK-132 no backlog após aprovação**

Em `docs/frontend-tasks-v2.md`, alterar `[ ] TASK-132` para `[x] TASK-132` e `Status: READY` para `Status: DONE`. Acrescentar uma linha `Evidência` com o SHA curto retornado por `git log -1 --format=%h`, os nomes dos dois testes que falharam no RED, as contagens reais dos testes focados, da suíte de autenticação e da suíte global, os resultados de typecheck/lint/build/diff-check e a aprovação final do revisor. Copiar somente valores observados nas saídas dos Steps 2, 4–8.

Validar e commitar somente o backlog:

```bash
git diff --check
git diff -- docs/frontend-tasks-v2.md
git add docs/frontend-tasks-v2.md
git commit -m "fix(TASK-132): Concluir correção do login"
```

Expected: commit contendo somente o status `DONE` e as evidências reais da TASK-132; nenhuma outra task muda de status.

- [ ] **Step 10: Confirmar o estado final rastreável**

Run:

```bash
git status --short
git log --oneline -3
```

Expected: worktree sem mudanças pendentes da TASK-132 e log contendo o commit da correção seguido pelo commit de fechamento do backlog.
