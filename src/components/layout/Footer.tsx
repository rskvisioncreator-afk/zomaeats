import { Link } from 'react-router-dom'
import { Apple, Facebook, Instagram, Linkedin, Play, Twitter } from 'lucide-react'
import { isDemoMode } from '@/services'
import { Logo } from './Logo'

const COLUMNS = [
  {
    title: 'Company',
    links: [
      { label: 'About us', to: '/' },
      { label: 'Careers', to: '/' },
      { label: 'Team', to: '/' },
      { label: 'Blog', to: '/' },
    ],
  },
  {
    title: 'For foodies',
    links: [
      { label: 'Browse restaurants', to: '/search' },
      { label: 'Offers & coupons', to: '/search?offers=1' },
      { label: 'My orders', to: '/orders' },
      { label: 'Help & support', to: '/profile' },
    ],
  },
  {
    title: 'For restaurants',
    links: [
      { label: 'Partner with us', to: '/admin' },
      { label: 'Admin dashboard', to: '/admin' },
      { label: 'Add your menu', to: '/admin' },
      { label: 'Business app', to: '/' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo />
            <p>
              India ki bhookh ka best friend. 30 minutes me ghar par hot food — live tracking ke
              saath.
            </p>
            <div className="footer__apps">
              <a href="#top" className="app-badge" aria-label="Download on the App Store">
                <Apple size={18} />
                <span>
                  <small>Download on the</small>
                  App Store
                </span>
              </a>
              <a href="#top" className="app-badge" aria-label="Get it on Google Play">
                <Play size={18} />
                <span>
                  <small>Get it on</small>
                  Google Play
                </span>
              </a>
            </div>
          </div>

          <div className="footer__columns">
            {COLUMNS.map((column) => (
              <div key={column.title} className="footer__column">
                <h4>{column.title}</h4>
                {column.links.map((link) => (
                  <Link key={link.label} to={link.to}>
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="footer__column">
              <h4>Connect with us</h4>
              <div className="footer__social">
                <a href="#top" aria-label="Instagram"><Instagram size={18} /></a>
                <a href="#top" aria-label="Twitter"><Twitter size={18} /></a>
                <a href="#top" aria-label="Facebook"><Facebook size={18} /></a>
                <a href="#top" aria-label="LinkedIn"><Linkedin size={18} /></a>
              </div>
              <p className="footer__note">
                {isDemoMode
                  ? 'Demo mode — data aapke browser me save hota hai. Firebase keys add karte hi live backend chalu ho jayega.'
                  : 'Connected to Firebase — orders, menus aur images live sync ho rahe hain.'}
              </p>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Zomaeats. Built with React &amp; Firebase.</span>
          <span className="footer__made">
            Made with <span aria-hidden="true">♥</span> in India
          </span>
        </div>
      </div>
    </footer>
  )
}
