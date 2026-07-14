import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import { clearPrivateCache, privateCacheMeta } from './privateCache'

describe('clearPrivateCache', () => {
  it('removes private queries and mutations while preserving public cache', () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(['catalog'], ['public product'])
    queryClient.setQueryDefaults(['profile'], { meta: privateCacheMeta })
    queryClient.setQueryData(['profile'], { name: 'Private customer' })
    queryClient.getMutationCache().build(queryClient, {
      mutationKey: ['update-profile'],
      mutationFn: async () => undefined,
      meta: privateCacheMeta,
    })
    queryClient.getMutationCache().build(queryClient, {
      mutationKey: ['public-action'],
      mutationFn: async () => undefined,
    })

    clearPrivateCache(queryClient)

    expect(queryClient.getQueryData(['catalog'])).toEqual(['public product'])
    expect(queryClient.getQueryData(['profile'])).toBeUndefined()
    expect(queryClient.getMutationCache().find({ mutationKey: ['update-profile'] })).toBeUndefined()
    expect(queryClient.getMutationCache().find({ mutationKey: ['public-action'] })).toBeDefined()
  })
})
