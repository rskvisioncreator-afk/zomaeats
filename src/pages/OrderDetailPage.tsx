import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  Phone,
  RefreshCw,
  RotateCcw,
  StickyNote,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ErrorState, EmptyState, Skeleton, VegMark } from '@/components/ui/Feedback'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { OrderTimeline } from '@/components/orders/OrderTimeline'
import { StatusPill } from '@/components/orders/StatusPill'
import { BillDetails } from '@/components/cart/BillDetails'
import { SmartImage } from '@/components/ui/SmartImage'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/useData'
import { dataProvider } from '@/services'
import { COUPONS, formatDate, formatINR, friendlyError } from '@/lib/utils'
import { ORDER_FLOW } from '@/types'
import type { CartTotals } from '@/types'

export function OrderDetailPage() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const { user, isAdmin } = useAuth()
  const { startCart } = useCart()
  const navigate = useNavigate()
  const toast = useToast()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const { data: order, loading, error, reload } = useAsyncData(
    () => dataProvider.getOrder(id),
    [id],
  )
  usePageTitle(order ? `Order #${order.id.slice(-6).toUpperCase()}` : 'Order details')

  if (loading) {
    return (
      <div className="container page">
        <Skeleton className="skeleton-line skeleton-line--lg" />
        <Skeleton className="order-detail-skeleton" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container page">
        <ErrorState message={error} onRetry={reload} />
      </div>
    )
  }

  if (!order || (order.userId !== user?.uid && !isAdmin)) {
    return (
      <div className="container page">
        <EmptyState
          icon={<StickyNote size={28} />}
          title="Order nahi mila"
          description="Ye order aapke account se linked nahi hai, ya link galat hai."
          action={<Button to="/orders">Back to my orders</Button>}
        />
      </div>
    )
  }

  const isNew = params.get('new') === '1'
  const activeStep = ORDER_FLOW.find((step) => step.key === order.status)
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0)
  const coupon = COUPONS.find((entry) => entry.code === order.couponCode) ?? null
  const totals: CartTotals = {
    itemTotal: order.itemTotal,
    deliveryFee: order.deliveryFee,
    taxes: order.taxes,
    platformFee: order.platformFee,
    discount: order.discount,
    total: order.total,
    savings: order.discount + (order.deliveryFee === 0 ? 39 : 0),
  }

  const cancelOrder = async () => {
    setCancelling(true)
    try {
      await dataProvider.updateOrderStatus(order.id, 'cancelled')
      toast.success('Order cancel ho gaya')
      setCancelOpen(false)
      reload()
    } catch (cancelError) {
      toast.error(friendlyError(cancelError, 'Order cancel nahi hua'))
    } finally {
      setCancelling(false)
    }
  }

  const reorder = async () => {
    try {
      const restaurant = await dataProvider.getRestaurant(order.restaurantId)
      if (!restaurant) {
        toast.error('Restaurant ab available nahi hai')
        return
      }
      startCart(
        restaurant,
        order.items.map((item) => ({
          dishId: item.dishId,
          name: item.name,
          price: item.price,
          image: item.image,
          isVeg: item.isVeg,
          qty: item.qty,
        })),
      )
      toast.success('Items cart me add ho gaye')
      navigate('/cart')
    } catch (reorderError) {
      toast.error(friendlyError(reorderError, 'Reorder nahi ho paya'))
    }
  }

  const canCancel = order.status === 'placed' || order.status === 'confirmed'

  return (
    <div className="container page order-detail-page">
      <Link to="/orders" className="back-link">
        <ArrowLeft size={15} /> All orders
      </Link>

      {isNew && (
        <div className="order-success">
          <span className="order-success__icon">
            <CheckCircle2 size={34} />
          </span>
          <div>
            <h2>Order placed successfully!</h2>
            <p>
              {order.restaurantName} aapka order taiyaar kar raha hai. ETA {order.etaMinutes} minutes.
            </p>
          </div>
          <span className="order-success__id">#{order.id.slice(-6).toUpperCase()}</span>
        </div>
      )}

      <div className="order-detail-head">
        <div className="order-detail-head__restaurant">
          <SmartImage src={order.restaurantImage} alt={order.restaurantName} />
          <div>
            <h1>{order.restaurantName}</h1>
            <p>
              Order #{order.id.slice(-6).toUpperCase()} · {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="order-detail-head__actions">
          <StatusPill status={order.status} />
          <Button variant="outline" size="sm" icon={<RefreshCw size={15} />} onClick={reload}>
            Refresh
          </Button>
        </div>
      </div>

      {order.status !== 'cancelled' && (
        <div className="order-status-card">
          <div className="order-status-card__head">
            <div>
              <span>Estimated delivery</span>
              <strong>{activeStep?.label === 'Delivered' ? 'Delivered — enjoy!' : `${order.etaMinutes} min`}</strong>
            </div>
            <p>{activeStep?.hint}</p>
          </div>
          <OrderTimeline status={order.status} />
        </div>
      )}

      <div className="order-detail-grid">
        <div>
          <section className="checkout-card">
            <div className="checkout-card__head">
              <div>
                <h2>Order summary</h2>
                <p>{itemCount} items from {order.restaurantName}</p>
              </div>
              <button type="button" className="text-button" onClick={reorder}>
                <RotateCcw size={14} /> Reorder
              </button>
            </div>
            <ul className="order-items">
              {order.items.map((item) => (
                <li key={item.dishId}>
                  <VegMark isVeg={item.isVeg} size="sm" />
                  <span className="order-items__name">{item.name} <small>× {item.qty}</small></span>
                  <span>{formatINR(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <BillDetails totals={totals} coupon={coupon} itemCount={itemCount} />
            <div className="order-payment">
              <CreditCard size={16} />
              <span>Paid via <strong>{order.paymentMethod}</strong></span>
              <span className="badge badge--green">Payment successful</span>
            </div>
          </section>

          <section className="checkout-card">
            <div className="checkout-card__head">
              <div>
                <h2>
                  <MapPin size={18} /> Delivery details
                </h2>
              </div>
            </div>
            <div className="delivery-details">
              <div>
                <span>Deliver to</span>
                <strong>{order.address.name}</strong>
                <p>
                  {order.address.line1}
                  {order.address.line2 ? `, ${order.address.line2}` : ''}
                  <br />
                  {order.address.city} — {order.address.pincode}
                </p>
              </div>
              <div>
                <span>Contact</span>
                <strong>
                  <Phone size={14} /> {order.address.phone}
                </strong>
                <p>Delivery partner will call before arriving.</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="order-detail-side">
          <div className="checkout-card">
            <h3 className="order-side-title">Need help?</h3>
            <p className="muted">Order me koi issue hai? Support team 24×7 available hai.</p>
            <Button
              variant="outline"
              full
              size="sm"
              onClick={() => toast.info('Support chat demo mode me available hai — email support@zomaeats.com')}
            >
              Chat with support
            </Button>
          </div>

          {canCancel && (
            <div className="checkout-card">
              <h3 className="order-side-title">Changed your mind?</h3>
              <p className="muted">Restaurant confirm karne se pehle free cancellation.</p>
              <Button
                variant="danger"
                full
                size="sm"
                icon={<XCircle size={15} />}
                onClick={() => setCancelOpen(true)}
              >
                Cancel order
              </Button>
            </div>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        title="Cancel this order?"
        description="Order cancel hone ke baad refund (demo mode me) turant process ho jayega."
        confirmLabel="Yes, cancel order"
        loading={cancelling}
        onConfirm={cancelOrder}
        onCancel={() => setCancelOpen(false)}
      />
    </div>
  )
}
