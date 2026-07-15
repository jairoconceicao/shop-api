import { apiClient } from '../../../shared/api/apiClient'
import { mapContractError } from '../../../shared/errors/appError'
import {
  adaptCustomerProfileResponse,
  type CustomerProfile,
} from '../contracts/customerProfile'

type CustomerProfileApiClient = Pick<typeof apiClient, 'request'>

export async function getCustomerProfile(
  customerId: number,
  token: string,
  signal?: AbortSignal,
  client: CustomerProfileApiClient = apiClient,
): Promise<CustomerProfile> {
  const response = await client.request<unknown>(`/api/v1/cliente/${customerId}`, {
    token,
    signal,
  })

  try {
    return adaptCustomerProfileResponse(response)
  } catch (error) {
    throw mapContractError(error)
  }
}
