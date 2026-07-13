import type { ButtonHTMLAttributes, ReactNode } from 'react'
import {
  getButtonClasses,
  type ButtonSize,
  type ButtonVariant,
} from './buttonStyles'

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'> {
  'aria-label': string
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
}

export function IconButton({
  variant = 'ghost',
  size = 'md',
  type = 'button',
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={getButtonClasses({ variant, size, iconOnly: true, className })}
      {...props}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  )
}
