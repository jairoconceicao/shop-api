import type { ButtonHTMLAttributes } from 'react'
import {
  getButtonClasses,
  type ButtonSize,
  type ButtonVariant,
} from './buttonStyles'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={getButtonClasses({ variant, size, className })}
      {...props}
    />
  )
}
