import { apiClient } from '../../../shared/api/apiClient'
import { mapContractError } from '../../../shared/errors/appError'
import {
  adaptCustomerProfileResponse,
  adaptCustomerIdResponse,
  type CustomerProfile,
  type UpdateCustomerRequest,
} from '../contracts/customerProfile'
import type { CustomerPasswordRequest } from '../contracts/customerPassword'

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

export type UpdateCustomerProfileVariables = {
  customerId: number
  token: string
  request: UpdateCustomerRequest
}

export async function updateCustomerProfile(
  variables: UpdateCustomerProfileVariables,
  client: CustomerProfileApiClient = apiClient,
): Promise<{ customerId: number }> {
  const response = await client.request<unknown>(`/api/v1/cliente/${variables.customerId}`, {
    method: 'PUT', token: variables.token, body: variables.request,
  })
  try {
    return adaptCustomerIdResponse(response, variables.customerId)
  } catch (error) {
    throw mapContractError(error)
  }
}

export type UpdateCustomerPasswordVariables = {
  customerId: number
  token: string
  request: CustomerPasswordRequest
}

export async function updateCustomerPassword(
  variables: UpdateCustomerPasswordVariables,
  client: CustomerProfileApiClient = apiClient,
): Promise<{ customerId: number }> {
  const response = await client.request<unknown>(`/api/v1/cliente/${variables.customerId}/senha`, {
    method: 'PUT', token: variables.token, body: variables.request,
  })
  try {
    return adaptCustomerIdResponse(response, variables.customerId)
  } catch (error) {
    throw mapContractError(error)
  }
}
