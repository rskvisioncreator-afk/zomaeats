import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { SmartImage } from '@/components/ui/SmartImage'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { formatINR } from '@/lib/utils'

export function CartConflictModal() {
  const { pendingItem, resolveConflict, cart, totals } = useCart()
  const toast = useToast()

  const handleReplace = () => {
    resolveConflict(true)
    toast.success('New cart started')
  }

  return (
    <Modal
      open={Boolean(pendingItem)}
      onClose={() => resolveConflict(false)}
      title="Start a new cart?"
      size="sm"
      footer={
        <div className="modal-actions">
          <Button variant="outline" onClick={() => resolveConflict(false)}>
            Keep existing
          </Button>
          <Button onClick={handleReplace}>Start new cart</Button>
        </div>
      }
    >
      {pendingItem && (
        <div className="conflict">
          <div className="conflict__row">
            <SmartImage src={cart.restaurantImage} alt={cart.restaurantName} className="conflict__image" />
            <div>
              <small className="muted">Your cart</small>
              <strong>{cart.restaurantName}</strong>
              <span className="muted">{formatINR(totals.itemTotal)} · {cart.items.length} items</span>
            </div>
          </div>
          <div className="conflict__divider">
            <AlertTriangle size={15} />
            Ek time par ek hi restaurant ka order kar sakte ho
          </div>
          <div className="conflict__row">
            <SmartImage src={pendingItem.restaurant.image} alt={pendingItem.restaurant.name} className="conflict__image" />
            <div>
              <small className="muted">New item from</small>
              <strong>{pendingItem.restaurant.name}</strong>
              <span className="muted">{pendingItem.dish.name} · {formatINR(pendingItem.dish.price)}</span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
