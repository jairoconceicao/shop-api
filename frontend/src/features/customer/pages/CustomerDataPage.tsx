import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  formatCpf,
  formatPostalCode,
  normalizeCpf,
  normalizePostalCode,
} from '../../../shared/formatting/personalData'
import { Button } from '../../../shared/ui/buttons/Button'
import { AppError } from '../../../shared/errors/appError'
import { Checkbox } from '../../../shared/ui/forms/Checkbox'
import { FormErrorSummary, type FormError } from '../../../shared/ui/forms/FormErrorSummary'
import { Input } from '../../../shared/ui/forms/Input'
import { ErrorState } from '../../../shared/ui/states/ErrorState'
import { Skeleton } from '../../../shared/ui/states/Skeleton'
import { CpfChangeDialog } from '../components/CpfChangeDialog'
import {
  adaptUpdateCustomerRequest,
  type CustomerProfile,
  type CustomerProfileFormValues,
  type UpdateCustomerRequest,
} from '../contracts/customerProfile'
import { useCustomerProfileQuery } from '../queries/useCustomerProfileQuery'
import { useAuthStore } from '../../auth/store/authStore'
import { mapCustomerProfileError } from '../errors/customerProfileErrors'
import { useUpdateCustomerProfileMutation } from '../mutations/useUpdateCustomerProfileMutation'
import { localCivilDate } from './localCivilDate'

const required = (message: string) => ({ required: message })

function profileToFormValues(profile: CustomerProfile): CustomerProfileFormValues {
  return {
    cpf: formatCpf(profile.cpf),
    nome: profile.nome,
    dataNascimento: profile.dataNascimento,
    email: profile.email,
    logradouro: profile.endereco.logradouro,
    numero: profile.endereco.numero,
    complemento: profile.endereco.complemento ?? '',
    cep: formatPostalCode(profile.endereco.cep),
    bairro: profile.endereco.bairro,
    cidade: profile.endereco.cidade,
    uf: profile.endereco.uf,
    ddd: profile.celular.ddd,
    celularNumero: profile.celular.numero,
    whatsApp: profile.celular.whatsApp,
  }
}

export interface CustomerDataFormProps {
  profile: CustomerProfile
  onValidRequest?: (request: UpdateCustomerRequest) => void | Promise<void>
}

