# TASK-112 — Cadastro e Perfil MSW Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** provar cadastro 201/409/422 e perfil GET/PUT com bodies normalizados e cache confirmado.

**Architecture:** uma spec usa AppRouter, helper compartilhado da TASK-111 e handlers por cenário. O ledger guarda método, path, authorization e JSON.

**Tech Stack:** React, Vitest, Testing Library, MSW, TanStack Query, React Router, Zustand.

**No product change planned.** Este plano cria somente a spec. Um RED sem patch literal muda TASK-112 para `BLOCKED` e retorna ao explorador.

## Global Constraints

- TASK-112 READY; dependências DONE; BASE antes da escrita.
- Nenhum mock de produto; `server.listen({ onUnhandledRequest: 'error' })` permanece ativo; writer único; review obrigatória.

### Task 1: integração customer

**Files:**
- Create: `frontend/src/features/customer/customer.integration.test.tsx`

**Interfaces:** consumes `renderIntegration(ReactElement,{initialEntries})`, `customerProfileQueryKeys.detail(7)`, `AppRouter`, auth store.

- [ ] **Step 1: workflow**

Registre BASE_COMMIT, obtenha relatório do explorador sobre estes quatro arquivos, envie relatório ao implementador e registre IN_PROGRESS.

#### Complete target listing

```tsx
import { screen, waitFor } from '@testing-library/react'
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
    const { user } = renderIntegration(<AppRouter />, { initialEntries: ['/cadastro'] }); await fillRegistration(user); await user.click(screen.getByRole('button', { name: 'Criar conta' })); expect(await screen.findByText('Já existe um cliente cadastrado com este CPF.')).toBeInTheDocument(); expect(screen.getByLabelText('CPF')).toHaveValue('123.456.789-01'); expect(screen.getByLabelText('E-mail')).toHaveValue('ana@example.com'); expect(screen.queryByText('Cadastro concluído')).not.toBeInTheDocument()
  })

  it('maps CPF and CEP from 422 and preserves unknown detail in summary', async () => {
    server.use(http.post('*/api/v1/cliente', () => HttpResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Revise os dados', details: [{ propertyName: 'Cpf', message: 'CPF inválido.' }, { propertyName: 'Endereco.Cep', message: 'CEP inválido.' }, { propertyName: 'CampoNovo', message: 'Falha futura.' }] } }, { status: 422 })))
    const { user } = renderIntegration(<AppRouter />, { initialEntries: ['/cadastro'] }); await fillRegistration(user); await user.click(screen.getByRole('button', { name: 'Criar conta' })); expect(await screen.findByText('CPF inválido.')).toBeInTheDocument(); expect(screen.getByLabelText('CPF')).toHaveAccessibleDescription('CPF inválido.'); expect(screen.getByLabelText('CEP')).toHaveAccessibleDescription('CEP inválido.'); expect(screen.getByRole('alert')).toHaveTextContent('Falha futura.'); expect(screen.getByLabelText('CPF')).toHaveValue('123.456.789-01'); expect(screen.getByLabelText('CEP')).toHaveValue('01001-000'); expect(screen.queryByText('Cadastro concluído')).not.toBeInTheDocument()
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
    const { user, queryClient } = renderIntegration(<AppRouter />, { initialEntries: ['/minha-conta/dados'] }); expect(await screen.findByDisplayValue('Ana Silva')).toBeInTheDocument(); await user.clear(screen.getByLabelText('Nome completo')); await user.type(screen.getByLabelText('Nome completo'), 'Tentativa'); await user.click(screen.getByRole('button', { name: 'Salvar alterações' })); expect(await screen.findByText(/recusad/i)).toBeInTheDocument(); expect(queryClient.getQueryData<{ nome: string }>(customerProfileQueryKeys.detail(7))?.nome).toBe('Ana Silva'); expect(screen.queryByText(/dados atualizados com sucesso/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: criar imports, fixtures e helpers**

Copie do listing o início do arquivo até antes de `describe`.

- [ ] **Step 3: adicionar cadastro 201 e 409**

Copie `beforeEach`, `sends normalized registration and navigates after 201` e `preserves registration values for 409`.

- [ ] **Step 4: adicionar cadastro 422**

Copie `maps CPF and CEP from 422 and preserves unknown detail in summary`.

- [ ] **Step 5: adicionar PUT deferred e falhas**

Copie os dois testes de perfil e feche `describe`.

- [ ] **Step 6: RED/GREEN/review**

Run RED: `npm --prefix frontend test -- src/features/customer/customer.integration.test.tsx --reporter=verbose`. Expected RED literal: `Unable to find an element with the text: Falha futura.` ou `expected Ana Silva to be Ana Atualizada`. Esse resultado muda TASK-112 para `BLOCKED` e retorna ao explorador.

GREEN focado, typecheck e lint devem sair `0`. Commit: `test(TASK-112): integrar cadastro e perfil com MSW`. Execute `git diff $BASE_COMMIT..HEAD`, revisão, repetição dos gates e DONE.

## Self-review

- Envelopes HTTP usam `error.message/details` aceitos por `apiErrorResponseSchema`.
- PUT contém todos os campos e cache muda depois da resposta e refetch.
- Cleanup limpa auth e storages por teste; MSW global reseta handlers.
