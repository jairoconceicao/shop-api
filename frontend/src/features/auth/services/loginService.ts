import { apiClient } from '../../../shared/api/apiClient'
import { mapContractError } from '../../../shared/errors/appError'
import {
  adaptLoginResponse,
  loginRequestSchema,
  type LoginRequest,
} from '../contracts/login'
import type { AuthSession } from '../store/authStore'

type LoginApiClient = Pick<typeof apiClient, 'request'>

export async function login(
  request: LoginRequest,
  client: LoginApiClient = apiClient,
): Promise<AuthSession> {
  const body = loginRequestSchema.parse(request)
  const response = await client.request<unknown>('/api/v1/auth/login', {
    method: 'POST',
    body,
  })

  try {
    return adaptLoginResponse(response)
  } catch (error) {
    throw mapContractError(error)
  }
}
