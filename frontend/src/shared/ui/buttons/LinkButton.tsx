import type { LinkProps } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {
  getButtonClasses,
  type ButtonSize,
  type ButtonVariant,
} from './buttonStyles'

export interface LinkButtonProps extends LinkProps {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={getButtonClasses({ variant, size, className })}
      {...props}
    />
  )
}
