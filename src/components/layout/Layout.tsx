import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { MobileNav } from './MobileNav'
import { CartConflictModal } from '@/components/cart/CartConflictModal'

export function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <CartConflictModal />
    </div>
  )
}
