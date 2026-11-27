import { Trash2 } from 'lucide-react'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { VegMark } from '@/components/ui/Feedback'
import { formatINR } from '@/lib/utils'
import type { CartItem } from '@/types'

interface CartItemRowProps {
  item: CartItem
  onQty: (qty: number) => void
  onRemove: () => void
}

export function CartItemRow({ item, onQty, onRemove }: CartItemRowProps) {
  return (
    <div className="cart-item">
      <div className="cart-item__info">
        <VegMark isVeg={item.isVeg} size="sm" />
        <div>
          <h4>{item.name}</h4>
          <p className="cart-item__price">{formatINR(item.price)}</p>
        </div>
      </div>
      <div className="cart-item__actions">
        <QuantityStepper
          value={item.qty}
          onDecrease={() => (item.qty <= 1 ? onRemove() : onQty(item.qty - 1))}
          onIncrease={() => onQty(item.qty + 1)}
          size="sm"
        />
        <span className="cart-item__total">{formatINR(item.price * item.qty)}</span>
        <button type="button" className="icon-button" onClick={onRemove} aria-label={`Remove ${item.name}`}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
