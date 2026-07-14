import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import {
  formatCellPhone,
  formatCpf,
  formatPostalCode,
  normalizeCpf,
  normalizePostalCode,
  splitCellPhone,
} from '../../../shared/formatting/personalData'
import { Button } from '../../../shared/ui/buttons/Button'
import { Checkbox } from '../../../shared/ui/forms/Checkbox'
import { FormErrorSummary, type FormError } from '../../../shared/ui/forms/FormErrorSummary'
import { Input } from '../../../shared/ui/forms/Input'
import { createCustomerRequestSchema, type CreateCustomerRequest } from '../contracts/registration'

type RegistrationFormValues = {
  cpf: string
  nome: string
  dataNascimento: string
  email: string
  senha: string
  logradouro: string
  numero: string
  complemento: string
  cep: string
  bairro: string
  cidade: string
  uf: string
  celular: string
  whatsApp: boolean
}

export interface RegistrationPageProps {
  onSubmit?: (request: CreateCustomerRequest) => void | Promise<void>
}

function toRequest(values: RegistrationFormValues): CreateCustomerRequest {
  const phone = splitCellPhone(values.celular)

  return createCustomerRequestSchema.parse({
    senha: values.senha,
    cpf: normalizeCpf(values.cpf),
    nome: values.nome,
    dataNascimento: values.dataNascimento,
    email: values.email,
    endereco: {
      logradouro: values.logradouro,
      numero: values.numero,
      complemento: values.complemento.trim() || null,
      cep: normalizePostalCode(values.cep),
      bairro: values.bairro,
      cidade: values.cidade,
      uf: values.uf.toUpperCase(),
    },
    celular: { ...phone, whatsApp: values.whatsApp },
  })
}

const required = (message: string) => ({ required: message })

export function RegistrationPage({ onSubmit = () => undefined }: RegistrationPageProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({ defaultValues: { whatsApp: false } })

  const submitRegistration = handleSubmit(async (values) => onSubmit(toRequest(values)))
  const formErrors = Object.entries(errors).flatMap(([field, error]) =>
    error.message ? [{ fieldId: `registration-${field}`, message: error.message } satisfies FormError] : [],
  )
  const cpfField = register('cpf', {
    ...required('Informe seu CPF.'),
    validate: (value) => normalizeCpf(value).length === 11 || 'Informe um CPF com 11 dígitos.',
  })
  const cepField = register('cep', {
    ...required('Informe o CEP.'),
    validate: (value) => normalizePostalCode(value).length === 8 || 'Informe um CEP com 8 dígitos.',
  })
  const phoneField = register('celular', {
    ...required('Informe o celular.'),
    validate: (value) => splitCellPhone(value).numero.length >= 8 || 'Informe DDD e número do celular.',
  })

  return (
    <section className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-3xl rounded-2xl border border-ink-700/80 bg-ink-850 p-6 shadow-2xl shadow-black/40 sm:p-8">
        <header>
          <p className="text-sm font-semibold text-brand-400">Crie sua conta</p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-50 sm:text-3xl">Cadastro de cliente</h1>
          <p className="mt-2 text-sm text-zinc-400">Preencha seus dados pessoais e o endereço de entrega.</p>
        </header>

        <form className="mt-8 space-y-8" noValidate onSubmit={submitRegistration}>
          <FormErrorSummary errors={formErrors} />

          <fieldset className="grid gap-5 sm:grid-cols-2">
            <legend className="col-span-full mb-1 text-lg font-semibold text-zinc-100">Dados pessoais</legend>
            <Input id="registration-nome" label="Nome completo" autoComplete="name" error={errors.nome?.message} {...register('nome', required('Informe seu nome.'))} />
            <Input id="registration-cpf" label="CPF" inputMode="numeric" placeholder="000.000.000-00" error={errors.cpf?.message} {...cpfField} onChange={(event) => setValue('cpf', formatCpf(event.target.value), { shouldValidate: true })} />
            <Input id="registration-dataNascimento" label="Data de nascimento" type="date" autoComplete="bday" error={errors.dataNascimento?.message} {...register('dataNascimento', required('Informe sua data de nascimento.'))} />
            <Input id="registration-email" label="E-mail" type="email" autoComplete="email" error={errors.email?.message} {...register('email', { ...required('Informe seu e-mail.'), pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Informe um e-mail válido.' } })} />
            <Input id="registration-senha" className="sm:col-span-2" label="Senha" type="password" autoComplete="new-password" hint="Use pelo menos 8 caracteres." error={errors.senha?.message} {...register('senha', { ...required('Informe uma senha.'), minLength: { value: 8, message: 'A senha deve ter pelo menos 8 caracteres.' } })} />
          </fieldset>

          <fieldset className="grid gap-5 sm:grid-cols-2">
            <legend className="col-span-full mb-1 text-lg font-semibold text-zinc-100">Endereço</legend>
            <Input id="registration-cep" label="CEP" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" error={errors.cep?.message} {...cepField} onChange={(event) => setValue('cep', formatPostalCode(event.target.value), { shouldValidate: true })} />
            <Input id="registration-logradouro" label="Logradouro" autoComplete="address-line1" error={errors.logradouro?.message} {...register('logradouro', required('Informe o logradouro.'))} />
            <Input id="registration-numero" label="Número" autoComplete="address-line2" error={errors.numero?.message} {...register('numero', required('Informe o número.'))} />
            <Input id="registration-complemento" label="Complemento (opcional)" autoComplete="address-line3" error={errors.complemento?.message} {...register('complemento')} />
            <Input id="registration-bairro" label="Bairro" error={errors.bairro?.message} {...register('bairro', required('Informe o bairro.'))} />
            <Input id="registration-cidade" label="Cidade" autoComplete="address-level2" error={errors.cidade?.message} {...register('cidade', required('Informe a cidade.'))} />
            <Input id="registration-uf" className="uppercase" label="UF" autoComplete="address-level1" maxLength={2} error={errors.uf?.message} {...register('uf', { ...required('Informe a UF.'), pattern: { value: /^[A-Za-z]{2}$/, message: 'Informe uma UF com 2 letras.' } })} />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-1 text-lg font-semibold text-zinc-100">Contato</legend>
            <Input id="registration-celular" label="Celular" inputMode="tel" autoComplete="tel" placeholder="(00) 00000-0000" error={errors.celular?.message} {...phoneField} onChange={(event) => setValue('celular', formatCellPhone(event.target.value), { shouldValidate: true })} />
            <Checkbox id="registration-whatsApp" label="Este celular também é WhatsApp" {...register('whatsApp')} />
          </fieldset>

          <Button className="w-full sm:w-auto" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Cadastrando…' : 'Criar conta'}
          </Button>
        </form>

        <p className="mt-6 border-t border-ink-700/70 pt-6 text-sm text-zinc-400">
          Já tem conta? <Link className="font-medium text-brand-400 hover:text-brand-300" to="/entrar">Entrar</Link>
        </p>
      </div>
    </section>
  )
}
