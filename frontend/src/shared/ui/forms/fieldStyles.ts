export const fieldControlClasses =
  'min-h-11 w-full rounded-xl border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm text-zinc-100 transition-colors duration-200 placeholder:text-zinc-500 hover:border-ink-600 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-rose-500 aria-invalid:hover:border-rose-400'

export function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ')
}
