import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  LayoutDashboard,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRound,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState, Skeleton } from '@/components/ui/Feedback'
import { StatusPill } from '@/components/orders/StatusPill'
import { AddressForm } from '@/components/checkout/AddressForm'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useOrders, usePageTitle } from '@/hooks/useData'
import { isDemoMode } from '@/services'
import { resetDemoDb } from '@/services/localProvider'
import { formatDate, formatINR } from '@/lib/utils'
import type { Address } from '@/types'

export function ProfilePage() {
  const { user, isAdmin, isDemo, updateUser, signOutUser } = useAuth()
  const { data: orders, loading: ordersLoading } = useOrders(user?.uid)
  const toast = useToast()
  const navigate = useNavigate()
  usePageTitle('My profile')

  const [editOpen, setEditOpen] = useState(false)
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [addressOpen, setAddressOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [deleteAddress, setDeleteAddress] = useState<Address | null>(null)
  const [resetOpen, setResetOpen] = useState(false)

  if (!user) return null

  const addresses = user.addresses ?? []
  const delivered = orders?.filter((order) => order.status === 'delivered') ?? []
  const spent = (orders ?? [])
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total, 0)
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      toast.error('Naam khaali nahi ho sakta')
      return
    }
    setSaving(true)
    try {
      await updateUser({ name: name.trim(), phone: phone.trim() })
      toast.success('Profile updated')
      setEditOpen(false)
    } catch {
      toast.error('Profile update nahi hua')
    } finally {
      setSaving(false)
    }
  }

  const saveAddress = async (address: Address) => {
    const next = editingAddress
      ? addresses.map((entry) => (entry.id === address.id ? address : entry))
      : [...addresses, address]
    await updateUser({ addresses: next })
    setAddressOpen(false)
    setEditingAddress(null)
    toast.success(editingAddress ? 'Address updated' : 'Address added')
  }

  const removeAddress = async () => {
    if (!deleteAddress) return
    await updateUser({ addresses: addresses.filter((entry) => entry.id !== deleteAddress.id) })
    toast.success('Address removed')
    setDeleteAddress(null)
  }

  return (
    <div className="container page profile-page">
      <div className="profile-hero">
        <div className="profile-hero__avatar">{initials}</div>
        <div className="profile-hero__info">
          <span className="section-eyebrow">My account</span>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
          <div className="profile-hero__badges">
            <span className="badge badge--green">
              <BadgeCheck size={13} /> Verified
            </span>
            <span className="badge badge--neutral">{isAdmin ? 'Admin' : 'Customer'}</span>
            {isDemo && <span className="badge badge--gold">Demo mode</span>}
          </div>
        </div>
        <Button variant="outline" size="sm" icon={<Pencil size={14} />} onClick={() => setEditOpen(true)}>
          Edit profile
        </Button>
      </div>

      <div className="stats-grid stats-grid--profile">
        <div className="stat-card">
          <span className="stat-card__icon stat-card__icon--red"><ReceiptText size={18} /></span>
          <div>
            <strong>{orders?.length ?? 0}</strong>
            <span>Total orders</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card__icon stat-card__icon--green"><BadgeCheck size={18} /></span>
          <div>
            <strong>{delivered.length}</strong>
            <span>Delivered</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-card__icon stat-card__icon--gold"><Wallet size={18} /></span>
          <div>
            <strong>{formatINR(spent)}</strong>
            <span>Total spent</span>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <section className="checkout-card">
          <div className="checkout-card__head">
            <div>
              <h2>
                <MapPin size={18} /> Saved addresses
              </h2>
              <p>Checkout me ek tap me use karo</p>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setEditingAddress(null)
                setAddressOpen(true)
              }}
            >
              <Plus size={15} /> Add address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="checkout-empty-address">
              <p>Koi address save nahi hai. Checkout me ya yahan se add karo.</p>
              <Button size="sm" onClick={() => setAddressOpen(true)}>
                Add your first address
              </Button>
            </div>
          ) : (
            <div className="address-grid">
              {addresses.map((address) => (
                <div key={address.id} className="address-card address-card--static">
                  <span className="address-card__top">
                    <span className="badge badge--neutral">{address.label}</span>
                    <span className="address-card__tools">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddress(address)
                          setAddressOpen(true)
                        }}
                        aria-label="Edit address"
                      >
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => setDeleteAddress(address)} aria-label="Delete address">
                        <Trash2 size={14} />
                      </button>
                    </span>
                  </span>
                  <strong>{address.name}</strong>
                  <span>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</span>
                  <span>{address.city} — {address.pincode}</span>
                  <small>{address.phone}</small>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="profile-side">
          <div className="checkout-card">
            <h3 className="order-side-title">Account</h3>
            <div className="profile-links">
              <Link to="/orders">
                <ReceiptText size={16} /> My orders
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await signOutUser()
                  navigate('/login')
                }}
              >
                <UserRound size={16} /> Switch account
              </button>
              {isAdmin && (
                <Link to="/admin">
                  <LayoutDashboard size={16} /> Admin dashboard
                </Link>
              )}
              {isDemoMode && (
                <button type="button" onClick={() => setResetOpen(true)}>
                  <RefreshCw size={16} /> Reset demo data
                </button>
              )}
              <button
                type="button"
                onClick={async () => {
                  await signOutUser()
                  toast.success('Logged out')
                  navigate('/')
                }}
              >
                <LogOut size={16} /> Log out
              </button>
            </div>
          </div>

          <div className="checkout-card profile-security">
            <ShieldCheck size={20} />
            <h3>Your data is safe</h3>
            <p>
              {isDemoMode
                ? 'Demo mode me sab kuch browser ke localStorage me rehta hai. Firebase keys add karte hi Auth + Firestore live ho jayega.'
                : 'Firebase Auth se protected account, aur aapke orders sirf aapko dikhte hain (Firestore rules).'}
            </p>
          </div>
        </aside>
      </div>

      <section className="profile-orders">
        <div className="page-head">
          <h2>Recent orders</h2>
          <Link to="/orders" className="text-button">View all</Link>
        </div>
        {ordersLoading ? (
          <Skeleton className="order-skeleton" />
        ) : !orders || orders.length === 0 ? (
          <EmptyState
            icon={<ReceiptText size={26} />}
            title="Abhi koi order nahi"
            description="Aapki first order yahan dikhegi."
            action={<Button to="/search">Order something</Button>}
          />
        ) : (
          <div className="orders-list">
            {orders.slice(0, 3).map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="order-card order-card--compact">
                <div className="order-card__title">
                  <strong>{order.restaurantName}</strong>
                  <span>{formatDate(order.createdAt)} · {order.items.length} items</span>
                </div>
                <StatusPill status={order.status} />
                <strong>{formatINR(order.total)}</strong>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit profile"
        size="sm"
        footer={
          <div className="modal-actions">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={saveProfile}>Save changes</Button>
          </div>
        }
      >
        <form className="form-stack" onSubmit={saveProfile}>
          <Input label="Full name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input
            label="Phone number"
            value={phone}
            onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="98765 43210"
            inputMode="numeric"
          />
        </form>
      </Modal>

      {addressOpen && (
        <AddressForm
          key={editingAddress?.id ?? 'new'}
          open={addressOpen}
          initial={editingAddress}
          onClose={() => {
            setAddressOpen(false)
            setEditingAddress(null)
          }}
          onSave={saveAddress}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteAddress)}
        title="Delete this address?"
        description="Ye address saved addresses se hat jayega."
        confirmLabel="Delete address"
        onConfirm={removeAddress}
        onCancel={() => setDeleteAddress(null)}
      />

      <ConfirmDialog
        open={resetOpen}
        title="Reset demo data?"
        description="Saare demo orders aur admin edits clear ho jayenge aur catalog wapas seed ho jayega. Aapka login session stay karega."
        confirmLabel="Reset data"
        onConfirm={() => {
          resetDemoDb()
          setResetOpen(false)
          toast.success('Demo data reset ho gaya')
          window.location.reload()
        }}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  )
}
