import type { BrowserContext, Route, TestInfo } from '@playwright/test'

const API_ORIGIN = 'http://localhost:5228'
const API_PATTERN = `${API_ORIGIN}/api/v1/**`
const TOKEN = 'task-117.header.payload'

export type RequestName =
  | 'register'
  | 'login'
  | 'categories'
  | 'catalog'
  | 'profile'
  | 'profileUpdate'
  | 'passwordUpdate'
  | 'logout'
  | 'product'
  | 'cartCreate'
  | 'cartAdd'
  | 'cartGet'
  | 'cartUpdate'
  | 'cartDelete'
  | 'orderCreate'
  | 'ordersList'
  | 'orderDetail'
  | 'orderProduct'
  | 'orderCancel'
export type ExpectedRequestCounts = Partial<Record<RequestName, number>>
export type RequestCounts = Readonly<Record<RequestName, number>>

export type ProductData = {
  id: number
  title: string
  description: string
  model: string
  price: number
  stock: number
  categoryId: number
  categoryTitle: string
}

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
  product: ProductData
  cartId: number
  cartItemId: number
  orderId: number
  secondaryOrderId: number
}

export type AuthApi = {
  data: RegistrationData
  expectRequestCounts(expected: ExpectedRequestCounts): void
  requestCounts(): RequestCounts
  customerSnapshot(): CustomerSnapshot | null
  seedCustomer(): void
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

type UpdateCustomerRequest = Omit<RegistrationRequest, 'senha'>

type UpdatePasswordRequest = {
  senhaAtual: string
  senhaNova: string
}

type DeliveryAddressRequest = {
  logradouro: string
  numero: string
  complemento: string | null
  cep: string
  bairro: string
  cidade: string
  uf: string
}

type CreateOrderRequest = {
  enderecoEntrega: DeliveryAddressRequest
  formaPagamento: string
  dataPedido: string
  items: Array<{
    itemId: number | null
    produtoId: number
    quantidade: number
    valorUnitario: number
  }>
}

export type CustomerSnapshot = {
  readonly cpf: string
  readonly nome: string
  readonly dataNascimento: string
  readonly email: string
  readonly endereco: {
    readonly logradouro: string
    readonly numero: string
    readonly complemento: string | null
    readonly cep: string
    readonly bairro: string
    readonly cidade: string
    readonly uf: string
  }
  readonly celular: {
    readonly ddd: string
    readonly numero: string
    readonly whatsApp: boolean
  }
}

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
    product: {
      id: 42,
      title: `Notebook TASK-118 ${suffix}`,
      description: 'Produto determinístico para a jornada visitante.',
      model: 'TASK-118',
      price: 3499.9,
      stock: 8,
      categoryId: 118,
      categoryTitle: 'Informática',
    },
    cartId: 30_000 + seed,
    cartItemId: 40_000 + seed,
    orderId: 50_000 + seed,
    secondaryOrderId: 60_000 + seed,
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
  const updatedCpf = `8000000${data.cpf.slice(-4)}`
  const updatedName = `${data.name} Atualizado`
  const updatedEmail = `atualizado-${data.email}`
  const updatedStreet = `${data.street} Atualizada`
  const firstNewPassword = `Primeira@${data.cpf.slice(-4)}A`
  const finalNewPassword = `Final@${data.cpf.slice(-4)}B`
  const counts: Record<RequestName, number> = {
    register: 0,
    login: 0,
    categories: 0,
    catalog: 0,
    profile: 0,
    profileUpdate: 0,
    passwordUpdate: 0,
    logout: 0,
    product: 0,
    cartCreate: 0,
    cartAdd: 0,
    cartGet: 0,
    cartUpdate: 0,
    cartDelete: 0,
    orderCreate: 0,
    ordersList: 0,
    orderDetail: 0,
    orderProduct: 0,
    orderCancel: 0,
  }
  let expected: ExpectedRequestCounts = {}
  let registeredCustomer: RegistrationRequest | null = null
  let passwordAttempts = 0
  let cartItem: {
    itemId: number
    productId: number
    quantity: number
    unitPrice: number
  } | null = null

  const seededCustomer = (): RegistrationRequest => ({
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
  })

  const targetOrder = () => ({
    pedidoId: data.orderId,
    carrinhoId: data.cartId,
    clienteId: data.customerId,
    enderecoEntrega: {
      logradouro: data.street,
      numero: data.number,
      complemento: null,
      cep: data.postalCode,
      bairro: data.district,
      cidade: data.city,
      uf: data.state,
    },
    dataPedido: '2026-07-10T14:30:00-03:00',
    formaPagamento: 'Cartao',
    status: 'Criado',
    items: [
      {
        itemId: data.cartItemId,
        produtoId: data.product.id,
        quantidade: 2,
        valorUnitario: data.product.price,
      },
      {
        itemId: data.cartItemId + 1,
        produtoId: data.product.id,
        quantidade: 1,
        valorUnitario: 3000.1,
      },
    ],
  })

  const secondaryOrder = () => ({
    pedidoId: data.secondaryOrderId,
    carrinhoId: data.cartId + 1,
    clienteId: data.customerId,
    enderecoEntrega: {
      logradouro: data.street,
      numero: data.number,
      complemento: null,
      cep: data.postalCode,
      bairro: data.district,
      cidade: data.city,
      uf: data.state,
    },
    dataPedido: '2026-06-20T09:00:00-03:00',
    formaPagamento: 'Pix',
    status: 'Processado',
    items: [{
      itemId: data.cartItemId + 1,
      produtoId: data.product.id,
      quantidade: 1,
      valorUnitario: data.product.price,
    }],
  })

  const customerSnapshot = (): CustomerSnapshot | null => {
    if (registeredCustomer === null) return null

    return {
      cpf: registeredCustomer.cpf,
      nome: registeredCustomer.nome,
      dataNascimento: registeredCustomer.dataNascimento,
      email: registeredCustomer.email,
      endereco: { ...registeredCustomer.endereco },
      celular: { ...registeredCustomer.celular },
    }
  }

  const increment = (name: RequestName) => {
    counts[name] += 1
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
      for (const name of [
        'cartCreate',
        'cartAdd',
        'cartGet',
        'cartUpdate',
        'cartDelete',
      ] as const) {
        if (counts[name] !== 0) {
          throw new Error(
            `Cart request ${name} occurred before login processing`,
          )
        }
      }
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

    if (url.pathname === `/api/v1/produto/${data.product.id}`) {
      requireMethod(route, 'GET')
      if (request.postData() !== null) {
        throw new Error(
          `Expected empty product body, received ${request.postData()}`,
        )
      }
      increment(counts.orderDetail > 0 ? 'orderProduct' : 'product')
      await json(route, {
        status: true,
        data: {
          produtoId: data.product.id,
          titulo: data.product.title,
          descricao: data.product.description,
          modelo: data.product.model,
          foto: null,
          preco: data.product.price,
          estoque: data.product.stock,
          categoria: {
            categoriaId: data.product.categoryId,
            titulo: data.product.categoryTitle,
          },
        },
      })
      return
    }

    if (url.pathname === '/api/v1/carrinho/criar') {
      requireMethod(route, 'POST')
      requireAuthorization(route)
      increment('cartCreate')
      if (request.postData() !== null) {
        throw new Error(
          `Expected empty cart creation body, received ${request.postData()}`,
        )
      }
      await json(
        route,
        {
          status: true,
          data: {
            carrinhoId: data.cartId,
            dataCarrinho: '2026-07-16T12:00:00-03:00',
          },
        },
        201,
      )
      return
    }

    if (url.pathname === '/api/v1/carrinho/items') {
      requireMethod(route, 'POST')
      requireAuthorization(route)
      increment('cartAdd')
      const body = readJson<{
        produtoId: number
        quantidade: number
        valorUnitario: number
      }>(route)
      const expectedBody = {
        produtoId: data.product.id,
        quantidade: 3,
        valorUnitario: data.product.price,
      }
      if (JSON.stringify(body) !== JSON.stringify(expectedBody)) {
        throw new Error(`Unexpected cart item body: ${JSON.stringify(body)}`)
      }
      cartItem = {
        itemId: data.cartItemId,
        productId: body.produtoId,
        quantity: body.quantidade,
        unitPrice: body.valorUnitario,
      }
      await json(
        route,
        {
          status: true,
          data: { itemId: data.cartItemId },
        },
        201,
      )
      return
    }

    if (url.pathname === `/api/v1/carrinho/items/${data.cartItemId}`) {
      requireAuthorization(route)

      if (request.method() === 'PATCH') {
        increment('cartUpdate')
        const body = readJson<{ quantidade: number }>(route)
        const expectedBody = { quantidade: 4 }
        if (JSON.stringify(body) !== JSON.stringify(expectedBody)) {
          throw new Error(
            `Unexpected cart update body: ${JSON.stringify(body)}`,
          )
        }
        if (cartItem === null) {
          throw new Error('Cannot update a cart item before it is added')
        }
        cartItem = { ...cartItem, quantity: body.quantidade }
        await json(route, {
          status: true,
          data: {
            itemId: data.cartItemId,
            produtoId: data.product.id,
          },
        })
        return
      }

      if (request.method() === 'DELETE') {
        increment('cartDelete')
        if (request.postData() !== null) {
          throw new Error(
            `Expected empty cart delete body, received ${request.postData()}`,
          )
        }
        if (cartItem === null) {
          throw new Error('Cannot delete a cart item before it is added')
        }
        cartItem = null
        await json(route, {
          status: true,
          data: {
            itemId: data.cartItemId,
            produtoId: data.product.id,
          },
        })
        return
      }

      throw new Error(
        `Expected PATCH or DELETE ${request.url()}, received ${request.method()}`,
      )
    }

    if (url.pathname === `/api/v1/carrinho/${data.cartId}`) {
      requireMethod(route, 'GET')
      requireAuthorization(route)
      increment('cartGet')
      await json(route, {
        status: true,
        data: {
          clienteId: data.customerId,
          carrinhoId: data.cartId,
          dataCarrinho: '2026-07-16T12:00:00-03:00',
          items:
            cartItem === null
              ? []
              : [
                  {
                    itemId: cartItem.itemId,
                    produtoId: cartItem.productId,
                    quantidade: cartItem.quantity,
                    valorUnitario: cartItem.unitPrice,
                  },
                ],
        },
      })
      return
    }

    if (url.pathname === '/api/v1/produto') {
      requireMethod(route, 'GET')
      if (url.search !== '?page=1&size=20') {
        throw new Error(`Unexpected catalog query: ${url.search}`)
      }
      increment('catalog')
      await json(route, {
        status: true,
        pagination: { pages: 0, size: 20, totalItems: 0, data: [] },
      })
      return
    }

    if (url.pathname === '/api/v1/categoria') {
      requireMethod(route, 'GET')
      increment('categories')
      await json(route, { status: true, data: [] })
      return
    }

    if (url.pathname === '/api/v1/pedido' && request.method() === 'GET') {
      requireAuthorization(route)
      increment('ordersList')
      if (request.postData() !== null) {
        throw new Error(
          `Expected empty orders list body, received ${request.postData()}`,
        )
      }

      const query = url.searchParams
      const expectedCpf = registeredCustomer?.cpf
      if (!expectedCpf || query.get('cpf') !== expectedCpf) {
        throw new Error(`Unexpected orders CPF: ${query.get('cpf')}`)
      }
      if (query.get('page') !== '1' || query.get('size') !== '20') {
        throw new Error(`Unexpected orders pagination: ${url.search}`)
      }

      const start = query.get('dataInicio')
      const end = query.get('dataFim')
      const isUnfiltered =
        start === null
        && end === null
        && [...query.keys()].sort().join(',') === 'cpf,page,size'
      const isFiltered =
        start === '2026-07-01T03:00:00.000Z'
        && end === '2026-07-16T02:59:59.999Z'
        && [...query.keys()].sort().join(',')
          === 'cpf,dataFim,dataInicio,page,size'

      if (!isUnfiltered && !isFiltered) {
        throw new Error(`Unexpected orders query: ${url.search}`)
      }

      const orders = isFiltered
        ? [targetOrder()]
        : [targetOrder(), secondaryOrder()]
      await json(route, {
        status: true,
        pagination: {
          pages: 1,
          size: 20,
          totalItems: orders.length,
          data: orders,
        },
      })
      return
    }

    if (url.pathname === `/api/v1/pedido/${data.orderId}`) {
      requireAuthorization(route)

      if (request.method() === 'GET') {
        increment('orderDetail')
        if (request.postData() !== null) {
          throw new Error(
            `Expected empty order detail body, received ${request.postData()}`,
          )
        }
        await json(route, { status: true, data: targetOrder() })
        return
      }

      if (request.method() === 'PATCH') {
        increment('orderCancel')
        const body = readJson<{ status: string }>(route)
        const expectedBody = { status: 'Cancelado' }
        if (JSON.stringify(body) !== JSON.stringify(expectedBody)) {
          throw new Error(
            `Unexpected order cancellation body: ${JSON.stringify(body)}`,
          )
        }
        await json(route, {
          error: {
            code: 'ORDER_NOT_CANCELLABLE',
            message: 'Pedido não pode ser cancelado.',
          },
        }, 422)
        return
      }

      throw new Error(
        `Expected GET or PATCH ${request.url()}, received ${request.method()}`,
      )
    }

    if (url.pathname === '/api/v1/pedido') {
      requireMethod(route, 'POST')
      requireAuthorization(route)
      increment('orderCreate')

      if (registeredCustomer === null || cartItem === null) {
        throw new Error('Cannot create an order without customer and cart item')
      }

      const body = readJson<CreateOrderRequest>(route)
      const expectedBody = {
        enderecoEntrega: {
          ...registeredCustomer.endereco,
          logradouro: `${data.street} — somente pedido`,
        },
        formaPagamento: 'Cartao',
        items: [{
          itemId: cartItem.itemId,
          produtoId: cartItem.productId,
          quantidade: cartItem.quantity,
          valorUnitario: cartItem.unitPrice,
        }],
      }
      const { dataPedido, ...bodyWithoutDate } = body

      if (JSON.stringify(bodyWithoutDate) !== JSON.stringify(expectedBody)) {
        throw new Error(`Unexpected order body: ${JSON.stringify(body)}`)
      }
      if (
        typeof dataPedido !== 'string'
        || Number.isNaN(Date.parse(dataPedido))
        || !/(?:Z|[+-]\d{2}:\d{2})$/.test(dataPedido)
      ) {
        throw new Error(
          `Expected ISO order date with offset, received ${dataPedido}`,
        )
      }
      if ('clienteId' in body || 'carrinhoId' in body) {
        throw new Error(
          `Forbidden order identifiers: ${JSON.stringify(body)}`,
        )
      }

      const total = cartItem.quantity * cartItem.unitPrice
      cartItem = null
      await json(route, {
        status: true,
        data: {
          pedidoId: data.orderId,
          clienteId: data.customerId,
          dataPedido,
          formaPagamento: 'Cartao',
          status: 'Criado',
          valorTotal: total,
        },
      }, 201)
      return
    }

    if (url.pathname === `/api/v1/cliente/${data.customerId}/senha`) {
      requireMethod(route, 'PUT')
      requireAuthorization(route)
      increment('passwordUpdate')

      if (registeredCustomer === null) {
        throw new Error('Password update requested before customer seed')
      }
      if (passwordAttempts >= 2) {
        throw new Error('Unexpected additional password update attempt')
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
            cep: data.postalCode.replace(/(\d{5})(\d{3})/, '$1-$2'),
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
            `Unexpected profile update body: ${JSON.stringify(body)}`,
          )
        }
        if ('clienteId' in body || 'senha' in body) {
          throw new Error(
            `Forbidden profile fields: ${JSON.stringify(body)}`,
          )
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
    requestCounts() {
      return { ...counts }
    },
    customerSnapshot() {
      return customerSnapshot()
    },
    seedCustomer() {
      registeredCustomer = seededCustomer()
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
      passwordAttempts = 0
      cartItem = null
      registeredCustomer = null
      expected = {}
      ;(Object.keys(counts) as RequestName[]).forEach((name) => {
        counts[name] = 0
      })
    },
  }
}
