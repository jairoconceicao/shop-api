import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '../../../shared/ui/buttons/Button'
import { FormErrorSummary, type FormError } from '../../../shared/ui/forms/FormErrorSummary'
import { Input } from '../../../shared/ui/forms/Input'
import { AppError } from '../../../shared/errors/appError'
import { useAuthStore } from '../../auth/store/authStore'
import { PasswordRules } from '../components/PasswordRules'
import { adaptCustomerPasswordRequest, passwordRuleResults, type CustomerPasswordRequest } from '../contracts/customerPassword'
import { mapCustomerPasswordError } from '../errors/customerPasswordErrors'
import { useUpdateCustomerPasswordMutation } from '../mutations/useUpdateCustomerPasswordMutation'

export function CustomerPasswordPage() {
  const mutation = useUpdateCustomerPasswordMutation()
  const [summary, setSummary] = useState<FormError[]>([])
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, control, reset, resetField, setError, formState: { errors, isSubmitting } } = useForm<CustomerPasswordRequest>({ defaultValues: { senhaAtual: '', senhaNova: '' } })
  const newPassword = useWatch({ control, name: 'senhaNova' })

  useEffect(() => {
    if (success) document.getElementById('customer-password-success')?.focus()
  }, [success])

  const submit = handleSubmit(async (values) => {
    let request: CustomerPasswordRequest
    try { request = adaptCustomerPasswordRequest(values) } catch { return }
    const attempt = useAuthStore.getState().session
    if (!attempt) return
    setSummary([]); setSuccess(false)
    try {
      const result = await mutation.mutateAsync({ customerId: attempt.clienteId, token: attempt.token, request })
      const current = useAuthStore.getState().session
      if (current?.clienteId !== attempt.clienteId || current.token !== attempt.token || result.customerId !== attempt.clienteId) return
      reset({ senhaAtual: '', senhaNova: '' }); setSuccess(true)
    } catch (caught) {
      const current = useAuthStore.getState().session
      if (current?.clienteId !== attempt.clienteId || current.token !== attempt.token) return
      const error = caught instanceof AppError ? caught : new AppError({ kind: 'contract', message: 'Resposta inválida.' })
      const mapped = mapCustomerPasswordError(error)
      mapped.fields.forEach(({ field, message }) => setError(field, { message }))
      setSummary(mapped.summary.map((message) => ({ message })))
      resetField('senhaNova', { defaultValue: '', keepError: true })
      if (mapped.summary.length) requestAnimationFrame(() => document.getElementById('customer-password-summary')?.focus())
    }
  }, () => requestAnimationFrame(() => document.getElementById('customer-password-summary')?.focus()))

  const rules = passwordRuleResults(newPassword)
  const localErrors: FormError[] = Object.entries(errors).map(([field, error]) => ({ fieldId: `customer-password-${field}`, message: error?.message ?? 'Revise este campo.' }))
  const allSummary = [...localErrors, ...summary]

  return (
    <form aria-label="Alterar senha" className="surface-raised space-y-6 p-4 sm:p-8" onSubmit={(event) => { void submit(event) }} noValidate>
      <header><p className="text-sm font-semibold uppercase tracking-wider text-brand-400">Segurança</p><h1 className="mt-2 text-2xl font-bold text-zinc-50">Alterar senha</h1></header>
      <FormErrorSummary id="customer-password-summary" errors={allSummary} title="Não foi possível alterar a senha" />
      {success ? <p id="customer-password-success" tabIndex={-1} role="status" aria-live="polite" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">Senha alterada com sucesso.</p> : null}
      <Input id="customer-password-senhaAtual" label="Senha atual" type="password" autoComplete="current-password" error={errors.senhaAtual?.message} {...register('senhaAtual', { required: 'Informe sua senha atual.' })} />
      <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
        <Input id="customer-password-senhaNova" label="Nova senha" type="password" autoComplete="new-password" aria-describedby="customer-password-rules" error={errors.senhaNova?.message} {...register('senhaNova', {
          validate: () => Object.values(rules).every(Boolean) || 'A nova senha deve atender a todas as regras.',
        })} />
        <PasswordRules id="customer-password-rules" value={newPassword} />
      </div>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Alterando…' : 'Alterar senha'}</Button>
    </form>
  )
}
