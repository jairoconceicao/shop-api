import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useOutletContext } from 'react-router-dom'

import { Button } from '../../../shared/ui/buttons/Button'
import { AppError } from '../../../shared/errors/appError'
import { InlineAlert } from '../../../shared/ui/feedback/InlineAlert'
import { FormErrorSummary, type FormError } from '../../../shared/ui/forms/FormErrorSummary'
import { Input } from '../../../shared/ui/forms/Input'
import { Card } from '../../../shared/ui/surfaces/Card'
import type { Cart } from '../../cart/contracts/cart'
import {
  checkoutFormSchema,
  type CheckoutFormValues,
  type PaymentMethod,
} from '../contracts/checkout'
import type { CheckoutProfile } from '../contracts/customerProfile'
import { useCreateOrderMutation } from '../mutations/useCreateOrderMutation'

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const payments: readonly { value: PaymentMethod; label: string; description: string }[] = [
  { value: 'Pix', label: 'Pix', description: 'Pagamento instantâneo.' },
  { value: 'Cartao', label: 'Cartão', description: 'Pagamento com cartão.' },
  { value: 'Boleto', label: 'Boleto', description: 'Pagamento por boleto bancário.' },
]

const addressFields = [
  ['logradouro', 'Logradouro', 'address-line1'],
  ['numero', 'Número', 'address-line2'],
  ['complemento', 'Complemento (opcional)', 'address-line3'],
  ['cep', 'CEP', 'postal-code'],
  ['bairro', 'Bairro', undefined],
  ['cidade', 'Cidade', 'address-level2'],
  ['uf', 'UF', 'address-level1'],
] as const

type AddressField = (typeof addressFields)[number][0]

const fieldMessages: Record<AddressField | 'formaPagamento', string> = {
  logradouro: 'Informe o logradouro.',
  numero: 'Informe o número.',
  complemento: 'Informe um complemento válido.',
  cep: 'Informe um CEP com 8 dígitos.',
  bairro: 'Informe o bairro.',
  cidade: 'Informe a cidade.',
  uf: 'Informe uma UF com 2 letras.',
  formaPagamento: 'Selecione uma forma de pagamento.',
}

type CheckoutRouteContext = { cart: Cart; profile: CheckoutProfile }

export interface CheckoutPageProps {
  cart?: Cart
  profile?: CheckoutProfile
}

