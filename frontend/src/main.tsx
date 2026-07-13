import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { AppProviders } from './app/providers/AppProviders'
import { enableMocking } from './shared/testing/enableMocking'

await enableMocking()

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Elemento raiz da aplicação não encontrado.')
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
