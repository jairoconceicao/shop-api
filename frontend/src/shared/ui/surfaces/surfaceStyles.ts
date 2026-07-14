export type SurfaceVariant = 'base' | 'raised'

export type CardVariant = 'default' | 'interactive'

const surfaceVariantClasses: Record<SurfaceVariant, string> = {
  base: 'surface',
  raised: 'surface-raised',
}

const cardVariantClasses: Record<CardVariant, string> = {
  default: '',
  interactive:
    'hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-brand-500/5',
}

export function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function getSurfaceClasses(
  variant: SurfaceVariant,
  className?: string,
) {
  return joinClasses(surfaceVariantClasses[variant], className)
}

export function getCardClasses(variant: CardVariant, className?: string) {
  return joinClasses(
    'surface-raised overflow-hidden transition-all duration-300',
    cardVariantClasses[variant],
    className,
  )
}
