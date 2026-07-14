import type { QueryClient } from '@tanstack/react-query'

export const privateCacheMeta = { private: true } as const

export function clearPrivateCache(queryClient: QueryClient) {
  queryClient.removeQueries({ predicate: (query) => query.meta?.private === true })

  const mutationCache = queryClient.getMutationCache()
  mutationCache
    .getAll()
    .filter((mutation) => mutation.meta?.private === true)
    .forEach((mutation) => mutationCache.remove(mutation))
}
