import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface FieldShellProps {
  label?: string
  error?: string
  hint?: string
  htmlFor?: string
  children: ReactNode
  className?: string
}

function FieldShell({ label, error, hint, htmlFor, children, className }: FieldShellProps) {
  return (
    <div className={cn('field', error && 'field--error', className)}>
      {label && (
        <label className="field__label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {error ? <p className="field__error">{error}</p> : hint ? <p className="field__hint">{hint}</p> : null}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  containerClassName?: string
}

export function Input({ label, error, hint, icon, containerClassName, className, id, ...rest }: InputProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} htmlFor={id} className={containerClassName}>
      <div className={cn('input-wrap', icon ? 'input-wrap--icon' : false)}>
        {icon && <span className="input-wrap__icon">{icon}</span>}
        <input id={id} className={cn('input', className)} {...rest} />
      </div>
    </FieldShell>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export function Textarea({ label, error, hint, className, id, ...rest }: TextareaProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} htmlFor={id}>
      <textarea id={id} className={cn('input textarea', className)} {...rest} />
    </FieldShell>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, hint, options, className, id, ...rest }: SelectProps) {
  return (
    <FieldShell label={label} error={error} hint={hint} htmlFor={id}>
      <select id={id} className={cn('input select', className)} {...rest}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}

export function Switch({ checked, onChange, label, description }: SwitchProps) {
  return (
    <label className="switch-row">
      <span>
        <span className="switch-row__label">{label}</span>
        {description && <span className="switch-row__hint">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={cn('switch', checked && 'is-on')}
        onClick={() => onChange(!checked)}
      >
        <span className="switch__thumb" />
      </button>
    </label>
  )
}
