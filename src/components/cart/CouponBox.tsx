import { Check, IndianRupee, TicketPercent } from 'lucide-react'
import { COUPONS, formatINR } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'

export function CouponBox() {
  const { cart, coupon, applyCoupon, removeCoupon } = useCart()
  const [code, setCode] = useState('')
  const [showAll, setShowAll] = useState(false)
  const toast = useToast()

  const handleApply = (value: string) => {
    const result = applyCoupon(value)
    if (result.ok) {
      toast.success(result.message)
      setCode('')
    } else {
      toast.error(result.message)
    }
  }

  if (coupon) {
    return (
      <div className="coupon-applied">
        <div>
          <TicketPercent size={18} />
          <span>
            <strong>{coupon.code}</strong> applied — {coupon.label}
          </span>
        </div>
        <button type="button" onClick={removeCoupon}>
          Remove
        </button>
      </div>
    )
  }

  return (
    <div className="coupon-box">
      <div className="coupon-box__label">
        <TicketPercent size={16} /> Have a coupon?
      </div>
      <div className="coupon-box__form">
        <input
          className="input"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="e.g. WELCOME50"
          aria-label="Coupon code"
        />
        <Button variant="outline" size="sm" onClick={() => handleApply(code)} disabled={!code.trim()}>
          Apply
        </Button>
      </div>
      <button type="button" className="coupon-box__toggle" onClick={() => setShowAll((value) => !value)}>
        {showAll ? 'Hide offers' : 'View all offers'}
      </button>
      {showAll && (
        <ul className="coupon-list">
          {COUPONS.map((entry) => (
            <li key={entry.code}>
              <button type="button" onClick={() => handleApply(entry.code)}>
                <span className="coupon-list__icon">
                  <IndianRupee size={14} />
                </span>
                <span>
                  <strong>{entry.label}</strong>
                  <small>
                    {entry.code} · Min order {formatINR(entry.minOrder)}
                  </small>
                </span>
                <Check size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {cart.items.length > 0 && (
        <p className="coupon-box__hint">Tip: FREEDEL se delivery free ho jayegi.</p>
      )}
    </div>
  )
}
