import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from './Checkbox'
import { FieldError } from './FieldError'
import { FormErrorSummary } from './FormErrorSummary'
import { Input } from './Input'
import { Select } from './Select'

describe('Input', () => {
  it('forwards the disabled state and remains programmatically focusable when enabled', () => {
    render(<><Input label="Nome" /><Input label="CPF" disabled /></>)
    const input = screen.getByRole('textbox', { name: 'Nome' })
    input.focus()
    expect(input).toHaveFocus()
    expect(screen.getByRole('textbox', { name: 'CPF' })).toBeDisabled()
  })

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
  it('toggles with Space while blocking a disabled control', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<><Checkbox id="terms" label="Aceito" error="Aceite obrigatório" onChange={onChange} /><Checkbox label="Indisponível" disabled /></>)
    const checkbox = screen.getByRole('checkbox', { name: 'Aceito' })
    await user.tab()
    await user.keyboard(' ')

    expect(checkbox).toHaveFocus()
    expect(checkbox).toBeChecked()
    expect(checkbox).toHaveAccessibleDescription('Aceite obrigatório')
    expect(onChange).toHaveBeenCalledOnce()
    const disabled = screen.getByRole('checkbox', { name: 'Indisponível' })
    expect(disabled).toBeDisabled()
    expect(disabled).not.toBeChecked()
  })

  it('has a native checkbox role and accessible description', () => {
    render(<Checkbox id="remember" label="Manter conectado" description="Use apenas em dispositivo pessoal" />)

    const checkbox = screen.getByRole('checkbox', { name: 'Manter conectado' })
    expect(checkbox).toHaveAttribute('type', 'checkbox')
    expect(checkbox).toHaveAttribute('aria-describedby', 'remember-description')
  })
})

describe('Select', () => {
  it('changes options through user interaction after keyboard focus and forwards disabled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<><Select label="Entrega" onChange={onChange}><option value="normal">Normal</option><option value="express">Expressa</option></Select><Select label="Pagamento" disabled><option>Pix</option></Select></>)
    const select = screen.getByRole('combobox', { name: 'Entrega' })
    await user.tab()
    await user.selectOptions(select, 'express')

    expect(select).toHaveFocus()
    expect(select).toHaveValue('express')
    expect(onChange).toHaveBeenCalledOnce()
    expect(screen.getByRole('combobox', { name: 'Pagamento' })).toBeDisabled()
  })

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
  it('accepts programmatic focus for validation recovery', () => {
    render(<FormErrorSummary data-testid="summary" errors={[{ message: 'Revise o formulário' }]} />)
    const summary = screen.getByTestId('summary')
    summary.focus()
    expect(summary).toHaveFocus()
  })

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
