import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  Banknote,
  Clock3,
  CreditCard,
  Landmark,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Feedback'
import { AddressForm } from '@/components/checkout/AddressForm'
import { BillDetails } from '@/components/cart/BillDetails'
import { CouponBox } from '@/components/cart/CouponBox'
import { SmartImage } from '@/components/ui/SmartImage'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/useData'
import { dataProvider } from '@/services'
import { cn, formatINR, friendlyError } from '@/lib/utils'
import type { Address, PaymentMethod } from '@/types'

const PAYMENTS: { key: PaymentMethod; label: string; hint: string; icon: typeof Smartphone }[] = [
  { key: 'UPI', label: 'UPI', hint: 'GPay, PhonePe, Paytm', icon: Smartphone },
  { key: 'Card', label: 'Credit / Debit card', hint: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { key: 'Cash on Delivery', label: 'Cash on delivery', hint: 'Pay when your food arrives', icon: Banknote },
]

export function CheckoutPage() {
  const { user, updateUser } = useAuth()
  const { cart, itemsCount, totals, coupon, clearCart } = useCart()
  const navigate = useNavigate()
  const toast = useToast()
  usePageTitle('Checkout')

  const addresses = useMemo(() => user?.addresses ?? [], [user?.addresses])
  const [selectedId, setSelectedId] = useState(addresses[0]?.id ?? '')
  const [addressOpen, setAddressOpen] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const [payment, setPayment] = useState<PaymentMethod>('UPI')
  const [upiId, setUpiId] = useState('')
  const [placing, setPlacing] = useState(false)

  const restaurant = useAsyncData(
    () => (cart.restaurantId ? dataProvider.getRestaurant(cart.restaurantId) : Promise.resolve(null)),
    [cart.restaurantId],
  )

  const selectedAddress = addresses.find((address) => address.id === selectedId) ?? addresses[0]

  useEffect(() => {
    if (!selectedId && addresses.length > 0) setSelectedId(addresses[0].id)
  }, [addresses, selectedId])

  useEffect(() => {
    if (user && addresses.length === 0) setAddressOpen(true)
    // Only auto-open for a fresh account, not every time the modal closes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid])

  if (cart.items.length === 0) {
    return (
      <div className="container page">
        <EmptyState
          icon={<Wallet size={28} />}
          title="Checkout ke liye cart khaali hai"
          description="Pehle kuch tasty order karo, phir yahan wapas aao."
          action={<Button to="/search">Browse restaurants</Button>}
        />
      </div>
    )
  }

  if (!user) return null

  const saveAddress = async (address: Address) => {
    const existing = addresses
    const next = editing
      ? existing.map((entry) => (entry.id === address.id ? address : entry))
      : [...existing, address]
    await updateUser({ addresses: next })
    setSelectedId(address.id)
    setEditing(null)
    setAddressOpen(false)
    toast.success(editing ? 'Address updated' : 'Address saved')
  }

  const placeOrder = async () => {
    if (!selectedAddress) {
      toast.error('Pehle delivery address add karo')
      setAddressOpen(true)
      return
    }
    if (payment === 'UPI' && upiId && !upiId.includes('@')) {
      toast.error('Valid UPI ID daalo (jaise naam@upi)')
      return
    }
    setPlacing(true)
    try {
      const order = await dataProvider.createOrder({
        userId: user.uid,
        userName: user.name,
        restaurantId: cart.restaurantId ?? '',
        restaurantName: cart.restaurantName,
        restaurantImage: cart.restaurantImage,
        items: cart.items.map((item) => ({
          dishId: item.dishId,
          name: item.name,
          price: item.price,
          qty: item.qty,
          isVeg: item.isVeg,
          image: item.image,
        })),
        totals,
        couponCode: coupon?.code,
        address: selectedAddress,
        paymentMethod: payment,
        etaMinutes: restaurant.data?.deliveryTimeMin ?? 30,
      })
      clearCart()
      toast.success('Order placed — khana jald hi pahunchega!')
      navigate(`/orders/${order.id}?new=1`, { replace: true })
    } catch (error) {
      toast.error(friendlyError(error, 'Order place nahi hua. Dobara try karo.'))
    } finally {
      setPlacing(false)
    }
  }

  const eta = restaurant.data?.deliveryTimeMin ?? 30

  return (
    <div className="container page checkout-page">
      <div className="checkout-head">
        <div>
          <span className="section-eyebrow">Almost there</span>
          <h1>Checkout</h1>
          <p>Address confirm karo, payment choose karo — baaki hum sambhal lenge.</p>
        </div>
        <div className="checkout-steps">
          <span className="is-done">
            <BadgeCheck size={15} /> Cart
          </span>
          <span className="is-active">2. Address &amp; payment</span>
          <span>3. Enjoy</span>
        </div>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          <section className="checkout-card">
            <div className="checkout-card__head">
              <div>
                <h2>
                  <MapPin size={18} /> Delivery address
                </h2>
                <p>Jahan khana pahunchana hai</p>
              </div>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setEditing(null)
                  setAddressOpen(true)
                }}
              >
                <Plus size={15} /> Add new
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="checkout-empty-address">
                <p>Abhi koi saved address nahi hai.</p>
                <Button size="sm" onClick={() => setAddressOpen(true)}>
                  Add delivery address
                </Button>
              </div>
            ) : (
              <div className="address-grid">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    type="button"
                    className={cn('address-card', selectedAddress?.id === address.id && 'is-active')}
                    onClick={() => setSelectedId(address.id)}
                  >
                    <span className="address-card__top">
                      <span className="badge badge--neutral">{address.label}</span>
                      <span className="address-card__check" aria-hidden="true" />
                    </span>
                    <strong>{address.name}</strong>
                    <span>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</span>
                    <span>{address.city} — {address.pincode}</span>
                    <small>{address.phone}</small>
                    <span
                      role="button"
                      tabIndex={0}
                      className="address-card__edit"
                      onClick={(event) => {
                        event.stopPropagation()
                        setEditing(address)
                        setAddressOpen(true)
                      }}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <Pencil size={13} /> Edit
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="checkout-card">
            <div className="checkout-card__head">
              <div>
                <h2>
                  <CreditCard size={18} /> Payment method
                </h2>
                <p>Demo checkout — koi real payment nahi hota</p>
              </div>
              <span className="badge badge--green">
                <ShieldCheck size={13} /> 100% secure
              </span>
            </div>

            <div className="payment-list">
              {PAYMENTS.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.key}
                    type="button"
                    className={cn('payment-option', payment === option.key && 'is-active')}
                    onClick={() => setPayment(option.key)}
                  >
                    <span className="payment-option__icon">
                      <Icon size={20} />
                    </span>
                    <span className="payment-option__text">
                      <strong>{option.label}</strong>
                      <small>{option.hint}</small>
                    </span>
                    <span className="payment-option__radio" />
                  </button>
                )
              })}
            </div>

            {payment === 'UPI' && (
              <input
                className="input payment-input"
                value={upiId}
                onChange={(event) => setUpiId(event.target.value)}
                placeholder="yourname@upi (optional)"
                aria-label="UPI ID"
              />
            )}
            {payment === 'Card' && (
              <div className="payment-card-fields">
                <input className="input" placeholder="Card number — 1234 5678 9012 3456" aria-label="Card number" />
                <div>
                  <input className="input" placeholder="MM / YY" aria-label="Card expiry" />
                  <input className="input" placeholder="CVV" aria-label="Card CVV" />
                </div>
              </div>
            )}
            {payment === 'Cash on Delivery' && (
              <p className="payment-note">
                <Landmark size={15} /> Rider ko cash de sakte ho. Please exact change rakho.
              </p>
            )}
          </section>

          <section className="checkout-card checkout-card--compact">
            <div className="checkout-eta">
              <Clock3 size={18} />
              <div>
                <strong>Estimated delivery: {eta} minutes</strong>
                <span>{cart.restaurantName} · {itemsCount} items</span>
              </div>
              <SmartImage src={cart.restaurantImage} alt={cart.restaurantName} className="checkout-eta__image" />
            </div>
          </section>
        </div>

        <aside className="checkout-side">
          <div className="checkout-side__restaurant">
            <SmartImage src={cart.restaurantImage} alt={cart.restaurantName} />
            <div>
              <strong>{cart.restaurantName}</strong>
              <span>{itemsCount} items</span>
            </div>
          </div>
          <ul className="checkout-side__items">
            {cart.items.map((item) => (
              <li key={item.dishId}>
                <span>{item.name} × {item.qty}</span>
                <span>{formatINR(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <CouponBox />
          <BillDetails totals={totals} coupon={coupon} itemCount={itemsCount} />
          <Button full size="lg" loading={placing} onClick={placeOrder}>
            Place order · {formatINR(totals.total)}
          </Button>
          <p className="checkout-side__note">
            By placing this order you agree to our T&amp;Cs. Cancellation is free before the
            restaurant confirms.
          </p>
        </aside>
      </div>

      {addressOpen && (
        <AddressForm
          key={editing?.id ?? 'new-address'}
          open={addressOpen}
          initial={editing}
          onClose={() => {
            setAddressOpen(false)
            setEditing(null)
          }}
          onSave={saveAddress}
        />
      )}
    </div>
  )
}