export function CheckoutPage(props: CheckoutPageProps = {}) {
  const routeContext = useOutletContext<CheckoutRouteContext | undefined>()
  const cart = props.cart ?? routeContext?.cart
  const profile = props.profile ?? routeContext?.profile
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const submissionInFlightRef = useRef(false)
  const [invalidSubmissions, setInvalidSubmissions] = useState(0)
  const createOrderMutation = useCreateOrderMutation()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    defaultValues: profile
      ? { enderecoEntrega: profile.address, formaPagamento: 'Pix' }
      : undefined,
  })

  const submitValidValues = (values: CheckoutFormValues) => {
    const parsed = checkoutFormSchema.safeParse({
      ...values,
      enderecoEntrega: {
        ...values.enderecoEntrega,
        complemento: values.enderecoEntrega.complemento?.trim() || null,
        uf: values.enderecoEntrega.uf.toUpperCase(),
      },
    })

    if (parsed.success) {
      if (!cart || submissionInFlightRef.current || createOrderMutation.isPending) return

      submissionInFlightRef.current = true
      createOrderMutation.reset()
      createOrderMutation.mutate(
        { values: parsed.data, cart },
        {
          onError: () => { submissionInFlightRef.current = false },
          onSuccess: (createdOrder) => {
            navigate(`/pedido-confirmado/${createdOrder.id}`, {
              state: { createdOrder },
            })
          },
        },
      )
      return
    }

    parsed.error.issues.forEach((issue) => {
      const field = issue.path.at(-1)
      if (typeof field !== 'string' || !(field in fieldMessages)) return
      const path = issue.path[0] === 'enderecoEntrega'
        ? `enderecoEntrega.${field}` as `enderecoEntrega.${AddressField}`
        : 'formaPagamento'
      setError(path, { type: 'validate', message: fieldMessages[field as keyof typeof fieldMessages] })
    })
    setInvalidSubmissions((count) => count + 1)
  }
  // React Hook Form invokes this callback only from the form submit event.
  // eslint-disable-next-line react-hooks/refs
  const submit = handleSubmit(submitValidValues)

  const formErrors: FormError[] = addressFields.flatMap(([field]) => {
    const message = errors.enderecoEntrega?.[field]?.message
    return message ? [{ fieldId: `checkout-${field}`, message }] : []
  })
  if (errors.formaPagamento?.message) {
    formErrors.push({ fieldId: 'checkout-payment-Pix', message: errors.formaPagamento.message })
  }

  const submissionError = createOrderMutation.error
  const submissionErrorMessage = submissionError instanceof AppError && submissionError.status === 409
    ? 'Revise o carrinho antes de tentar novamente.'
    : submissionError instanceof AppError && submissionError.status === 422
      ? 'Revise os dados do pedido e tente novamente.'
      : 'Tente confirmar novamente. Se o problema continuar, volte ao carrinho.'

  useEffect(() => {
    if (invalidSubmissions > 0) errorSummaryRef.current?.focus()
  }, [invalidSubmissions])

  const subtotal = (cart?.items ?? []).reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )

  return (
    <main className="container-page py-8 sm:py-10 lg:py-12">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">Checkout</h1>
        <p className="mt-2 text-zinc-400">Revise o endereço e escolha como deseja pagar.</p>
      </header>

      <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start" noValidate onSubmit={submit}>
        <div className="space-y-6">
          <FormErrorSummary errors={formErrors} ref={errorSummaryRef} />
          {submissionError ? (
            <InlineAlert title="Não foi possível confirmar o pedido" variant="error">
              {submissionErrorMessage}
            </InlineAlert>
          ) : null}

          <Card className="p-5 sm:p-6">
            <fieldset className="grid gap-5 sm:grid-cols-2">
              <legend className="col-span-full mb-1 text-xl font-semibold text-zinc-100">Endereço de entrega</legend>
              <p className="col-span-full text-sm text-zinc-400">As alterações valem somente para este pedido.</p>
              {addressFields.map(([field, label, autoComplete]) => (
                <Input
                  autoComplete={autoComplete}
                  error={errors.enderecoEntrega?.[field]?.message}
                  id={`checkout-${field}`}
                  inputMode={field === 'cep' ? 'numeric' : undefined}
                  key={field}
                  label={label}
                  maxLength={field === 'uf' ? 2 : undefined}
                  wrapperClassName={field === 'logradouro' ? 'sm:col-span-2' : undefined}
                  {...register(`enderecoEntrega.${field}`)}
                />
              ))}
            </fieldset>
          </Card>

          <Card className="p-5 sm:p-6">
            <fieldset>
              <legend className="text-xl font-semibold text-zinc-100">Forma de pagamento</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {payments.map((payment) => (
                  <label className="cursor-pointer rounded-xl border border-ink-700 p-4 transition hover:border-brand-500 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-500/10" key={payment.value}>
                    <span className="flex items-center gap-3 font-semibold text-zinc-100">
                      <input aria-label={payment.label} id={`checkout-payment-${payment.value}`} type="radio" value={payment.value} {...register('formaPagamento')} />
                      {payment.label}
                    </span>
                    <span className="mt-2 block text-sm text-zinc-400">{payment.description}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </Card>
        </div>

        <aside aria-label="Resumo do carrinho" className="lg:sticky lg:top-28">
          <Card className="p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-zinc-100">Resumo</h2>
            <dl className="mt-5 space-y-4">
              <div className="flex justify-between gap-4 text-zinc-300"><dt>Subtotal</dt><dd>{brlFormatter.format(subtotal)}</dd></div>
              <div className="flex justify-between gap-4 border-t border-ink-700 pt-4 text-lg font-semibold text-zinc-50"><dt>Total</dt><dd>{brlFormatter.format(subtotal)}</dd></div>
            </dl>
            <Button className="mt-6 w-full" disabled={createOrderMutation.isPending} type="submit">
              {createOrderMutation.isPending ? 'Confirmando pedido...' : 'Confirmar pedido'}
            </Button>
            <p className="mt-3 text-xs text-zinc-500">A confirmação do pedido será concluída na próxima etapa.</p>
          </Card>
        </aside>
      </form>
    </main>
  )
}
