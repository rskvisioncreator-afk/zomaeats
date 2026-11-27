import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BadgePercent,
  CircleDollarSign,
  Database,
  Eye,
  IndianRupee,
  LayoutDashboard,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCw,
  Store,
  Trash2,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback'
import { SmartImage } from '@/components/ui/SmartImage'
import { StatusPill, STATUS_LABELS } from '@/components/orders/StatusPill'
import { RestaurantForm } from '@/components/admin/RestaurantForm'
import { DishForm } from '@/components/admin/DishForm'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle } from '@/hooks/useData'
import { useToast } from '@/context/ToastContext'
import { dataProvider, isDemoMode } from '@/services'
import { cn, formatDate, formatINR, friendlyError } from '@/lib/utils'
import type { Dish, Order, OrderStatus, Restaurant } from '@/types'

type Tab = 'overview' | 'restaurants' | 'menu' | 'orders'

const TABS: { key: Tab; label: string; icon: typeof Store }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'restaurants', label: 'Restaurants', icon: Store },
  { key: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { key: 'orders', label: 'Orders', icon: ReceiptText },
]

const STATUS_OPTIONS = (Object.keys(STATUS_LABELS) as OrderStatus[]).map((status) => ({
  value: status,
  label: STATUS_LABELS[status].label,
}))

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [menuRestaurantId, setMenuRestaurantId] = useState('')
  const [restaurantForm, setRestaurantForm] = useState<{ open: boolean; initial: Restaurant | null }>({
    open: false,
    initial: null,
  })
  const [dishForm, setDishForm] = useState<{ open: boolean; initial: Dish | null }>({
    open: false,
    initial: null,
  })
  const [deleteTarget, setDeleteTarget] = useState<
    { type: 'restaurant' | 'dish'; id: string; name: string } | null
  >(null)
  const [seedOpen, setSeedOpen] = useState(false)
  const [seedding, setSeeding] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const toast = useToast()
  usePageTitle('Admin dashboard')

  const { data, loading, error, reload } = useAsyncData(async () => {
    const [restaurants, dishes, orders] = await Promise.all([
      dataProvider.listRestaurants(),
      dataProvider.listDishes(),
      dataProvider.listOrders(),
    ])
    return {
      restaurants: [...restaurants].sort((a, b) => a.name.localeCompare(b.name)),
      dishes,
      orders,
    }
  }, [])

  const restaurants = useMemo(() => data?.restaurants ?? [], [data])
  const dishes = useMemo(() => data?.dishes ?? [], [data])
  const orders = useMemo(() => data?.orders ?? [], [data])

  useEffect(() => {
    if (!menuRestaurantId && restaurants.length > 0) setMenuRestaurantId(restaurants[0].id)
  }, [menuRestaurantId, restaurants])

  const menuDishes = useMemo(
    () => dishes.filter((dish) => dish.restaurantId === menuRestaurantId),
    [dishes, menuRestaurantId],
  )

  const revenue = orders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total, 0)
  const activeOrders = orders.filter(
    (order) => order.status !== 'delivered' && order.status !== 'cancelled',
  ).length

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      if (deleteTarget.type === 'restaurant') await dataProvider.deleteRestaurant(deleteTarget.id)
      else await dataProvider.deleteDish(deleteTarget.id)
      toast.success(`${deleteTarget.type === 'restaurant' ? 'Restaurant' : 'Dish'} delete ho gaya`)
      setDeleteTarget(null)
      reload()
    } catch (deleteError) {
      toast.error(friendlyError(deleteError, 'Delete nahi hua'))
    }
  }

  const seedData = async () => {
    setSeeding(true)
    try {
      const result = await dataProvider.seedDemoData()
      toast.success(`${result.restaurants} restaurants, ${result.dishes} dishes seed ho gaye`)
      setSeedOpen(false)
      reload()
    } catch (seedError) {
      toast.error(friendlyError(seedError, 'Seed data fail ho gaya'))
    } finally {
      setSeeding(false)
    }
  }

  const changeStatus = async (order: Order, status: OrderStatus) => {
    setUpdatingOrder(order.id)
    try {
      await dataProvider.updateOrderStatus(order.id, status)
      toast.success(`Order status: ${STATUS_LABELS[status].label}`)
      if (selectedOrder?.id === order.id) setSelectedOrder({ ...selectedOrder, status })
      reload()
    } catch (statusError) {
      toast.error(friendlyError(statusError, 'Status update nahi hua'))
    } finally {
      setUpdatingOrder(null)
    }
  }

  const subtitle = {
    overview: 'Aaj ka business ek nazar me',
    restaurants: `${restaurants.length} kitchens on the platform`,
    menu: `${dishes.length} dishes across all restaurants`,
    orders: `${orders.length} lifetime orders · ${activeOrders} active`,
  }[tab]

  return (
    <div className="container page admin-page">
      <div className="admin-hero">
        <div>
          <span className="section-eyebrow">Partner dashboard</span>
          <h1>Admin control room</h1>
          <p>{subtitle}</p>
        </div>
        <div className="admin-hero__actions">
          <span className={cn('badge', isDemoMode ? 'badge--gold' : 'badge--green')}>
            <Database size={13} /> {isDemoMode ? 'Demo data' : 'Firebase live'}
          </span>
          <Button variant="outline" size="sm" icon={<RefreshCw size={15} />} onClick={reload}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="admin-layout">
        <aside className="admin-nav">
          {TABS.map((entry) => {
            const Icon = entry.icon
            return (
              <button
                key={entry.key}
                type="button"
                className={cn('admin-nav__item', tab === entry.key && 'is-active')}
                onClick={() => setTab(entry.key)}
              >
                <Icon size={17} />
                <span>{entry.label}</span>
                {entry.key === 'orders' && activeOrders > 0 && (
                  <span className="admin-nav__badge">{activeOrders}</span>
                )}
              </button>
            )
          })}
          <div className="admin-nav__foot">
            <Link to="/" className="admin-nav__item">
              <Eye size={17} /> View storefront
            </Link>
          </div>
        </aside>

        <div className="admin-content">
          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : loading ? (
            <div className="admin-loading">
              <Skeleton className="stat-skeleton" />
              <Skeleton className="admin-table-skeleton" />
            </div>
          ) : (
            <>
              {tab === 'overview' && (
                <>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-card__icon stat-card__icon--red"><ReceiptText size={18} /></span>
                      <div><strong>{orders.length}</strong><span>Total orders</span></div>
                      <span className="stat-card__trend"><TrendingUp size={13} /> live</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-card__icon stat-card__icon--green"><IndianRupee size={18} /></span>
                      <div><strong>{formatINR(revenue)}</strong><span>Revenue</span></div>
                    </div>
                    <div className="stat-card">
                      <span className="stat-card__icon stat-card__icon--gold"><Store size={18} /></span>
                      <div><strong>{restaurants.length}</strong><span>Restaurants</span></div>
                    </div>
                    <div className="stat-card">
                      <span className="stat-card__icon stat-card__icon--blue"><UtensilsCrossed size={18} /></span>
                      <div><strong>{dishes.length}</strong><span>Menu items</span></div>
                    </div>
                  </div>

                  <div className="admin-overview-grid">
                    <section className="admin-panel">
                      <div className="admin-panel__head">
                        <div>
                          <h2>Recent orders</h2>
                          <p>Latest activity across all restaurants</p>
                        </div>
                        <button type="button" className="text-button" onClick={() => setTab('orders')}>
                          View all
                        </button>
                      </div>
                      {orders.length === 0 ? (
                        <EmptyState
                          icon={<ReceiptText size={24} />}
                          title="Abhi koi order nahi"
                          description="Customer app se order karke yahan live status dekho."
                        />
                      ) : (
                        <div className="admin-table-wrap">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Order</th>
                                <th>Restaurant</th>
                                <th>Total</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orders.slice(0, 5).map((order) => (
                                <tr key={order.id}>
                                  <td>
                                    <strong>#{order.id.slice(-6).toUpperCase()}</strong>
                                    <small>{formatDate(order.createdAt)}</small>
                                  </td>
                                  <td>{order.restaurantName}</td>
                                  <td>{formatINR(order.total)}</td>
                                  <td><StatusPill status={order.status} /></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </section>

                    <section className="admin-panel admin-panel--mode">
                      <span className="admin-panel__eyebrow">Backend status</span>
                      <h2>{isDemoMode ? 'Demo mode active' : 'Firebase connected'}</h2>
                      <p>
                        {isDemoMode
                          ? 'Data browser ke localStorage me hai. Firebase env keys add karte hi Auth, Firestore aur Storage automatically enable ho jayenge.'
                          : 'Restaurants, dishes, orders aur images Firebase se live sync ho rahe hain. Firestore rules admin writes ko protect karte hain.'}
                      </p>
                      <ul className="admin-mode-list">
                        <li><CircleDollarSign size={15} /> Orders: <strong>orders</strong> collection</li>
                        <li><BadgePercent size={15} /> Menus: <strong>restaurants</strong> + <strong>dishes</strong></li>
                        <li><Database size={15} /> Images: <strong>Firebase Storage</strong></li>
                      </ul>
                      <Button variant="dark" full size="sm" onClick={() => setSeedOpen(true)}>
                        Seed demo restaurants &amp; dishes
                      </Button>
                      <p className="admin-mode-hint">
                        Note: seed karne se same id waale documents overwrite ho jayenge.
                      </p>
                    </section>
                  </div>
                </>
              )}

              {tab === 'restaurants' && (
                <section className="admin-panel">
                  <div className="admin-panel__head">
                    <div>
                      <h2>Restaurants</h2>
                      <p>Add, edit ya delete karo — menu bhi saath manage hota hai</p>
                    </div>
                    <Button
                      size="sm"
                      icon={<Plus size={15} />}
                      onClick={() => setRestaurantForm({ open: true, initial: null })}
                    >
                      Add restaurant
                    </Button>
                  </div>

                  {restaurants.length === 0 ? (
                    <EmptyState
                      icon={<Store size={26} />}
                      title="Koi restaurant nahi hai"
                      description="Pehla restaurant add karo, ya demo data seed karo."
                      action={
                        <div className="inline-actions">
                          <Button onClick={() => setRestaurantForm({ open: true, initial: null })}>
                            Add restaurant
                          </Button>
                          <Button variant="outline" onClick={() => setSeedOpen(true)}>Seed demo data</Button>
                        </div>
                      }
                    />
                  ) : (
                    <div className="admin-table-wrap">
                      <table className="admin-table admin-table--restaurants">
                        <thead>
                          <tr>
                            <th>Restaurant</th>
                            <th>Cuisines</th>
                            <th>Rating</th>
                            <th>Cost for two</th>
                            <th>Dishes</th>
                            <th aria-label="Actions" />
                          </tr>
                        </thead>
                        <tbody>
                          {restaurants.map((restaurant) => (
                            <tr key={restaurant.id}>
                              <td>
                                <div className="admin-table__entity">
                                  <SmartImage src={restaurant.image} alt={restaurant.name} />
                                  <div>
                                    <strong>{restaurant.name}</strong>
                                    <small>{restaurant.area}, {restaurant.city}</small>
                                  </div>
                                </div>
                              </td>
                              <td>{restaurant.cuisines.join(', ')}</td>
                              <td>★ {restaurant.rating.toFixed(1)}</td>
                              <td>{formatINR(restaurant.priceForTwo)}</td>
                              <td>{dishes.filter((dish) => dish.restaurantId === restaurant.id).length}</td>
                              <td>
                                <div className="table-actions">
                                  <button
                                    type="button"
                                    onClick={() => setRestaurantForm({ open: true, initial: restaurant })}
                                    aria-label={`Edit ${restaurant.name}`}
                                  >
                                    <Pencil size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    className="is-danger"
                                    onClick={() =>
                                      setDeleteTarget({ type: 'restaurant', id: restaurant.id, name: restaurant.name })
                                    }
                                    aria-label={`Delete ${restaurant.name}`}
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {tab === 'menu' && (
                <section className="admin-panel">
                  <div className="admin-panel__head">
                    <div>
                      <h2>Menu manager</h2>
                      <p>Restaurant chuno aur uska menu edit karo</p>
                    </div>
                    <Button
                      size="sm"
                      icon={<Plus size={15} />}
                      onClick={() => setDishForm({ open: true, initial: null })}
                      disabled={restaurants.length === 0}
                    >
                      Add dish
                    </Button>
                  </div>

                  <div className="admin-filter-row">
                    <Select
                      label="Restaurant"
                      value={menuRestaurantId}
                      onChange={(event) => setMenuRestaurantId(event.target.value)}
                      options={
                        restaurants.length > 0
                          ? restaurants.map((restaurant) => ({ value: restaurant.id, label: restaurant.name }))
                          : [{ value: '', label: 'No restaurants yet' }]
                      }
                    />
                    <span className="badge badge--neutral">{menuDishes.length} dishes</span>
                  </div>

                  {menuDishes.length === 0 ? (
                    <EmptyState
                      icon={<UtensilsCrossed size={26} />}
                      title="Is restaurant ka menu khaali hai"
                      description="Pehli dish add karo — image, price aur category ke saath."
                      action={
                        <Button onClick={() => setDishForm({ open: true, initial: null })}>
                          Add first dish
                        </Button>
                      }
                    />
                  ) : (
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Dish</th>
                            <th>Category</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Rating</th>
                            <th aria-label="Actions" />
                          </tr>
                        </thead>
                        <tbody>
                          {menuDishes.map((dish) => (
                            <tr key={dish.id}>
                              <td>
                                <div className="admin-table__entity">
                                  <SmartImage src={dish.image} alt={dish.name} />
                                  <div>
                                    <strong>{dish.name}</strong>
                                    <small>{dish.isBestseller ? 'Bestseller' : 'Standard item'}</small>
                                  </div>
                                </div>
                              </td>
                              <td>{dish.category}</td>
                              <td>
                                <span className={cn('badge', dish.isVeg ? 'badge--green' : 'badge--red')}>
                                  {dish.isVeg ? 'Veg' : 'Non-veg'}
                                </span>
                              </td>
                              <td>{formatINR(dish.price)}</td>
                              <td>{dish.rating ? `★ ${dish.rating}` : '—'}</td>
                              <td>
                                <div className="table-actions">
                                  <button
                                    type="button"
                                    onClick={() => setDishForm({ open: true, initial: dish })}
                                    aria-label={`Edit ${dish.name}`}
                                  >
                                    <Pencil size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    className="is-danger"
                                    onClick={() => setDeleteTarget({ type: 'dish', id: dish.id, name: dish.name })}
                                    aria-label={`Delete ${dish.name}`}
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {tab === 'orders' && (
                <section className="admin-panel">
                  <div className="admin-panel__head">
                    <div>
                      <h2>All orders</h2>
                      <p>Status update karo — customer app me turant reflect hoga</p>
                    </div>
                    <span className="badge badge--neutral">{orders.length} orders</span>
                  </div>

                  {orders.length === 0 ? (
                    <EmptyState
                      icon={<ReceiptText size={26} />}
                      title="Koi order nahi aaya"
                      description="Customer app se test order karke flow verify karo."
                      action={<Button to="/search">Place a test order</Button>}
                    />
                  ) : (
                    <div className="admin-table-wrap">
                      <table className="admin-table admin-table--orders">
                        <thead>
                          <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Restaurant</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th aria-label="Actions" />
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id}>
                              <td>
                                <strong>#{order.id.slice(-6).toUpperCase()}</strong>
                                <small>{formatDate(order.createdAt)}</small>
                              </td>
                              <td>
                                <strong>{order.userName}</strong>
                                <small>{order.paymentMethod}</small>
                              </td>
                              <td>{order.restaurantName}</td>
                              <td>{order.items.reduce((sum, item) => sum + item.qty, 0)}</td>
                              <td>{formatINR(order.total)}</td>
                              <td>
                                <select
                                  className="status-select"
                                  value={order.status}
                                  disabled={updatingOrder === order.id}
                                  onChange={(event) => changeStatus(order, event.target.value as OrderStatus)}
                                >
                                  {STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <div className="table-actions">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOrder(order)}
                                    aria-label="View order details"
                                  >
                                    <Eye size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>

      {restaurantForm.open && (
        <RestaurantForm
          key={restaurantForm.initial?.id ?? 'new-restaurant'}
          open={restaurantForm.open}
          initial={restaurantForm.initial}
          onClose={() => setRestaurantForm({ open: false, initial: null })}
          onSaved={() => {
            setRestaurantForm({ open: false, initial: null })
            reload()
          }}
        />
      )}

      {dishForm.open && (
        <DishForm
          key={dishForm.initial?.id ?? `new-dish-${menuRestaurantId}`}
          open={dishForm.open}
          restaurants={restaurants}
          initial={dishForm.initial}
          defaultRestaurantId={menuRestaurantId}
          onClose={() => setDishForm({ open: false, initial: null })}
          onSaved={() => {
            setDishForm({ open: false, initial: null })
            reload()
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget?.type === 'restaurant' ? 'Delete restaurant?' : 'Delete dish?'}
        description={
          deleteTarget?.type === 'restaurant'
            ? `"${deleteTarget.name}" aur uske saare dishes permanently delete ho jayenge.`
            : `"${deleteTarget?.name}" menu se permanently delete ho jayega.`
        }
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={seedOpen}
        title="Seed demo catalog?"
        description="20 restaurants aur 134 dishes add/overwrite honge. Aapke orders safe rahenge; custom restaurants bhi rahenge."
        confirmLabel="Seed catalog"
        tone="primary"
        loading={seedding}
        onConfirm={seedData}
        onCancel={() => setSeedOpen(false)}
      />

      <Modal
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order #${selectedOrder.id.slice(-6).toUpperCase()}` : 'Order'}
        size="md"
        footer={
          <div className="modal-actions">
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
          </div>
        }
      >
        {selectedOrder && (
          <div className="admin-order-detail">
            <div className="admin-order-detail__top">
              <StatusPill status={selectedOrder.status} />
              <span>{formatDate(selectedOrder.createdAt)}</span>
            </div>
            <p className="admin-order-detail__restaurant">
              <strong>{selectedOrder.restaurantName}</strong> · {selectedOrder.userName}
            </p>
            <ul className="admin-order-detail__items">
              {selectedOrder.items.map((item) => (
                <li key={item.dishId}>
                  <span>{item.name} × {item.qty}</span>
                  <span>{formatINR(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="admin-order-detail__totals">
              <span>Item total <strong>{formatINR(selectedOrder.itemTotal)}</strong></span>
              <span>Delivery <strong>{formatINR(selectedOrder.deliveryFee)}</strong></span>
              <span>Taxes <strong>{formatINR(selectedOrder.taxes)}</strong></span>
              <span>Discount <strong>− {formatINR(selectedOrder.discount)}</strong></span>
              <span className="admin-order-detail__grand">
                Total <strong>{formatINR(selectedOrder.total)}</strong>
              </span>
            </div>
            <div className="admin-order-detail__address">
              <strong>Deliver to</strong>
              <p>
                {selectedOrder.address.name} · {selectedOrder.address.phone}<br />
                {selectedOrder.address.line1}
                {selectedOrder.address.line2 ? `, ${selectedOrder.address.line2}` : ''}<br />
                {selectedOrder.address.city} — {selectedOrder.address.pincode}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
