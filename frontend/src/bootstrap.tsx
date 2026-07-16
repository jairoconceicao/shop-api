import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import { AppProviders } from './app/providers/AppProviders'
import { enableMocking } from './shared/testing/enableMocking'

export type BootstrapOptions = {
  enableMocking?: () => Promise<void>
  getRootElement?: () => HTMLElement | null
  render?: (root: HTMLElement) => void
  reportMockingFailure?: (message: string, error: unknown) => void
}

function renderApplication(root: HTMLElement) {
  createRoot(root).render(
    <StrictMode>
      <AppProviders>
        <App />
      </AppProviders>
    </StrictMode>,
  )
}

export async function bootstrap(options: BootstrapOptions = {}) {
  const startMocking = options.enableMocking ?? enableMocking
  try {
    await startMocking()
  } catch (error) {
    const report = options.reportMockingFailure
      ?? ((message: string, cause: unknown) => console.error(message, cause))
    report('Falha ao iniciar MSW.', error)
  }

  const rootElement = (options.getRootElement
    ?? (() => document.getElementById('root')))()
  if (!rootElement) throw new Error('Elemento raiz da aplicação não encontrado.')

  ;(options.render ?? renderApplication)(rootElement)
}
