# TASK-112 — Cadastro e Perfil MSW Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** provar cadastro 201/409/422 e perfil GET/PUT com bodies normalizados e cache confirmado.

**Architecture:** uma spec usa AppRouter, helper compartilhado da TASK-111 e handlers por cenário. O ledger guarda método, path, authorization e JSON.

**Tech Stack:** React, Vitest, Testing Library, MSW, TanStack Query, React Router, Zustand.

Este plano inclui o patch literal do mapper `422`. Outros REDs mudam TASK-112 para `BLOCKED` e retornam ao explorador.

## Global Constraints

- TASK-112 READY; dependências DONE; BASE antes da escrita.
- Nenhum mock de produto; `server.listen({ onUnhandledRequest: 'error' })` permanece ativo; writer único; review obrigatória.

### Task 1: integração customer

**Files:**
- Create: `frontend/src/features/customer/customer.integration.test.tsx`
- Modify: `frontend/src/features/customer/pages/RegistrationPage.tsx`

**Interfaces:** consumes `renderIntegration(ReactElement,{initialEntries})`, `customerProfileQueryKeys.detail(7)`, `AppRouter`, auth store.

- [ ] **Step 1: workflow**

Registre BASE_COMMIT, obtenha relatório do explorador sobre os dois arquivos listados, envie relatório ao implementador e registre IN_PROGRESS.

#### Complete target listing

