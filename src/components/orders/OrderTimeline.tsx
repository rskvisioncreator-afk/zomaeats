import { Check, ChefHat, Bike, PackageCheck, ReceiptText, XCircle } from 'lucide-react'
import { ORDER_FLOW } from '@/types'
import type { OrderStatus } from '@/types'
import { cn } from '@/lib/utils'

const ICONS = [ReceiptText, ChefHat, ChefHat, Bike, PackageCheck]

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const activeIndex = ORDER_FLOW.findIndex((step) => step.key === status)
  const isCancelled = status === 'cancelled'

  return (
    <div className="order-timeline">
      {isCancelled && (
        <div className="order-timeline__cancelled">
          <XCircle size={18} />
          <div>
            <strong>Order cancelled</strong>
            <span>Koi payment nahi kiya gaya. Phir se order kar sakte ho.</span>
          </div>
        </div>
      )}
      <div className={cn('order-timeline__track', isCancelled && 'is-muted')}>
        {ORDER_FLOW.map((step, index) => {
          const Icon = ICONS[index]
          const isComplete = !isCancelled && index < activeIndex
          const isActive = !isCancelled && index === activeIndex
          return (
            <div
              key={step.key}
              className={cn(
                'timeline-step',
                isComplete && 'is-complete',
                isActive && 'is-active',
              )}
            >
              <span className="timeline-step__dot">
                {isComplete ? <Check size={14} /> : <Icon size={15} />}
              </span>
              <div className="timeline-step__text">
                <strong>{step.label}</strong>
                <span>{step.hint}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
