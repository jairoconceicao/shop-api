import { apiClient } from '../../../shared/api/apiClient'
import { mapContractError } from '../../../shared/errors/appError'
import {
  adaptCheckoutProfileResponse,
  type CheckoutProfile,
} from '../contracts/customerProfile'

type CheckoutProfileApiClient = Pick<typeof apiClient, 'request'>

export async function getCheckoutProfile(
  customerId: number,
  token: string,
  signal?: AbortSignal,
  client: CheckoutProfileApiClient = apiClient,
): Promise<CheckoutProfile> {
  const response = await client.request<unknown>(`/api/v1/cliente/${customerId}`, {
    token,
    signal,
  })

  try {
    return adaptCheckoutProfileResponse(response)
  } catch (error) {
    throw mapContractError(error)
  }
}
