import { useId, type ChangeEvent, type KeyboardEvent } from 'react'
import { IconButton } from '../buttons/IconButton'

export interface QuantityInputProps {
  value: number
  onChange: (value: number) => void
  label: string
  min?: number
  max: number
  disabled?: boolean
  id?: string
  name?: string
}

export function QuantityInput({
  value,
  onChange,
  label,
  min = 1,
  max,
  disabled = false,
  id: providedId,
  name,
}: QuantityInputProps) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const normalizedMin = Math.ceil(min)
  const normalizedMax = Math.max(normalizedMin, Math.floor(max))
  const quantity = clamp(Math.round(value), normalizedMin, normalizedMax)

  const updateQuantity = (nextValue: number) => {
    const nextQuantity = clamp(Math.round(nextValue), normalizedMin, normalizedMax)

    if (nextQuantity !== quantity) {
      onChange(nextQuantity)
    }
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.valueAsNumber

    if (Number.isFinite(nextValue)) {
      updateQuantity(nextValue)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const nextValues: Partial<Record<string, number>> = {
      ArrowDown: quantity - 1,
      ArrowUp: quantity + 1,
      End: normalizedMax,
      Home: normalizedMin,
    }
    const nextValue = nextValues[event.key]

    if (nextValue === undefined) {
      return
    }

    event.preventDefault()
    updateQuantity(nextValue)
  }

  return (
    <div className="inline-flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-zinc-200">
        {label}
      </label>
      <div className="inline-flex items-center gap-1 rounded-xl border border-ink-700 bg-ink-850 p-1">
        <IconButton
          aria-label="Diminuir quantidade"
          size="sm"
          disabled={disabled || quantity <= normalizedMin}
          onClick={() => updateQuantity(quantity - 1)}
        >
          −
        </IconButton>
        <input
          id={id}
          name={name}
          type="number"
          inputMode="numeric"
          min={normalizedMin}
          max={normalizedMax}
          step={1}
          value={quantity}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="h-9 w-12 appearance-none bg-transparent text-center text-sm font-semibold text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <IconButton
          aria-label="Aumentar quantidade"
          size="sm"
          disabled={disabled || quantity >= normalizedMax}
          onClick={() => updateQuantity(quantity + 1)}
        >
          +
        </IconButton>
      </div>
    </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
