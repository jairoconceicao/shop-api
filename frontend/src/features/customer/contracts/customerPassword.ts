import { z } from 'zod'

export type PasswordRuleResults = {
  minLength: boolean
  uppercase: boolean
  number: boolean
  special: boolean
}

export function passwordRuleResults(value: string): PasswordRuleResults {
  return {
    minLength: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    number: /\d/.test(value),
    special: /[!@#$%]/.test(value),
  }
}

const customerPasswordRequestSchema = z.object({
  senhaAtual: z.string().min(1),
  senhaNova: z.string().superRefine((value, context) => {
    const rules = passwordRuleResults(value)

    if (!rules.minLength) {
      context.addIssue({ code: 'custom', message: 'A nova senha deve ter no mínimo oito caracteres' })
    }
    if (!rules.uppercase) {
      context.addIssue({ code: 'custom', message: 'A nova senha deve conter uma letra maiúscula' })
    }
    if (!rules.number) {
      context.addIssue({ code: 'custom', message: 'A nova senha deve conter um número' })
    }
    if (!rules.special) {
      context.addIssue({ code: 'custom', message: 'A nova senha deve conter um caractere de !@#$%' })
    }
  }),
}).strict()

export type CustomerPasswordRequest = z.infer<typeof customerPasswordRequestSchema>

export function adaptCustomerPasswordRequest(value: unknown): CustomerPasswordRequest {
  return customerPasswordRequestSchema.parse(value)
}
