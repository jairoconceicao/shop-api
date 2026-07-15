import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AppError } from '../../../shared/errors/appError'
import { CancelOrderDialog } from './CancelOrderDialog'

describe('CancelOrderDialog', () => {
  it('focuses the safe action and confirms once', () => {
    const onConfirm = vi.fn()
    render(<CancelOrderDialog open pending={false} error={null} onCancel={vi.fn()} onConfirm={onConfirm} />)
    expect(screen.getByRole('button', { name: 'Voltar' })).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar pedido' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('blocks duplicate confirmation and closing while pending', () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    render(<CancelOrderDialog open pending error={null} onCancel={onCancel} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancelando pedido...' }))
    expect(screen.getByRole('button', { name: 'Cancelando pedido...' })).toBeDisabled()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(onCancel).not.toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('shows a general error for API failures', () => {
    render(<CancelOrderDialog open pending={false} error={new AppError({ kind: 'http', status: 404, message: 'ausente' })} onCancel={vi.fn()} onConfirm={vi.fn()} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível cancelar o pedido. Tente novamente.')
  })
})
