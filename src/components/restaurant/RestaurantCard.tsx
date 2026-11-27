import { Link } from 'react-router-dom'
import { BadgePercent, Clock3, Heart, MapPin } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { RatingBadge } from '@/components/ui/Feedback'
import { useWishlist } from '@/hooks/useWishlist'
import { useToast } from '@/context/ToastContext'
import { cn, formatINR } from '@/lib/utils'
import type { Restaurant } from '@/types'

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const { has, toggle } = useWishlist()
  const toast = useToast()
  const saved = has(restaurant.id)

  const handleFavourite = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    toggle(restaurant.id)
    toast.info(saved ? 'Removed from favourites' : `${restaurant.name} saved to favourites`)
  }

  return (
    <article className="restaurant-card">
      <Link to={`/restaurant/${restaurant.id}`} className="restaurant-card__media" aria-label={restaurant.name}>
        <SmartImage src={restaurant.image} alt={restaurant.name} />
        <span className="restaurant-card__shade" />
        {restaurant.offer && (
          <span className="offer-chip">
            <BadgePercent size={13} />
            {restaurant.offer}
          </span>
        )}
        {restaurant.pureVeg && <span className="pure-veg-chip">Pure Veg</span>}
        <button
          type="button"
          className={cn('favourite-button', saved && 'is-saved')}
          onClick={handleFavourite}
          aria-label={saved ? 'Remove from favourites' : 'Save to favourites'}
          aria-pressed={saved}
        >
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </Link>
      <Link to={`/restaurant/${restaurant.id}`} className="restaurant-card__body">
        <div className="restaurant-card__title">
          <h3>{restaurant.name}</h3>
          <RatingBadge rating={restaurant.rating} count={restaurant.ratingCount} compact />
        </div>
        <p className="restaurant-card__cuisines">{restaurant.cuisines.join(' · ')}</p>
        <div className="restaurant-card__meta">
          <span>
            <Clock3 size={14} /> {restaurant.deliveryTimeMin} min
          </span>
          <span className="dot-separator" />
          <span>{formatINR(restaurant.priceForTwo)} for two</span>
          {restaurant.dishCount ? (
            <>
              <span className="dot-separator" />
              <span>{restaurant.dishCount} dishes</span>
            </>
          ) : null}
        </div>
        <div className="restaurant-card__foot">
          <span>
            <MapPin size={13} /> {restaurant.area}
          </span>
          <span>{restaurant.distanceKm.toFixed(1)} km</span>
        </div>
      </Link>
    </article>
  )
}

export function RestaurantCardSkeleton() {
  return (
    <div className="restaurant-card restaurant-card--skeleton">
      <span className="skeleton restaurant-card__skeleton-media" />
      <div className="restaurant-card__body">
        <span className="skeleton skeleton-line skeleton-line--lg" />
        <span className="skeleton skeleton-line skeleton-line--sm" />
        <span className="skeleton skeleton-line skeleton-line--md" />
      </div>
    </div>
  )
}
