import type { BrowserContext, Route, TestInfo } from '@playwright/test'

const API_ORIGIN = 'http://localhost:5228'
const API_PATTERN = `${API_ORIGIN}/api/v1/**`
const TOKEN = 'task-117.header.payload'

export type RequestName =
  | 'register'
  | 'login'
  | 'categories'
  | 'profile'
  | 'logout'
export type ExpectedRequestCounts = Partial<Record<RequestName, number>>

export type RegistrationData = {
  customerId: number
  userId: number
  cpf: string
  name: string
  birthDate: string
  email: string
  password: string
  street: string
  number: string
  postalCode: string
  district: string
  city: string
  state: string
  areaCode: string
  phone: string
}

export type AuthApi = {
  data: RegistrationData
  expectRequestCounts(expected: ExpectedRequestCounts): void
  assertRequestCounts(): void
  reset(): void
}

type RegistrationRequest = {
  senha: string
  cpf: string
  nome: string
  dataNascimento: string
  email: string
  endereco: {
    logradouro: string
    numero: string
    complemento: string | null
    cep: string
    bairro: string
    cidade: string
    uf: string
  }
  celular: { ddd: string; numero: string; whatsApp: boolean }
}

type LoginRequest = { email: string; senha: string }

function numericSeed(testInfo: TestInfo) {
  const source = `${testInfo.titlePath.join('|')}|${testInfo.workerIndex}|${testInfo.repeatEachIndex}`
  return [...source].reduce(
    (hash, character) =>
      (hash * 31 + character.charCodeAt(0)) % 10_000,
    0,
  )
}

export function buildRegistrationData(testInfo: TestInfo): RegistrationData {
  const seed = numericSeed(testInfo)
  const suffix = seed.toString().padStart(4, '0')

  return {
    customerId: 20_000 + seed,
    userId: 10_000 + seed,
    cpf: `9000000${suffix}`,
    name: `Cliente TASK-117 ${suffix}`,
    birthDate: '1990-05-20',
    email: `task-117-${suffix}@example.test`,
    password: `Senha@${suffix}`,
    street: `Rua TASK-117 ${suffix}`,
    number: '117',
    postalCode: '12345678',
    district: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    areaCode: '11',
    phone: `91234${suffix}`,
  }
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

function readJson<T>(route: Route): T {
  return route.request().postDataJSON() as T
}

function requireMethod(route: Route, expected: string) {
  const actual = route.request().method()
  if (actual !== expected) {
    throw new Error(
      `Expected ${expected} ${route.request().url()}, received ${actual}`,
    )
  }
}

function requireAuthorization(route: Route) {
  const authorization = route.request().headers().authorization
  if (authorization !== `Bearer ${TOKEN}`) {
    throw new Error(
      `Expected Bearer token for ${route.request().method()} ${route.request().url()}`,
    )
  }
}

export async function installAuthApi(
  context: BrowserContext,
  testInfo: TestInfo,
): Promise<AuthApi> {
  const data = buildRegistrationData(testInfo)
  const counts: Record<RequestName, number> = {
    register: 0,
    login: 0,
    categories: 0,
    profile: 0,
    logout: 0,
  }
  let expected: ExpectedRequestCounts = {}
  let registeredCustomer: RegistrationRequest | null = null
  const lastReadAt: Partial<Record<'categories' | 'profile', number>> = {}

  const increment = (name: RequestName) => {
    counts[name] += 1
  }

  const incrementReadCycle = (name: 'categories' | 'profile') => {
    const now = Date.now()
    const previous = lastReadAt[name] ?? 0
    if (now - previous > 250) {
      increment(name)
    }
    lastReadAt[name] = now
  }

  await context.route(API_PATTERN, async (route) => {
    const request = route.request()
    const url = new URL(request.url())

    if (url.pathname === '/api/v1/cliente') {
      requireMethod(route, 'POST')
      increment('register')
      const body = readJson<RegistrationRequest>(route)
      const expectedBody: RegistrationRequest = {
        senha: data.password,
        cpf: data.cpf,
        nome: data.name,
        dataNascimento: data.birthDate,
        email: data.email,
        endereco: {
          logradouro: data.street,
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
        throw new Error(
          `Unexpected registration body: ${JSON.stringify(body)}`,
        )
      }
      registeredCustomer = body
      await json(
        route,
        { status: true, data: { clienteId: data.customerId } },
        201,
      )
      return
    }

    if (url.pathname === '/api/v1/auth/login') {
      requireMethod(route, 'POST')
      increment('login')
      const body = readJson<LoginRequest>(route)
      if (
        registeredCustomer === null ||
        body.email !== registeredCustomer.email ||
        body.senha !== registeredCustomer.senha
      ) {
        throw new Error(`Unexpected login body: ${JSON.stringify(body)}`)
      }
      await json(route, {
        status: true,
        data: {
          token: TOKEN,
          tipo: 'Bearer',
          expiraEm: '2099-12-31T23:59:59-03:00',
          usuarioId: data.userId,
          clienteId: data.customerId,
          email: data.email,
        },
      })
      return
    }

    if (url.pathname === '/api/v1/categoria') {
      requireMethod(route, 'GET')
      incrementReadCycle('categories')
      await json(route, { status: true, data: [] })
      return
    }

    if (url.pathname === `/api/v1/cliente/${data.customerId}`) {
      requireMethod(route, 'GET')
      requireAuthorization(route)
      incrementReadCycle('profile')
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

    if (url.pathname === '/api/v1/auth/logout') {
      requireMethod(route, 'POST')
      requireAuthorization(route)
      increment('logout')
      await route.fulfill({ status: 204, body: '' })
      return
    }

    await route.abort('blockedbyclient')
    throw new Error(
      `Unexpected API request: ${request.method()} ${request.url()}`,
    )
  })

  return {
    data,
    expectRequestCounts(nextExpected) {
      expected = { ...nextExpected }
    },
    assertRequestCounts() {
      const mismatches = (Object.keys(counts) as RequestName[]).flatMap(
        (name) => {
          const wanted = expected[name] ?? 0
          return counts[name] === wanted
            ? []
            : [`${name}: expected ${wanted}, received ${counts[name]}`]
        },
      )
      if (mismatches.length > 0) {
        throw new Error(`Request count mismatch:\n${mismatches.join('\n')}`)
      }
    },
    reset() {
      registeredCustomer = null
      expected = {}
      ;(Object.keys(counts) as RequestName[]).forEach((name) => {
        counts[name] = 0
      })
      delete lastReadAt.categories
      delete lastReadAt.profile
    },
  }
}
