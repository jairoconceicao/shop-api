import { parseEnvironment } from '../config/environment'
import { mapContractError, mapHttpError, mapNetworkError } from '../errors/appError'

type ApiClientOptions = {
  baseUrl: string | (() => string)
  fetch?: typeof fetch
  onUnauthorized?: () => void
}

export type ApiRequestOptions = {
  method?: string
  body?: unknown
  headers?: HeadersInit
  signal?: AbortSignal
  token?: string
}

function joinUrl(baseUrl: string, path: string): string {
  return new URL(path.replace(/^\/+/, ''), `${baseUrl.replace(/\/+$/, '')}/`).toString()
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text()

  if (!text) {
    return undefined
  }

  return JSON.parse(text) as unknown
}

export function createApiClient({
  baseUrl,
  fetch: fetchImpl,
  onUnauthorized,
}: ApiClientOptions) {
  return {
    async request<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> {
      const headers = new Headers(options.headers)
      headers.set('Accept', 'application/json')

      if (options.body !== undefined) {
        headers.set('Content-Type', 'application/json')
      }

      if (options.token) {
        headers.set('Authorization', `Bearer ${options.token}`)
      }

      let response: Response

      try {
        response = await (fetchImpl ?? fetch)(
          joinUrl(typeof baseUrl === 'function' ? baseUrl() : baseUrl, path),
          {
            method: options.method ?? 'GET',
            headers,
            body: options.body === undefined ? undefined : JSON.stringify(options.body),
            signal: options.signal,
          },
        )
      } catch (error) {
        if (options.signal?.aborted) {
          throw error
        }

        throw mapNetworkError(error)
      }

      let body: unknown

      try {
        body = await readJson(response)
      } catch (error) {
        if (response.ok) {
          throw mapContractError(error)
        }
      }

      if (!response.ok) {
        if (response.status === 401 && options.token) {
          onUnauthorized?.()
        }

        throw mapHttpError(response.status, body)
      }

      return body as T
    },
  }
}

export const apiClient = createApiClient({
  baseUrl: () => parseEnvironment(import.meta.env).VITE_API_BASE_URL,
  onUnauthorized: () => notifyUnauthorized(),
})

type UnauthorizedListener = () => void

const unauthorizedListeners = new Set<UnauthorizedListener>()

export function subscribeToUnauthorized(listener: UnauthorizedListener) {
  unauthorizedListeners.add(listener)

  return () => {
    unauthorizedListeners.delete(listener)
  }
}

function notifyUnauthorized() {
  unauthorizedListeners.forEach((listener) => listener())
}