```tsx
import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppRouter } from '../../app/router/AppRouter'
import { renderIntegration } from '../../shared/testing/renderIntegration'
import { server } from '../../shared/testing/server'
import { useAuthStore } from '../auth/store/authStore'
import { customerProfileQueryKeys } from './queries/useCustomerProfileQuery'

const profile = { status: true, data: { clienteId: 7, cpf: '12345678901', nome: 'Ana Silva', dataNascimento: '1990-05-20', email: 'ana@example.com', endereco: { logradouro: 'Rua A', numero: '10', complemento: null, cep: '01001000', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' }, celular: { ddd: '11', numero: '999999999', whatsApp: true } } } as const
const expectedRegistration = { senha: 'segredo123', cpf: '12345678901', nome: 'Ana Silva', dataNascimento: '1990-05-20', email: 'ana@example.com', endereco: { logradouro: 'Rua A', numero: '10', complemento: null, cep: '01001000', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP' }, celular: { ddd: '11', numero: '999999999', whatsApp: true } } as const
type LedgerEntry = { method: string; path: string; authorization: string | null; body: unknown }
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>((done) => { resolve = done }); return { promise, resolve } }
function seedSession() { useAuthStore.getState().setSession({ token: 'token-7', tipo: 'Bearer', expiraEm: '2099-07-17T12:00:00Z', usuarioId: 3, clienteId: 7, email: 'ana@example.com' }, 'session') }
async function fillRegistration(user: ReturnType<typeof renderIntegration>['user']) {
  await user.type(screen.getByLabelText('Nome completo'), ' Ana Silva '); await user.type(screen.getByLabelText('CPF'), '12345678901'); await user.type(screen.getByLabelText('Data de nascimento'), '1990-05-20'); await user.type(screen.getByLabelText('E-mail'), ' ana@example.com '); await user.type(screen.getByLabelText('Senha'), 'segredo123'); await user.type(screen.getByLabelText('CEP'), '01001000'); await user.type(screen.getByLabelText('Logradouro'), ' Rua A '); await user.type(screen.getByLabelText('Número'), ' 10 '); await user.type(screen.getByLabelText('Bairro'), ' Centro '); await user.type(screen.getByLabelText('Cidade'), ' São Paulo '); await user.type(screen.getByLabelText('UF'), 'sp'); await user.type(screen.getByLabelText('Celular'), '11999999999'); await user.click(screen.getByRole('checkbox', { name: 'Este celular também é WhatsApp' }))
}

describe('TASK-112 customer integration', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); useAuthStore.getState().clearSession() })

  it('sends normalized registration and navigates after 201', async () => {
    const ledger: LedgerEntry[] = []
    server.use(http.post('*/api/v1/cliente', async ({ request }) => { ledger.push({ method: request.method, path: new URL(request.url).pathname, authorization: request.headers.get('authorization'), body: await request.json() }); return HttpResponse.json({ status: true, data: { clienteId: 7 } }, { status: 201 }) }))
    const { user } = renderIntegration(<AppRouter />, { initialEntries: ['/cadastro'] }); await fillRegistration(user); await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    expect(await screen.findByRole('heading', { name: 'Entrar na sua conta' })).toBeInTheDocument(); expect(screen.getByText('Cadastro concluído')).toBeInTheDocument(); expect(ledger).toEqual([{ method: 'POST', path: '/api/v1/cliente', authorization: null, body: expectedRegistration }])
  })

  it('preserves registration values for 409', async () => {
    server.use(http.post('*/api/v1/cliente', () => HttpResponse.json({ error: { code: 'CUSTOMER_CONFLICT', message: 'CPF já cadastrado', details: [{ propertyName: 'Cpf', message: 'Já existe um cliente cadastrado com este CPF.' }] } }, { status: 409 })))
    const { user } = renderIntegration(<AppRouter />, { initialEntries: ['/cadastro'] }); await fillRegistration(user); await user.click(screen.getByRole('button', { name: 'Criar conta' })); expect(await screen.findAllByText('Já existe um cliente cadastrado com este CPF.')).not.toHaveLength(0); const summary = screen.getByRole('alert'); expect(within(summary).getByText('Já existe um cliente cadastrado com este CPF.')).toBeInTheDocument(); expect(screen.getByLabelText('CPF')).toHaveValue('123.456.789-01'); expect(screen.getByLabelText('E-mail')).toHaveValue('ana@example.com'); expect(screen.queryByText('Cadastro concluído')).not.toBeInTheDocument()
  })

  it('maps CPF and CEP from 422 and preserves unknown detail in summary', async () => {
    server.use(http.post('*/api/v1/cliente', () => HttpResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Revise os dados', details: [{ propertyName: 'Cpf', message: 'CPF inválido.' }, { propertyName: 'Endereco.Cep', message: 'CEP inválido.' }, { propertyName: 'CampoNovo', message: 'Falha futura.' }] } }, { status: 422 })))
    const { user } = renderIntegration(<AppRouter />, { initialEntries: ['/cadastro'] }); await fillRegistration(user); await user.click(screen.getByRole('button', { name: 'Criar conta' })); expect(await screen.findAllByText('CPF inválido.')).not.toHaveLength(0); expect(await screen.findAllByText('CEP inválido.')).not.toHaveLength(0); expect(screen.getByLabelText('CPF')).toHaveAccessibleDescription('CPF inválido.'); expect(screen.getByLabelText('CEP')).toHaveAccessibleDescription('CEP inválido.'); const summary = screen.getByRole('alert'); expect(within(summary).getByText('Falha futura.')).toBeInTheDocument(); expect(screen.getByLabelText('CPF')).toHaveValue('123.456.789-01'); expect(screen.getByLabelText('CEP')).toHaveValue('01001-000'); expect(screen.queryByText('Cadastro concluído')).not.toBeInTheDocument()
  })

  it('loads profile, confirms CPF change and reconciles cache after PUT', async () => {
    seedSession(); const ledger: LedgerEntry[] = []; const putGate = deferred<Response>(); let gets = 0
    server.use(
      http.get('*/api/v1/cliente/7', ({ request }) => { gets += 1; const body = gets === 1 ? profile : { ...profile, data: { ...profile.data, cpf: '98765432100', nome: 'Ana Atualizada' } }; return HttpResponse.json(body) }),
      http.put('*/api/v1/cliente/7', async ({ request }) => { ledger.push({ method: request.method, path: new URL(request.url).pathname, authorization: request.headers.get('authorization'), body: await request.json() }); return putGate.promise }),
    )
    const { user, queryClient } = renderIntegration(<AppRouter />, { initialEntries: ['/minha-conta/dados'] })
    expect(await screen.findByDisplayValue('Ana Silva')).toBeInTheDocument(); await user.clear(screen.getByLabelText('Nome completo')); await user.type(screen.getByLabelText('Nome completo'), 'Ana Atualizada'); await user.clear(screen.getByLabelText('CPF')); await user.type(screen.getByLabelText('CPF'), '98765432100'); await user.click(screen.getByRole('button', { name: 'Salvar alterações' })); await user.click(await screen.findByRole('button', { name: 'Confirmar alteração' })); await waitFor(() => expect(ledger).toHaveLength(1)); expect(queryClient.getQueryData<{ cpf: string; nome: string }>(customerProfileQueryKeys.detail(7))).toMatchObject({ cpf: '12345678901', nome: 'Ana Silva' }); putGate.resolve(HttpResponse.json({ status: true, data: { clienteId: 7 } })); await waitFor(() => expect(gets).toBe(2)); expect(ledger[0]).toEqual({ method: 'PUT', path: '/api/v1/cliente/7', authorization: 'Bearer token-7', body: { cpf: '98765432100', nome: 'Ana Atualizada', dataNascimento: '1990-05-20', email: 'ana@example.com', endereco: profile.data.endereco, celular: profile.data.celular } }); expect(queryClient.getQueryData<{ cpf: string }>(customerProfileQueryKeys.detail(7))?.cpf).toBe('98765432100'); expect(screen.getByDisplayValue('Ana Atualizada')).toBeInTheDocument()
  })

  it.each([409, 422])('keeps confirmed profile and suppresses success for HTTP %i', async (status) => {
    seedSession(); server.use(http.get('*/api/v1/cliente/7', () => HttpResponse.json(profile)), http.put('*/api/v1/cliente/7', () => HttpResponse.json({ error: { message: 'Perfil recusado', details: [{ propertyName: 'Cpf', message: 'CPF recusado.' }] } }, { status })))
    const { user, queryClient } = renderIntegration(<AppRouter />, { initialEntries: ['/minha-conta/dados'] })
    expect(await screen.findByDisplayValue('Ana Silva')).toBeInTheDocument()
    await user.clear(screen.getByLabelText('Nome completo')); await user.type(screen.getByLabelText('Nome completo'), 'Tentativa'); await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    if (status === 409) {
      const summary = await screen.findByRole('alert')
      expect(within(summary).getByText('Já existe outro cliente com estes dados.')).toBeInTheDocument()
    } else {
      expect(await screen.findAllByText('CPF recusado.')).not.toHaveLength(0)
      expect(screen.getByLabelText('CPF')).toHaveAccessibleDescription('CPF recusado.')
    }
    expect(queryClient.getQueryData<{ nome: string }>(customerProfileQueryKeys.detail(7))?.nome).toBe('Ana Silva')
    expect(screen.queryByText(/dados atualizados com sucesso/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: criar imports, fixtures e helpers**

Copie do listing o início do arquivo até antes de `describe`.

- [ ] **Step 3: adicionar cadastro 201 e 409**

Copie `beforeEach`, `sends normalized registration and navigates after 201` e `preserves registration values for 409`.

Run: `npm --prefix frontend test -- src/features/customer/customer.integration.test.tsx -t "sends normalized registration"`. Expected GREEN: `1 passed`; RED inesperado → `BLOCKED`.

Run: `npm --prefix frontend test -- src/features/customer/customer.integration.test.tsx -t "preserves registration values for 409"`. Expected GREEN: `1 passed`; RED inesperado → `BLOCKED`.

- [ ] **Step 4: adicionar cadastro 422**

Copie `maps CPF and CEP from 422 and preserves unknown detail in summary`.

Run: `npm --prefix frontend test -- src/features/customer/customer.integration.test.tsx -t "maps CPF and CEP from 422"`. Expected RED: `Unable to find an element with the text: Falha futura.`

- [ ] **Step 5: implementar mapper 422 literal**

Substitua `getRemoteFieldErrors` por:

```tsx
function getRemoteErrors(details: unknown): {
  fields: Array<{ field: RegistrationField; message: string }>
  summary: string[]
} {
  if (!Array.isArray(details)) return { fields: [], summary: [] }
  const fields: Array<{ field: RegistrationField; message: string }> = []
  const summary: string[] = []
  details.forEach((detail: ApiNotification) => {
    if (typeof detail?.message !== 'string' || typeof detail.propertyName !== 'string') return
    const property = detail.propertyName.split('.').at(-1)?.toLocaleLowerCase() ?? ''
    const field = API_FIELD_MAP[property]
    if (field) fields.push({ field, message: detail.message })
    else summary.push(detail.message)
  })
  return { fields, summary }
}
```

No `catch`, use:

```tsx
getRemoteErrors(error.details).fields.forEach(({ field, message }) => {
  setError(field, { type: 'server', message })
})
```

Na renderização, substitua `remoteFieldErrors` e o fallback por:

```tsx
const remoteErrors = getRemoteErrors(registrationMutation.error?.details)
const formErrors: FormError[] = Object.entries(errors).flatMap(([field, error]) =>
  error.message ? [{ fieldId: `registration-${field}`, message: error.message } satisfies FormError] : [],
)
formErrors.push(...remoteErrors.summary.map((message) => ({ message })))
if (registrationMutation.error && remoteErrors.fields.length === 0 && remoteErrors.summary.length === 0) {
  formErrors.push({ message: registrationMutation.error.message })
}
```

Run: comando focado anterior. Expected GREEN: `1 passed`, CPF e CEP descritos, `Falha futura.` dentro do summary.

- [ ] **Step 6: adicionar PUT deferred e falhas**

Copie os dois testes de perfil e feche `describe`.

Run: `npm --prefix frontend test -- src/features/customer/customer.integration.test.tsx -t "loads profile, confirms CPF change"`. Expected GREEN: cache antigo antes de `putGate.resolve`, cache novo depois, `1 passed`; RED inesperado → `BLOCKED`.

Run: `npm --prefix frontend test -- src/features/customer/customer.integration.test.tsx -t "keeps confirmed profile"`. Expected GREEN: `2 passed`; RED inesperado → `BLOCKED`.

- [ ] **Step 7: gate final e review**

Run teste focado completo, typecheck e lint. Expected: todos PASS e três exit codes `0`. Commits: `test(TASK-112): integrar cadastro e perfil com MSW`; `fix(TASK-112): preservar detalhes remotos desconhecidos`. Execute `git diff $BASE_COMMIT..HEAD`, revisão, repetição dos gates e DONE.

## Self-review

- Envelopes HTTP usam `error.message/details` aceitos por `apiErrorResponseSchema`.
- PUT contém todos os campos e cache muda depois da resposta e refetch.
- Cleanup limpa auth e storages por teste; MSW global reseta handlers.
