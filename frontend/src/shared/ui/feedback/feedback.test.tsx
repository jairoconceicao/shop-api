import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { InlineAlert } from './InlineAlert'
import { Toast } from './Toast'

describe('InlineAlert', () => {
  it('renders error feedback and an optional action accessibly', () => {
    render(
      <InlineAlert title="Pagamento recusado" variant="error" action={<button>Tentar novamente</button>}>
        Confira os dados do cartão.
      </InlineAlert>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Pagamento recusado')
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })
})

describe('Toast', () => {
  it('announces its message and can be dismissed', () => {
    const onDismiss = vi.fn()
    render(<Toast message="Produto adicionado" variant="success" onDismiss={onDismiss} />)

    expect(screen.getByRole('status')).toHaveTextContent('Produto adicionado')
    fireEvent.click(screen.getByRole('button', { name: 'Fechar notificação' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })
})