export function CustomerDataForm({ profile, onValidRequest }: CustomerDataFormProps) {
  const summaryRef = useRef<HTMLDivElement>(null)
  const submissionInFlightRef = useRef(false)
  const confirmationInFlightRef = useRef(false)
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [pendingRequest, setPendingRequest] = useState<UpdateCustomerRequest | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const initialValues = useMemo(() => profileToFormValues(profile), [profile])
  const today = localCivilDate()
  const {
    register,
    reset,
    setValue,
    handleSubmit,
    setError,
    formState: { errors, submitCount },
  } = useForm<CustomerProfileFormValues>({ defaultValues: initialValues })

  useEffect(() => {
    reset(initialValues, { keepDirtyValues: true })
  }, [initialValues, reset])

  const formErrors: FormError[] = Object.entries(errors).flatMap(([field, error]) => {
    if (!error.message) return []
    return [{
      fieldId: field === 'root' ? undefined : `customer-data-${field}`,
      message: error.message,
    } satisfies FormError]
  })

  useEffect(() => {
    if (submitCount > 0 && formErrors.length > 0) summaryRef.current?.focus()
  }, [formErrors.length, submitCount])

  // React Hook Form invokes this callback only for submit events; the ref is a synchronous duplicate-request gate.
  // eslint-disable-next-line react-hooks/refs
  const submit = handleSubmit(async (values) => {
    let request: UpdateCustomerRequest
    try {
      request = adaptUpdateCustomerRequest(values)
    } catch {
      setError('root', { type: 'validate', message: 'Revise os dados informados.' })
      return
    }

    if (request.cpf !== normalizeCpf(profile.cpf)) {
      setPendingRequest(request)
      return
    }

    if (submissionInFlightRef.current) return
    submissionInFlightRef.current = true
    setSuccessMessage('')
    setIsSubmittingRequest(true)
    try {
      await onValidRequest?.(request)
      setSuccessMessage('Dados atualizados com sucesso.')
    } catch (error) {
      const mapped = mapCustomerProfileError(error instanceof AppError ? error : new AppError({ kind: 'contract', message: 'Resposta inválida.', cause: error }))
      mapped.fields.forEach(({ field, message }) => setError(field, { type: 'server', message }))
      mapped.summary.forEach((message, index) => setError(index === 0 ? 'root' : `root.remote${index}` as 'root', { type: 'server', message }))
    } finally {
      submissionInFlightRef.current = false
      setIsSubmittingRequest(false)
    }
  })

  const confirmCpfChange = async () => {
    if (!pendingRequest || confirmationInFlightRef.current) return

    confirmationInFlightRef.current = true
    setIsSubmittingRequest(true)
    try {
      await onValidRequest?.(pendingRequest)
      setSuccessMessage('Dados atualizados com sucesso.')
      setPendingRequest(null)
    } catch (error) {
      const mapped = mapCustomerProfileError(error instanceof AppError ? error : new AppError({ kind: 'contract', message: 'Resposta inválida.', cause: error }))
      mapped.fields.forEach(({ field, message }) => setError(field, { type: 'server', message }))
      mapped.summary.forEach((message, index) => setError(index === 0 ? 'root' : `root.remote${index}` as 'root', { type: 'server', message }))
      setPendingRequest(null)
    } finally {
      confirmationInFlightRef.current = false
      setIsSubmittingRequest(false)
    }
  }

  const cpfField = register('cpf', {
    validate: (value) => normalizeCpf(value).length === 11 || 'Informe um CPF com 11 dígitos.',
  })
  const cepField = register('cep', {
    validate: (value) => normalizePostalCode(value).length === 8 || 'Informe um CEP com 8 dígitos.',
  })

  return (
    <>
      <form aria-label="Meus dados" className="surface-raised min-w-0 space-y-8 p-4 sm:p-8" noValidate onSubmit={submit}>
      <header>
        <p className="text-sm font-semibold text-brand-400">Minha conta</p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-50 sm:text-3xl">Meus dados</h1>
        <p className="mt-2 text-sm text-zinc-400">Mantenha seus dados pessoais, endereço e contato atualizados.</p>
      </header>

      <FormErrorSummary ref={summaryRef} errors={formErrors} />
      {successMessage ? <p role="status" tabIndex={-1} className="text-sm text-emerald-300">{successMessage}</p> : null}

      <fieldset className="grid min-w-0 gap-5 sm:grid-cols-2">
        <legend className="col-span-full mb-1 text-lg font-semibold text-zinc-100">Dados pessoais</legend>
        <Input id="customer-data-nome" label="Nome completo" autoComplete="name" error={errors.nome?.message} {...register('nome', { ...required('Informe seu nome.'), maxLength: { value: 200, message: 'O nome deve ter até 200 caracteres.' } })} />
        <Input id="customer-data-cpf" label="CPF" inputMode="numeric" placeholder="000.000.000-00" error={errors.cpf?.message} {...cpfField} onChange={(event) => setValue('cpf', formatCpf(event.target.value), { shouldDirty: true, shouldValidate: true })} />
        <Input id="customer-data-dataNascimento" label="Data de nascimento" type="date" autoComplete="bday" max={today} error={errors.dataNascimento?.message} {...register('dataNascimento', { ...required('Informe sua data de nascimento.'), validate: (value) => value <= today || 'A data de nascimento não pode estar no futuro.' })} />
        <Input id="customer-data-email" label="E-mail" type="email" autoComplete="email" error={errors.email?.message} {...register('email', { ...required('Informe seu e-mail.'), validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || 'Informe um e-mail válido.', maxLength: { value: 200, message: 'O e-mail deve ter até 200 caracteres.' } })} />
      </fieldset>

      <fieldset className="grid min-w-0 gap-5 sm:grid-cols-2">
        <legend className="col-span-full mb-1 text-lg font-semibold text-zinc-100">Endereço</legend>
        <Input id="customer-data-cep" label="CEP" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" error={errors.cep?.message} {...cepField} onChange={(event) => setValue('cep', formatPostalCode(event.target.value), { shouldDirty: true, shouldValidate: true })} />
        <Input id="customer-data-logradouro" label="Logradouro" autoComplete="address-line1" error={errors.logradouro?.message} {...register('logradouro', { ...required('Informe o logradouro.'), maxLength: { value: 200, message: 'O logradouro deve ter até 200 caracteres.' } })} />
        <Input id="customer-data-numero" label="Número" autoComplete="address-line2" error={errors.numero?.message} {...register('numero', { ...required('Informe o número.'), maxLength: { value: 50, message: 'O número deve ter até 50 caracteres.' } })} />
        <Input id="customer-data-complemento" label="Complemento (opcional)" autoComplete="address-line3" error={errors.complemento?.message} {...register('complemento', { maxLength: { value: 200, message: 'O complemento deve ter até 200 caracteres.' } })} />
        <Input id="customer-data-bairro" label="Bairro" error={errors.bairro?.message} {...register('bairro', { ...required('Informe o bairro.'), maxLength: { value: 100, message: 'O bairro deve ter até 100 caracteres.' } })} />
        <Input id="customer-data-cidade" label="Cidade" autoComplete="address-level2" error={errors.cidade?.message} {...register('cidade', { ...required('Informe a cidade.'), maxLength: { value: 100, message: 'A cidade deve ter até 100 caracteres.' } })} />
        <Input id="customer-data-uf" className="uppercase" label="UF" autoComplete="address-level1" maxLength={2} error={errors.uf?.message} {...register('uf', { ...required('Informe a UF.'), pattern: { value: /^[A-Za-z]{2}$/, message: 'Informe uma UF com 2 letras.' } })} />
      </fieldset>

      <fieldset className="grid min-w-0 gap-5 sm:grid-cols-[6rem_minmax(0,1fr)]">
        <legend className="col-span-full mb-1 text-lg font-semibold text-zinc-100">Contato</legend>
        <Input id="customer-data-ddd" label="DDD" inputMode="numeric" autoComplete="tel-area-code" maxLength={2} error={errors.ddd?.message} {...register('ddd', { ...required('Informe o DDD.'), pattern: { value: /^\d{2}$/, message: 'Informe um DDD com 2 dígitos.' } })} />
        <Input id="customer-data-celularNumero" label="Celular" inputMode="tel" autoComplete="tel-local" error={errors.celularNumero?.message} {...register('celularNumero', { ...required('Informe o celular.'), maxLength: { value: 30, message: 'O celular deve ter até 30 caracteres.' } })} />
        <div className="col-span-full">
          <Checkbox id="customer-data-whatsApp" label="Este celular também é WhatsApp" {...register('whatsApp')} />
        </div>
      </fieldset>

      <Button className="w-full sm:w-auto" disabled={isSubmittingRequest} type="submit">
        {isSubmittingRequest ? 'Salvando…' : 'Salvar alterações'}
      </Button>
      </form>
      <CpfChangeDialog
        open={pendingRequest !== null}
        previousCpf={profile.cpf}
        nextCpf={pendingRequest?.cpf ?? profile.cpf}
        pending={isSubmittingRequest}
        onCancel={() => setPendingRequest(null)}
        onConfirm={() => { void confirmCpfChange() }}
      />
    </>
  )
}

