import { apiClient } from '../../../shared/api/apiClient'
import { mapContractError } from '../../../shared/errors/appError'
import {
  adaptCreateCustomerRequest,
  adaptCreateCustomerResponse,
  type CreateCustomerRequest,
  type CreatedCustomer,
} from '../contracts/registration'

type RegistrationApiClient = Pick<typeof apiClient, 'request'>

export async function registerCustomer(
  request: CreateCustomerRequest,
  client: RegistrationApiClient = apiClient,
): Promise<CreatedCustomer> {
  const body = adaptCreateCustomerRequest(request)
  const response = await client.request<unknown>('/api/v1/cliente', {
    method: 'POST',
    body,
  })

  try {
    return adaptCreateCustomerResponse(response)
  } catch (error) {
    throw mapContractError(error)
  }
}
