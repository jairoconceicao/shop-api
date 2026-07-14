import { apiClient } from '../../../shared/api/apiClient'

type LogoutApiClient = Pick<typeof apiClient, 'request'>

export async function logout(token: string, client: LogoutApiClient = apiClient): Promise<void> {
  await client.request('/api/v1/auth/logout', {
    method: 'POST',
    token,
  })
}
