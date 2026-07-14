import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { Button } from '../../../shared/ui/buttons/Button'
import { FormErrorSummary } from '../../../shared/ui/forms/FormErrorSummary'
import { Input } from '../../../shared/ui/forms/Input'
import { loginRequestSchema, type LoginRequest } from '../contracts/login'
import { useLoginMutation } from '../mutations/useLoginMutation'
import { useAuthStore } from '../store/authStore'

const EMAIL_REQUIRED_MESSAGE = 'Informe seu e-mail.'
const EMAIL_INVALID_MESSAGE = 'Informe um e-mail válido.'
const PASSWORD_REQUIRED_MESSAGE = 'Informe sua senha.'

export function LoginPage() {
  const setSession = useAuthStore((state) => state.setSession)
  const loginMutation = useLoginMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>()

  const submitLogin = handleSubmit(async (values) => {
    const parsedValues = loginRequestSchema.safeParse(values)

    if (!parsedValues.success) return

    try {
      const session = await loginMutation.mutateAsync(parsedValues.data)
      setSession(session, 'session')
    } catch {
      // The mutation error is rendered in the form summary.
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
