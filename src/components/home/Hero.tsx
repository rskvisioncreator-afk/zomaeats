import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Clock3, MapPin, Search, ShieldCheck, Star, UtensilsCrossed } from 'lucide-react'
import { useLocation } from '@/context/LocationContext'
import { SmartImage } from '@/components/ui/SmartImage'
import { chefEnd, chefStart } from '@/data/heroChefs'

const QUICK_SEARCHES = ['Biryani', 'Pizza', 'Momos', 'Dosa', 'Burger', 'Pani Puri']

export function Hero({ restaurantCount }: { restaurantCount: number }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { location } = useLocation()

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search')
  }

  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="hero__content">
          <span className="hero__eyebrow">
            <span className="pulse-dot" /> Now delivering in {location.city}
          </span>
          <h1>
            <span className="hero__inline-chef hero__inline-chef--start">
              <SmartImage src={chefStart} alt="Indian chef" eager />
            </span>
            Bhookh lagi? <br />
            <span className="hero__accent">Hum pahuncha denge.</span>
            <span className="hero__inline-chef hero__inline-chef--end">
              <SmartImage src={chefEnd} alt="Indian chef" eager />
            </span>
          </h1>
          <p className="hero__subtitle">
            {location.area} ke best kitchens se garam khana order karo. Live tracking, honest
            ratings aur 30 minute me doorstep delivery.
          </p>

          <form className="hero-search" onSubmit={submit} role="search">
            <span className="hero-search__location">
              <MapPin size={18} />
              <span>
                <small>Deliver to</small>
                <strong>{location.area}</strong>
              </span>
            </span>
            <span className="hero-search__divider" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Restaurant, cuisine ya dish dhundho..."
              aria-label="Search for restaurants or dishes"
            />
            <button type="submit" className="hero-search__button" aria-label="Search">
              <Search size={20} />
            </button>
          </form>

          <div className="hero__quick">
            <span>Popular:</span>
            {QUICK_SEARCHES.map((item) => (
              <button key={item} type="button" onClick={() => navigate(`/search?cuisine=${encodeURIComponent(item)}`)}>
                {item}
              </button>
            ))}
          </div>

          <div className="hero__stats">
            <div>
              <strong>{restaurantCount}+</strong>
              <span>Restaurants</span>
            </div>
            <div>
              <strong>30 min</strong>
              <span>Avg delivery</span>
            </div>
            <div>
              <strong>4.7 ★</strong>
              <span>Loved by foodies</span>
            </div>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__blob" aria-hidden="true" />
          <div className="hero__photo hero__photo--main">
            <SmartImage src="/images/biryani.jpg" alt="Hyderabadi biryani served in a handi" eager />
          </div>
          <div className="hero__photo hero__photo--small">
            <SmartImage src="/images/dosa.jpg" alt="Crispy masala dosa with chutney" eager />
          </div>

          <div className="float-card float-card--rating">
            <span className="float-card__icon float-card__icon--gold">
              <Star size={17} fill="currentColor" strokeWidth={0} />
            </span>
            <div>
              <strong>4.8 rating</strong>
              <small>12,000+ happy foodies</small>
            </div>
          </div>

          <div className="float-card float-card--delivery">
            <span className="float-card__icon float-card__icon--green">
              <Clock3 size={17} />
            </span>
            <div>
              <strong>28 min delivery</strong>
              <small>Rider assigned nearby</small>
            </div>
          </div>

          <div className="float-card float-card--trust">
            <ShieldCheck size={16} /> Hygiene rated kitchens
          </div>
        </div>
      </div>

      <div className="container">
        <div className="hero__marquee">
          <span>
            <UtensilsCrossed size={15} /> {restaurantCount}+ kitchens
          </span>
          <span>Free delivery above ₹499</span>
          <span>Live order tracking</span>
          <span>Secure payments</span>
          <span>No hidden charges</span>
          <ArrowRight size={15} />
        </div>
      </div>
    </section>
  )
}
