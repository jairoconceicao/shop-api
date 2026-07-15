import { apiClient } from '../../../shared/api/apiClient'
import { mapContractError } from '../../../shared/errors/appError'
import { adaptCustomerIdResponse } from '../contracts/customerProfile'

type DeleteCustomerApiClient = Pick<typeof apiClient, 'request'>

export type DeleteCustomerVariables = { customerId: number; token: string }

export async function deleteCustomer(
  variables: DeleteCustomerVariables,
  client: DeleteCustomerApiClient = apiClient,
): Promise<{ customerId: number }> {
  const response = await client.request<unknown>(`/api/v1/cliente/${variables.customerId}`, {
    method: 'DELETE',
    token: variables.token,
  })
  try {
    return adaptCustomerIdResponse(response, variables.customerId)
  } catch (error) {
    throw mapContractError(error)
  }
}
