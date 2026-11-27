import { NavLink } from 'react-router-dom'
import { Home, Package, Search, ShoppingBag, UserRound } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { cn } from '@/lib/utils'

const ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/search', label: 'Search', icon: Search, end: false },
  { to: '/cart', label: 'Cart', icon: ShoppingBag, end: false, cart: true },
  { to: '/orders', label: 'Orders', icon: Package, end: false },
  { to: '/profile', label: 'Profile', icon: UserRound, end: false },
]

export function MobileNav() {
  const { itemsCount } = useCart()

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => cn('mobile-nav__item', isActive && 'is-active')}
          >
            <span className="mobile-nav__icon">
              <Icon size={20} />
              {item.cart && itemsCount > 0 && <span className="mobile-nav__badge">{itemsCount}</span>}
            </span>
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )
}
