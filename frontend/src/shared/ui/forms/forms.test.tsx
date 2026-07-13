import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from './Checkbox'
import { FieldError } from './FieldError'
import { FormErrorSummary } from './FormErrorSummary'
import { Input } from './Input'
import { Select } from './Select'

describe('Input', () => {
  it('associates its label, hint and error with the native input', () => {
    render(<Input id="email" label="E-mail" hint="Use seu e-mail principal" error="E-mail inválido" />)

    const input = screen.getByRole('textbox', { name: 'E-mail' })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'email-hint email-error')
    expect(screen.getByText('E-mail inválido')).toHaveAttribute('id', 'email-error')
  })

  it('forwards native input behavior', () => {
    const onChange = vi.fn()
    render(<Input label="Nome" name="nome" onChange={onChange} />)

    fireEvent.change(screen.getByRole('textbox', { name: 'Nome' }), { target: { value: 'Ana' } })
    expect(onChange).toHaveBeenCalledOnce()
  })
})

describe('Checkbox', () => {
  it('has a native checkbox role and accessible description', () => {
    render(<Checkbox id="remember" label="Manter conectado" description="Use apenas em dispositivo pessoal" />)

    const checkbox = screen.getByRole('checkbox', { name: 'Manter conectado' })
    expect(checkbox).toHaveAttribute('type', 'checkbox')
    expect(checkbox).toHaveAttribute('aria-describedby', 'remember-description')
  })
})

describe('Select', () => {
  it('associates validation feedback and forwards options', () => {
    render(
      <Select id="payment" label="Pagamento" error="Escolha uma opção">
        <option value="">Selecione</option>
        <option value="Pix">Pix</option>
      </Select>,
    )

    const select = screen.getByRole('combobox', { name: 'Pagamento' })
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(select).toHaveAttribute('aria-describedby', 'payment-error')
    expect(screen.getByRole('option', { name: 'Pix' })).toBeInTheDocument()
  })
})

describe('FieldError', () => {
  it('does not render an empty error', () => {
    const { container } = render(<FieldError>{undefined}</FieldError>)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('FormErrorSummary', () => {
  it('renders nothing without errors', () => {
    const { container } = render(<FormErrorSummary errors={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('announces errors and links field errors to their controls', () => {
    render(
      <FormErrorSummary errors={[{ fieldId: 'email', message: 'Informe o e-mail' }, { message: 'Não foi possível enviar' }]} />,
    )

    const summary = screen.getByRole('alert')
    expect(summary).toHaveAttribute('tabindex', '-1')
    expect(screen.getByRole('link', { name: 'Informe o e-mail' })).toHaveAttribute('href', '#email')
    expect(screen.getByText('Não foi possível enviar')).toBeInTheDocument()
  })
})
