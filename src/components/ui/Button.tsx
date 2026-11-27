import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dark' | 'light'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'btn--primary',
  secondary: 'btn--secondary',
  outline: 'btn--outline',
  ghost: 'btn--ghost',
  danger: 'btn--danger',
  dark: 'btn--dark',
  light: 'btn--light',
}

interface BaseProps {
  variant?: Variant
  size?: Size
  loading?: boolean
  full?: boolean
  icon?: ReactNode
  children?: ReactNode
  className?: string
}

interface ButtonProps extends BaseProps, ButtonHTMLAttributes<HTMLButtonElement> {
  to?: undefined
}

interface LinkButtonProps extends BaseProps {
  to: string
  state?: unknown
  onClick?: () => void
}

export function Button(props: ButtonProps | LinkButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    full = false,
    icon,
    children,
    className,
    ...rest
  } = props
  const classes = cn(
    'btn',
    VARIANTS[variant],
    `btn--${size}`,
    full && 'btn--full',
    loading && 'is-loading',
    className,
  )

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} state={props.state} onClick={props.onClick} className={classes}>
        {icon}
        {children}
      </Link>
    )
  }

  const { disabled, ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button type="button" className={classes} disabled={disabled || loading} {...buttonRest}>
      {loading ? <Loader2 size={17} className="spin" /> : icon}
      {children}
    </button>
  )
}
