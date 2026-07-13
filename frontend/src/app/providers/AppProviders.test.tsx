import { useQueryClient } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { queryClient } from '../../shared/query/queryClient'
import { AppProviders } from './AppProviders'
import { useFeedback } from './feedbackContext'

function ProviderConsumer() {
  const location = useLocation()
  const currentQueryClient = useQueryClient()
  const { announce } = useFeedback()

  return (
    <>
      <p>Rota: {location.pathname}</p>
      <p>Query client: {currentQueryClient === queryClient ? 'ativo' : 'inativo'}</p>
      <button type="button" onClick={() => announce('Operação concluída')}>
        Publicar feedback
      </button>
    </>
  )
}

describe('AppProviders', () => {
  it('composes router, query and feedback providers', () => {
    render(
      <AppProviders>
        <ProviderConsumer />
      </AppProviders>,
    )

    expect(screen.getByText(`Rota: ${window.location.pathname}`)).toBeInTheDocument()
    expect(screen.getByText('Query client: ativo')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Publicar feedback' }))

    expect(screen.getByRole('status')).toHaveTextContent('Operação concluída')
  })
})
