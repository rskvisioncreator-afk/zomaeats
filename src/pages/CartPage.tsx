import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, Trash2, UtensilsCrossed } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Feedback'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { BillDetails } from '@/components/cart/BillDetails'
import { CouponBox } from '@/components/cart/CouponBox'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { usePageTitle } from '@/hooks/useData'
import { formatINR } from '@/lib/utils'

export function CartPage() {
  const { cart, itemsCount, totals, coupon, setQty, removeItem, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [confirmClear, setConfirmClear] = useState(false)
  usePageTitle('Your cart')

  if (cart.items.length === 0) {
    return (
      <div className="container page">
        <EmptyState
          icon={<ShoppingBag size={28} />}
          title="Cart khaali hai"
          description="Bhookh lagi hai? Nearby restaurants se kuch tasty order karo."
          action={<Button to="/search">Explore restaurants</Button>}
        />
      </div>
    )
  }

  const goToCheckout = () => {
    navigate(user ? '/checkout' : '/login?next=/checkout')
  }

  return (
    <div className="container page cart-page">
      <div className="cart-page__head">
        <div>
          <Link to={`/restaurant/${cart.restaurantId}`} className="back-link">
            <ArrowLeft size={15} /> Back to menu
          </Link>
          <h1>Your cart</h1>
          <p>Order from {cart.restaurantName} — garam khana, jaldi delivery.</p>
        </div>
        <button type="button" className="text-button text-button--danger" onClick={() => setConfirmClear(true)}>
          <Trash2 size={15} /> Clear cart
        </button>
      </div>

      <div className="cart-layout">
        <div className="cart-main">
          <div className="cart-restaurant">
            <SmartImage src={cart.restaurantImage} alt={cart.restaurantName} className="cart-restaurant__image" />
            <div>
              <strong>{cart.restaurantName}</strong>
              <span>{itemsCount} items · {formatINR(totals.itemTotal)}</span>
            </div>
            <Link to={`/restaurant/${cart.restaurantId}`} className="cart-restaurant__add">
              <UtensilsCrossed size={14} /> Add more items
            </Link>
          </div>

          <div className="cart-items">
            {cart.items.map((item) => (
              <CartItemRow
                key={item.dishId}
                item={item}
                onQty={(qty) => setQty(item.dishId, qty)}
                onRemove={() => removeItem(item.dishId)}
              />
            ))}
          </div>

          <CouponBox />
        </div>

        <aside className="cart-side">
          <BillDetails totals={totals} coupon={coupon} itemCount={itemsCount} />
          <Button full size="lg" onClick={goToCheckout}>
            {user ? 'Proceed to checkout' : 'Login to continue'} · {formatINR(totals.total)}
          </Button>
          <p className="cart-side__note">Secure checkout · No hidden charges</p>
        </aside>
      </div>

      <div className="mobile-cart-bar">
        <span>
          <strong>{formatINR(totals.total)}</strong>
          <small>Total payable</small>
        </span>
        <Button onClick={goToCheckout}>Checkout</Button>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Clear your cart?"
        description="Saare items cart se hat jayenge. Ye action undo nahi hoga."
        confirmLabel="Clear cart"
        onConfirm={() => {
          clearCart()
          setConfirmClear(false)
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  )
}
