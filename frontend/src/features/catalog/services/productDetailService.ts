import { apiClient } from '../../../shared/api/apiClient'
import { mapContractError } from '../../../shared/errors/appError'
import {
  adaptProductDetailResponse,
  type ProductDetail,
} from '../contracts/catalog'

type ProductDetailApiClient = Pick<typeof apiClient, 'request'>

export async function fetchProductDetail(
  productId: number,
  signal: AbortSignal,
  client: ProductDetailApiClient = apiClient,
): Promise<ProductDetail> {
  const response = await client.request<unknown>(
    `/api/v1/produto/${productId}`,
    { signal },
  )

  try {
    return adaptProductDetailResponse(response)
  } catch (error) {
    throw mapContractError(error)
  }
}
