import { Link } from 'react-router-dom'
import { ArrowRight, PackageOpen, RefreshCw, ShoppingBag } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { StatusPill } from '@/components/orders/StatusPill'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { useOrders, usePageTitle } from '@/hooks/useData'
import { formatDate, formatINR } from '@/lib/utils'

export function OrdersPage() {
  const { user } = useAuth()
  const { data: orders, loading, error, reload } = useOrders(user?.uid)
  usePageTitle('My orders')

  return (
    <div className="container page orders-page">
      <div className="page-head">
        <div>
          <span className="section-eyebrow">Order history</span>
          <h1>My orders</h1>
          <p>Purani orders, live status aur ek-tap reorder.</p>
        </div>
        <Button variant="outline" size="sm" icon={<RefreshCw size={15} />} onClick={reload}>
          Refresh
        </Button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <div className="orders-list">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="order-skeleton" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <EmptyState
          icon={<PackageOpen size={28} />}
          title="Abhi koi order nahi hai"
          description="Pehli order karo — Delhi NCR, Mumbai aur Bengaluru ke best kitchens wait kar rahe hain."
          action={<Button to="/search">Find something tasty</Button>}
        />
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article key={order.id} className="order-card">
              <div className="order-card__head">
                <SmartImage
                  src={order.restaurantImage}
                  alt={order.restaurantName}
                  className="order-card__image"
                />
                <div className="order-card__title">
                  <strong>{order.restaurantName}</strong>
                  <span>
                    Order #{order.id.slice(-6).toUpperCase()} · {formatDate(order.createdAt)}
                  </span>
                </div>
                <StatusPill status={order.status} />
              </div>
              <p className="order-card__items">
                {order.items
                  .slice(0, 3)
                  .map((item) => `${item.name} × ${item.qty}`)
                  .join(', ')}
                {order.items.length > 3 && ` +${order.items.length - 3} more`}
              </p>
              <div className="order-card__foot">
                <span className="order-card__total">
                  <small>Total</small>
                  <strong>{formatINR(order.total)}</strong>
                </span>
                <span className="order-card__eta">
                  <ShoppingBag size={14} /> {order.items.reduce((sum, item) => sum + item.qty, 0)} items
                </span>
                <Link to={`/orders/${order.id}`} className="order-card__link">
                  Track order <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
