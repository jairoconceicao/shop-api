type MockEnvironment = {
  DEV: boolean
  VITE_ENABLE_MSW?: string
}

export function isMockingEnabled(environment: MockEnvironment) {
  return environment.DEV && environment.VITE_ENABLE_MSW === 'true'
}

export async function enableMocking() {
  if (!isMockingEnabled(import.meta.env)) {
    return
  }

  const { worker } = await import('./browser')

  await worker.start({ onUnhandledRequest: 'bypass' })
}
