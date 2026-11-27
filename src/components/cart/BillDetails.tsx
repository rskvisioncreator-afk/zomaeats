import { BadgePercent } from 'lucide-react'
import { cn, formatINR, BILL } from '@/lib/utils'
import type { CartTotals, Coupon } from '@/types'

interface BillDetailsProps {
  totals: CartTotals
  coupon?: Coupon | null
  itemCount: number
  className?: string
  showSavings?: boolean
}

export function BillDetails({ totals, coupon, itemCount, className, showSavings = true }: BillDetailsProps) {
  return (
    <div className={cn('bill', className)}>
      <h3 className="bill__title">Bill details</h3>
      <div className="bill__row">
        <span>Item total <small>({itemCount} items)</small></span>
        <span>{formatINR(totals.itemTotal)}</span>
      </div>
      <div className="bill__row">
        <span>Delivery fee</span>
        <span>
          {totals.deliveryFee === 0 ? (
            <>
              <s className="muted">{formatINR(BILL.deliveryFee)}</s> <em className="text-green">FREE</em>
            </>
          ) : (
            formatINR(totals.deliveryFee)
          )}
        </span>
      </div>
      <div className="bill__row">
        <span>GST &amp; restaurant charges</span>
        <span>{formatINR(totals.taxes)}</span>
      </div>
      <div className="bill__row">
        <span>Platform fee</span>
        <span>{formatINR(totals.platformFee)}</span>
      </div>
      {totals.discount > 0 && (
        <div className="bill__row bill__row--discount">
          <span>
            <BadgePercent size={14} /> Coupon {coupon ? `(${coupon.code})` : ''}
          </span>
          <span>− {formatINR(totals.discount)}</span>
        </div>
      )}
      <div className="bill__divider" />
      <div className="bill__row bill__row--total">
        <span>To pay</span>
        <span>{formatINR(totals.total)}</span>
      </div>
      {showSavings && totals.savings > 0 && (
        <p className="bill__savings">You saved {formatINR(totals.savings)} on this order 🎉</p>
      )}
    </div>
  )
}
