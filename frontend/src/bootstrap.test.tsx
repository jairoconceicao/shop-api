import { describe, expect, it, vi } from 'vitest'

import { bootstrap } from './bootstrap'

describe('bootstrap', () => {
  it('awaits mocking before rendering exactly once', async () => {
    let resolveMocking!: () => void
    const mocking = new Promise<void>((resolve) => { resolveMocking = resolve })
    const render = vi.fn()
    const root = document.createElement('div')
    const result = bootstrap({
      enableMocking: () => mocking,
      getRootElement: () => root,
      render,
    })

    expect(render).not.toHaveBeenCalled()
    resolveMocking()
    await result

    expect(render).toHaveBeenCalledOnce()
    expect(render).toHaveBeenCalledWith(root)
  })

  it('reports a mocking startup failure and still renders exactly once', async () => {
    const error = new Error('worker')
    const reportMockingFailure = vi.fn()
    const render = vi.fn()

    await bootstrap({
      enableMocking: () => Promise.reject(error),
      getRootElement: () => document.createElement('div'),
      render,
      reportMockingFailure,
    })

    expect(reportMockingFailure).toHaveBeenCalledWith('Falha ao iniciar MSW.', error)
    expect(render).toHaveBeenCalledOnce()
  })

  it('does not leak an unhandled rejection when mocking startup fails', async () => {
    const unhandled = vi.fn()
    process.on('unhandledRejection', unhandled)
    try {
      await bootstrap({
        enableMocking: () => Promise.reject(new Error('worker')),
        getRootElement: () => document.createElement('div'),
        render: vi.fn(),
        reportMockingFailure: vi.fn(),
      })
      await Promise.resolve()
      expect(unhandled).not.toHaveBeenCalled()
    } finally {
      process.off('unhandledRejection', unhandled)
    }
  })

  it('rejects with the existing root error when #root is absent', async () => {
    await expect(bootstrap({
      enableMocking: () => Promise.resolve(),
      getRootElement: () => null,
    })).rejects.toThrow('Elemento raiz da aplicação não encontrado.')
  })
})
