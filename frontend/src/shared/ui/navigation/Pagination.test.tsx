import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('exposes the current page and navigation limits', () => {
    render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />)

    expect(screen.getByRole('navigation', { name: 'Paginação' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Página 1', current: 'page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeEnabled()
  })

  it('changes page through page, previous and next buttons', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Página 5' }))
    expect(onPageChange).toHaveBeenLastCalledWith(5)
    fireEvent.click(screen.getByRole('button', { name: 'Página anterior' }))
    expect(onPageChange).toHaveBeenLastCalledWith(2)
    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }))
    expect(onPageChange).toHaveBeenLastCalledWith(4)
  })

  it('supports arrow, Home and End keys without leaving the valid range', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={3} totalPages={8} onPageChange={onPageChange} />)
    const pagination = screen.getByRole('navigation', { name: 'Paginação' })

    fireEvent.keyDown(pagination, { key: 'ArrowLeft' })
    expect(onPageChange).toHaveBeenLastCalledWith(2)
    fireEvent.keyDown(pagination, { key: 'ArrowRight' })
    expect(onPageChange).toHaveBeenLastCalledWith(4)
    fireEvent.keyDown(pagination, { key: 'Home' })
    expect(onPageChange).toHaveBeenLastCalledWith(1)
    fireEvent.keyDown(pagination, { key: 'End' })
    expect(onPageChange).toHaveBeenLastCalledWith(8)
  })

  it('keeps large page sets compact', () => {
    render(<Pagination page={6} totalPages={12} onPageChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Página 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Página 6', current: 'page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Página 12' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Página 3' })).not.toBeInTheDocument()
  })
})
