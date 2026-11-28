import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  MapPin,
  Moon,
  Package,
  Search,
  ShoppingBag,
  Sun,
  User,
  UserRound,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useLocation } from '@/context/LocationContext'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'
import { LocationModal } from './LocationModal'

export function Navbar() {
  const { user, isAdmin, signOutUser, loading, isDemo } = useAuth()
  const { itemsCount } = useCart()
  const { location } = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [locationOpen, setLocationOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('zomaeats-theme')
    return saved ? saved === 'dark' : true
  })
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
    localStorage.setItem('zomaeats-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search')
  }

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <>
      <header className="navbar">
        <div className="container navbar__inner">
          <div className="navbar__brand">
            <Logo />
            {isDemo && <span className="demo-pill">DEMO</span>}
          </div>

          <button type="button" className="location-pill" onClick={() => setLocationOpen(true)}>
            <MapPin size={16} />
            <span className="location-pill__text">
              <strong>{location.area}</strong>
              <small>{location.city}</small>
            </span>
            <ChevronDown size={14} />
          </button>

          <form className="nav-search" onSubmit={submitSearch} role="search">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Restaurant, cuisine ya dish search karo..."
              aria-label="Search restaurants"
            />
          </form>

          <div className="navbar__actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setDarkMode((value) => !value)}
              aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
              title={darkMode ? 'Light theme' : 'Dark theme'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {loading ? (
              <span className="skeleton avatar-skeleton" />
            ) : user ? (
              <div className="user-menu" ref={menuRef}>
                <button
                  type="button"
                  className="user-menu__trigger"
                  onClick={() => setMenuOpen((value) => !value)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                >
                  <span className="avatar">{initials || <User size={16} />}</span>
                  <span className="user-menu__name">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={14} />
                </button>
                {menuOpen && (
                  <div className="user-menu__dropdown" role="menu">
                    <div className="user-menu__head">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                      {isAdmin && <span className="badge badge--red">Admin</span>}
                    </div>
                    <Link to="/profile" role="menuitem" onClick={() => setMenuOpen(false)}>
                      <UserRound size={16} /> My profile
                    </Link>
                    <Link to="/orders" role="menuitem" onClick={() => setMenuOpen(false)}>
                      <Package size={16} /> My orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" role="menuitem" onClick={() => setMenuOpen(false)}>
                        <LayoutDashboard size={16} /> Admin dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={async () => {
                        await signOutUser()
                        setMenuOpen(false)
                        navigate('/')
                      }}
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="navbar__auth">
                <Link to="/login" className="link-quiet">
                  Log in
                </Link>
                <Link to="/login?mode=signup" className="btn btn--primary btn--sm">
                  Sign up
                </Link>
              </div>
            )}

            <Link to="/cart" className={cn('cart-button', itemsCount > 0 && 'is-filled')}>
              <ShoppingBag size={19} />
              <span className="cart-button__label">Cart</span>
              {itemsCount > 0 && <span className="cart-button__count">{itemsCount}</span>}
            </Link>
          </div>
        </div>
      </header>
      <LocationModal open={locationOpen} onClose={() => setLocationOpen(false)} />
    </>
  )
}
