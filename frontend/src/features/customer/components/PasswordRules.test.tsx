import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PasswordRules } from './PasswordRules'

describe('PasswordRules', () => {
  it('always exposes four semantic rule items with visible pending state', () => {
    render(<PasswordRules value="" />)

    const list = screen.getByRole('list', { name: 'Regras da nova senha' })
    const items = screen.getAllByRole('listitem')

    expect(list).toBeVisible()
    expect(items).toHaveLength(4)
    expect(screen.getByText('Mínimo de oito caracteres')).toBeVisible()
    expect(screen.getByText('Uma letra maiúscula')).toBeVisible()
    expect(screen.getByText('Um número')).toBeVisible()
    expect(screen.getByText('Um caractere especial entre !@#$%')).toBeVisible()
    expect(screen.getAllByText('Pendente')).toHaveLength(4)
    expect(screen.queryByText('Atendida')).not.toBeInTheDocument()
  })

  it('renders icons as decorative and communicates state with text rather than color alone', () => {
    const { container } = render(<PasswordRules value="Abcdef1!" />)

    expect(screen.getAllByText('Atendida')).toHaveLength(4)
    expect(screen.queryByText('Pendente')).not.toBeInTheDocument()
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(4)
  })

  it('recalculates each rule when the value changes', () => {
    const { rerender } = render(<PasswordRules value="Abcdef12" />)

    expect(screen.getAllByText('Atendida')).toHaveLength(3)
    expect(screen.getAllByText('Pendente')).toHaveLength(1)

    rerender(<PasswordRules value="abcdef1!" />)

    expect(screen.getAllByText('Atendida')).toHaveLength(3)
    expect(screen.getAllByText('Pendente')).toHaveLength(1)

    rerender(<PasswordRules value="Abcdef1!" />)

    expect(screen.getAllByText('Atendida')).toHaveLength(4)
    expect(screen.queryByText('Pendente')).not.toBeInTheDocument()
  })
})
