import type { ReactNode } from 'react'
import { AlertTriangle, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RatingBadge({
  rating,
  count,
  compact = false,
}: {
  rating: number
  count?: number
  compact?: boolean
}) {
  const tone = rating >= 4 ? 'good' : rating >= 3 ? 'ok' : 'low'
  return (
    <span className={cn('rating-badge', `rating-badge--${tone}`, compact && 'rating-badge--compact')}>
      <Star size={12} fill="currentColor" strokeWidth={0} />
      <strong>{rating.toFixed(1)}</strong>
      {!compact && count !== undefined && <span>({count.toLocaleString('en-IN')})</span>}
    </span>
  )
}

export function VegMark({ isVeg, size = 'md' }: { isVeg: boolean; size?: 'sm' | 'md' }) {
  return (
    <span
      className={cn('veg-mark', `veg-mark--${size}`, isVeg ? 'veg-mark--veg' : 'veg-mark--nonveg')}
      title={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
      aria-label={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
    >
      <span className="veg-mark__dot" />
    </span>
  )
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: 'neutral' | 'red' | 'green' | 'gold' | 'dark'
  className?: string
}) {
  return <span className={cn('badge', `badge--${tone}`, className)}>{children}</span>
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="error-state">
      <AlertTriangle size={28} />
      <div>
        <h3>Kuch gadbad ho gayi</h3>
        <p>{message}</p>
      </div>
      {onRetry && (
        <button type="button" className="btn btn--outline btn--sm" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <span className={cn('skeleton', className)} aria-hidden="true" />
}