function CustomerDataLoading() {
  return (
    <div role="status" aria-label="Carregando dados do cliente" aria-live="polite" className="surface-raised min-h-96 space-y-6 p-4 sm:p-8">
      <span className="sr-only">Carregando dados do cliente…</span>
      <Skeleton shape="text" className="w-32" />
      <Skeleton shape="text" className="h-8 w-56 max-w-full" />
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-16" />)}
      </div>
    </div>
  )
}

export function CustomerDataPage() {
  const profileQuery = useCustomerProfileQuery()
  const updateMutation = useUpdateCustomerProfileMutation()

  if (profileQuery.isPending) return <CustomerDataLoading />

  if (profileQuery.isError) {
    return (
      <ErrorState
        className="min-h-96 justify-center"
        title="Não foi possível carregar seus dados"
        description="Confira sua conexão e tente novamente."
        action={<Button variant="secondary" onClick={async () => { await profileQuery.refetch() }}>Tentar novamente</Button>}
      />
    )
  }

  if (!profileQuery.data) return <CustomerDataLoading />

  return <CustomerDataForm profile={profileQuery.data} onValidRequest={async (request) => {
    const session = useAuthStore.getState().session
    if (!session || session.clienteId !== profileQuery.data.customerId) {
      throw new AppError({ kind: 'http', status: 403, message: 'Sessão inválida.' })
    }
    const result = await updateMutation.mutateAsync({ customerId: session.clienteId, token: session.token, request })
    if (result.customerId !== session.clienteId) throw new AppError({ kind: 'contract', message: 'Resposta inválida.' })
  }} />
}
