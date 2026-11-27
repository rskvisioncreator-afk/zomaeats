import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuantityStepperProps {
  value: number
  onDecrease: () => void
  onIncrease: () => void
  size?: 'sm' | 'md'
  className?: string
}

export function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  size = 'md',
  className,
}: QuantityStepperProps) {
  return (
    <div className={cn('stepper', `stepper--${size}`, className)}>
      <button type="button" onClick={onDecrease} aria-label="Decrease quantity">
        <Minus size={14} />
      </button>
      <span>{value}</span>
      <button type="button" onClick={onIncrease} aria-label="Increase quantity">
        <Plus size={14} />
      </button>
    </div>
  )
}
