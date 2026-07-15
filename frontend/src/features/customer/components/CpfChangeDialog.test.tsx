import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CpfChangeDialog } from './CpfChangeDialog'

describe('CpfChangeDialog', () => {
  it('names and describes the confirmation with both masked CPFs', () => {
    render(<CpfChangeDialog open previousCpf="12345678901" nextCpf="98765432100" pending={false} onCancel={vi.fn()} onConfirm={vi.fn()} />)

    const dialog = screen.getByRole('dialog', { name: 'Confirmar alteração do CPF' })
    expect(dialog).toHaveAccessibleDescription()
    expect(dialog).toHaveTextContent('123.456.789-01')
    expect(dialog).toHaveTextContent('987.654.321-00')
    expect(screen.getByRole('button', { name: 'Voltar' })).toHaveFocus()
  })

  it('blocks confirmation and every closing path while pending', () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    render(<CpfChangeDialog open previousCpf="12345678901" nextCpf="98765432100" pending onCancel={onCancel} onConfirm={onConfirm} />)

    expect(screen.getByRole('button', { name: 'Voltar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Confirmando…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Fechar dialogo' })).toBeDisabled()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    fireEvent.click(screen.getByRole('button', { name: 'Fechar dialogo' }))
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement!)

    expect(onCancel).not.toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
