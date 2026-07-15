import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { OrdersPeriodFilter } from './OrdersPeriodFilter'

function LocationProbe() {
  const location = useLocation()
  const navigate = useNavigate()
  return <><output aria-label="URL atual">{location.search}</output><button onClick={() => navigate(-1)}>Voltar</button></>
}

function renderFilter(entries = ['/pedidos?page=4']) {
  return render(<MemoryRouter initialEntries={entries}><OrdersPeriodFilter /><LocationProbe /></MemoryRouter>)
}

describe('OrdersPeriodFilter', () => {
  it('applies labeled dates and resets pagination', () => {
    renderFilter()

    fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2026-07-01' } })
    fireEvent.change(screen.getByLabelText('Data final'), { target: { value: '2026-07-15' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar período' }))

    expect(screen.getByLabelText('URL atual')).toHaveTextContent('?dataInicio=2026-07-01&dataFim=2026-07-15')
  })

  it('shows an alert and does not navigate for a reversed range', () => {
    renderFilter()
    fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2026-07-16' } })
    fireEvent.change(screen.getByLabelText('Data final'), { target: { value: '2026-07-15' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar período' }))

    expect(screen.getByRole('alert')).toHaveTextContent('A data inicial deve ser anterior ou igual à data final.')
    expect(screen.getByLabelText('URL atual')).toHaveTextContent('?page=4')
  })

  it('clears the period and resets pagination', () => {
    renderFilter(['/pedidos?dataInicio=2026-07-01&dataFim=2026-07-15&page=2'])
    fireEvent.click(screen.getByRole('button', { name: 'Limpar período' }))

    expect(screen.getByLabelText('URL atual')).toBeEmptyDOMElement()
    expect(screen.getByLabelText('Data inicial')).toHaveValue('')
    expect(screen.getByLabelText('Data final')).toHaveValue('')
  })

  it('reflects browser history inputs in the controls', () => {
    renderFilter(['/pedidos?dataInicio=2026-06-01', '/pedidos?dataFim=2026-07-15'])
    expect(screen.getByLabelText('Data final')).toHaveValue('2026-07-15')

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }))

    expect(screen.getByLabelText('Data inicial')).toHaveValue('2026-06-01')
    expect(screen.getByLabelText('Data final')).toHaveValue('')
  })
})
