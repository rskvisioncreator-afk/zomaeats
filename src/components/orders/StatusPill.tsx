import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types'

const META: Record<OrderStatus, { label: string; tone: string }> = {
  placed: { label: 'Order placed', tone: 'gold' },
  confirmed: { label: 'Confirmed', tone: 'blue' },
  preparing: { label: 'Preparing', tone: 'gold' },
  out_for_delivery: { label: 'On the way', tone: 'blue' },
  delivered: { label: 'Delivered', tone: 'green' },
  cancelled: { label: 'Cancelled', tone: 'red' },
}

export function StatusPill({ status, className }: { status: OrderStatus; className?: string }) {
  const meta = META[status]
  return (
    <span className={cn('status-pill', `status-pill--${meta.tone}`, className)}>
      <span className="status-pill__dot" />
      {meta.label}
    </span>
  )
}

export const STATUS_LABELS = META
