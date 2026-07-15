import { passwordRuleResults } from '../contracts/customerPassword'

export interface PasswordRulesProps {
  value: string
}

const rules = [
  ['minLength', 'Mínimo de oito caracteres'],
  ['uppercase', 'Uma letra maiúscula'],
  ['number', 'Um número'],
  ['special', 'Um caractere especial entre !@#$%'],
] as const

export function PasswordRules({ value }: PasswordRulesProps) {
  const results = passwordRuleResults(value)

  return (
    <ul aria-label="Regras da nova senha" className="space-y-2 text-sm">
      {rules.map(([rule, label]) => {
        const satisfied = results[rule]

        return (
          <li
            key={rule}
            className={satisfied ? 'flex items-center gap-2 text-emerald-300' : 'flex items-center gap-2 text-zinc-400'}
          >
            <span aria-hidden="true">{satisfied ? '✓' : '○'}</span>
            <span>{label}</span>
            <span className="font-medium">{satisfied ? 'Atendida' : 'Pendente'}</span>
          </li>
        )
      })}
    </ul>
  )
}
