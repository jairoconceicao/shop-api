import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Button } from '../../../shared/ui/buttons/Button'
import { InlineAlert } from '../../../shared/ui/feedback/InlineAlert'
import { FormErrorSummary } from '../../../shared/ui/forms/FormErrorSummary'
import { Input } from '../../../shared/ui/forms/Input'
import { loginRequestSchema, type LoginRequest } from '../contracts/login'
import { useLoginMutation } from '../mutations/useLoginMutation'
import { getInternalReturnTo, hasRegistrationSucceeded } from '../routing/returnTo'
import { useAuthStore } from '../store/authStore'

const EMAIL_REQUIRED_MESSAGE = 'Informe seu e-mail.'
const EMAIL_INVALID_MESSAGE = 'Informe um e-mail válido.'
const PASSWORD_REQUIRED_MESSAGE = 'Informe sua senha.'

type LoginFormValues = LoginRequest & {
  manterConectado: boolean
}

export function LoginPage() {
  const setSession = useAuthStore((state) => state.setSession)
  const location = useLocation()
  const navigate = useNavigate()
  const loginMutation = useLoginMutation()
  const {
    register,
    handleSubmit,
    reset,
    resetField,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { manterConectado: false },
  })

  const submitLogin = handleSubmit(async (values) => {
    const parsedValues = loginRequestSchema.safeParse(values)

    if (!parsedValues.success) return

    try {
      const session = await loginMutation.mutateAsync(parsedValues.data)
      setSession(session, values.manterConectado ? 'local' : 'session')
      reset()
      navigate(getInternalReturnTo(location.state), { replace: true })
    } catch {
      // The mutation error is rendered in the form summary.
    } finally {
      resetField('senha')
    }
  })

  const formErrors = [
    errors.email?.message ? { fieldId: 'login-email', message: errors.email.message } : null,
    errors.senha?.message ? { fieldId: 'login-password', message: errors.senha.message } : null,
    loginMutation.error ? { message: loginMutation.error.message } : null,
  ].filter((error): error is { fieldId?: string; message: string } => error !== null)

  return (
    <section className="container-page flex min-h-dvh items-center justify-center py-12 sm:py-16">
      <div className="w-full max-w-md rounded-2xl border border-ink-700/80 bg-ink-850 p-6 shadow-2xl shadow-black/40 sm:p-8">
        <div className="text-center">
          <span
            aria-hidden="true"
            className="inline-grid size-12 place-items-center rounded-2xl bg-brand-500 text-xl font-black text-ink-950"
          >
            S
          </span>
          <h1 className="mt-5 text-2xl font-bold text-zinc-50">Entrar na sua conta</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Bem-vindo de volta. Acesse seus pedidos e dados.
          </p>
        </div>

        {hasRegistrationSucceeded(location.state) ? (
          <InlineAlert className="mt-6" title="Cadastro concluído" variant="success">
            Sua conta foi criada. Entre com as credenciais cadastradas.
          </InlineAlert>
        ) : null}

        <form className="mt-8 space-y-5" noValidate onSubmit={submitLogin}>
          <FormErrorSummary errors={formErrors} />
          <Input
            id="login-email"
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="voce@email.com"
            error={errors.email?.message}
            {...register('email', {
              required: EMAIL_REQUIRED_MESSAGE,
              validate: (value) =>
                loginRequestSchema.shape.email.safeParse(value).success || EMAIL_INVALID_MESSAGE,
            })}
          />
          <Input
            id="login-password"
            label="Senha"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.senha?.message}
            {...register('senha', { required: PASSWORD_REQUIRED_MESSAGE })}
          />
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-zinc-300">
            <input
              className="size-4 rounded border-ink-600 accent-brand-500"
              type="checkbox"
              {...register('manterConectado')}
            />
            Manter conectado
          </label>
          <Button className="w-full" disabled={loginMutation.isPending} type="submit">
            {loginMutation.isPending ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-6 border-t border-ink-700/70 pt-6 text-center text-sm text-zinc-400">
          Não tem conta?{' '}
          <Link className="font-medium text-brand-400 hover:text-brand-300" to="/cadastro">
            Criar agora
          </Link>
        </p>
      </div>
    </section>
  )
}
