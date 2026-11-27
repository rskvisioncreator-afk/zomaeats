import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgePercent,
  Clock3,
  Info,
  Leaf,
  MapPin,
  ShoppingBag,
  Star,
  UtensilsCrossed,
} from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { RatingBadge, ErrorState, EmptyState, Skeleton } from '@/components/ui/Feedback'
import { Button } from '@/components/ui/Button'
import { DishRow } from '@/components/restaurant/DishRow'
import { MenuNav } from '@/components/restaurant/MenuNav'
import { VegToggle } from '@/components/restaurant/VegToggle'
import { usePageTitle, useRestaurantDetail } from '@/hooks/useData'
import { useCart } from '@/context/CartContext'
import { formatINR, slugify } from '@/lib/utils'

export function RestaurantPage() {
  const { id = '' } = useParams()
  const { restaurant, dishes } = useRestaurantDetail(id)
  const { cart, itemsCount, totals } = useCart()
  const [vegOnly, setVegOnly] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  usePageTitle(restaurant.data?.name ?? 'Restaurant')

  const menu = dishes.data ?? []
  const visibleDishes = useMemo(
    () => (vegOnly ? menu.filter((dish) => dish.isVeg) : menu),
    [menu, vegOnly],
  )
  const categories = useMemo(
    () => [...new Set(visibleDishes.map((dish) => dish.category))],
    [visibleDishes],
  )
  const currentCategory = activeCategory || categories[0] || ''

  const scrollToCategory = (category: string) => {
    setActiveCategory(category)
    document.getElementById(`menu-${slugify(category)}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  if (restaurant.loading) {
    return (
      <div className="container page">
        <Skeleton className="restaurant-hero-skeleton" />
        <div className="menu-skeleton">
          <Skeleton className="skeleton-line skeleton-line--lg" />
          <Skeleton className="skeleton-line skeleton-line--md" />
          <Skeleton className="skeleton-line skeleton-line--md" />
          <Skeleton className="skeleton-line skeleton-line--sm" />
        </div>
      </div>
    )
  }

  if (restaurant.error) {
    return (
      <div className="container page">
        <ErrorState message={restaurant.error} onRetry={restaurant.reload} />
      </div>
    )
  }

  if (!restaurant.data) {
    return (
      <div className="container page">
        <EmptyState
          icon={<UtensilsCrossed size={28} />}
          title="Restaurant nahi mila"
          description="Ho sakta hai ye restaurant ab available nahi ho. Doosre options try karo."
          action={<Button to="/search">Browse restaurants</Button>}
        />
      </div>
    )
  }

  const data = restaurant.data
  const cartIsHere = cart.restaurantId === data.id
  const cartElsewhere = cart.items.length > 0 && !cartIsHere

  return (
    <div className="restaurant-page">
      <div className="restaurant-hero">
        <div className="restaurant-hero__media">
          <SmartImage src={data.coverImage ?? data.image} alt={data.name} eager />
          <span className="restaurant-hero__gradient" />
        </div>
        <div className="container restaurant-hero__container">
          <Link to="/search" className="restaurant-hero__back">
            <ArrowLeft size={16} /> All restaurants
          </Link>
          <div className="restaurant-hero__card">
            <div className="restaurant-hero__head">
              <div>
                <div className="restaurant-hero__tags">
                  {data.pureVeg && (
                    <span className="badge badge--green">
                      <Leaf size={12} /> Pure Veg
                    </span>
                  )}
                  {data.offer && (
                    <span className="badge badge--red">
                      <BadgePercent size={12} /> {data.offer}
                    </span>
                  )}
                </div>
                <h1>{data.name}</h1>
                <p className="restaurant-hero__cuisines">
                  {data.cuisines.join(' · ')} — {data.area}, {data.city}
                </p>
              </div>
              <RatingBadge rating={data.rating} count={data.ratingCount} />
            </div>

            <div className="restaurant-hero__meta">
              <div>
                <Clock3 size={16} />
                <strong>{data.deliveryTimeMin} min</strong>
                <small>Delivery time</small>
              </div>
              <span className="restaurant-hero__meta-divider" />
              <div>
                <UtensilsCrossed size={16} />
                <strong>{formatINR(data.priceForTwo)}</strong>
                <small>Cost for two</small>
              </div>
              <span className="restaurant-hero__meta-divider" />
              <div>
                <MapPin size={16} />
                <strong>{data.distanceKm.toFixed(1)} km</strong>
                <small>From you</small>
              </div>
              <span className="restaurant-hero__meta-divider" />
              <div>
                <Star size={16} />
                <strong>{data.dishCount ?? menu.length} dishes</strong>
                <small>On the menu</small>
              </div>
            </div>

            <p className="restaurant-hero__address">
              <MapPin size={14} /> {data.address ?? `${data.area}, ${data.city}`}
            </p>
          </div>
        </div>
      </div>

      <div className="container restaurant-layout">
        <div className="restaurant-menu">
          <div className="menu-head">
            <div>
              <span className="section-eyebrow">Menu</span>
              <h2>Kya khaoge aaj?</h2>
            </div>
            <VegToggle checked={vegOnly} onChange={setVegOnly} />
          </div>

          {categories.length > 0 && (
            <MenuNav
              categories={categories}
              active={currentCategory}
              onSelect={scrollToCategory}
              itemCount={visibleDishes.length}
            />
          )}

          {dishes.error ? (
            <ErrorState message={dishes.error} onRetry={dishes.reload} />
          ) : dishes.loading ? (
            <div className="menu-skeleton">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="skeleton-line skeleton-line--menu" />
              ))}
            </div>
          ) : visibleDishes.length === 0 ? (
            <EmptyState
              icon={<Leaf size={26} />}
              title="Koi veg dish nahi mili"
              description="Veg filter hata ke poora menu dekho."
              action={
                <Button variant="outline" onClick={() => setVegOnly(false)}>
                  Show full menu
                </Button>
              }
            />
          ) : (
            categories.map((category) => (
              <section key={category} id={`menu-${slugify(category)}`} className="menu-section">
                <h3>
                  {category}
                  <span>{visibleDishes.filter((dish) => dish.category === category).length}</span>
                </h3>
                <div className="menu-section__list">
                  {visibleDishes
                    .filter((dish) => dish.category === category)
                    .map((dish) => (
                      <DishRow key={dish.id} dish={dish} restaurant={data} />
                    ))}
                </div>
              </section>
            ))
          )}

          <div className="restaurant-info">
            <div className="restaurant-info__head">
              <Info size={18} />
              <h3>Restaurant information</h3>
            </div>
            <div className="restaurant-info__grid">
              <div>
                <span>Address</span>
                <strong>{data.address ?? `${data.area}, ${data.city}`}</strong>
              </div>
              <div>
                <span>Timings</span>
                <strong>11:00 AM – 11:00 PM</strong>
              </div>
              <div>
                <span>Payment</span>
                <strong>UPI, cards &amp; cash</strong>
              </div>
              <div>
                <span>Dining</span>
                <strong>{data.pureVeg ? 'Pure vegetarian' : 'Veg & non-veg'}</strong>
              </div>
            </div>
            <p className="restaurant-info__note">
              All prices are inclusive of GST. Delivery fee and platform charges apply at checkout.
            </p>
          </div>
        </div>

        <aside className="restaurant-aside">
          {cartElsewhere && (
            <div className="mini-cart mini-cart--warning">
              <h3>Cart {cart.restaurantName} se hai</h3>
              <p>Ek order me ek hi restaurant. Naya cart start karne ke liye item add karo.</p>
              <Button to="/cart" variant="outline" size="sm" full>
                View current cart
              </Button>
            </div>
          )}

          {cartIsHere ? (
            <div className="mini-cart">
              <div className="mini-cart__head">
                <ShoppingBag size={17} />
                <h3>Your cart</h3>
                <span>{itemsCount} items</span>
              </div>
              <ul className="mini-cart__items">
                {cart.items.map((item) => (
                  <li key={item.dishId}>
                    <span>
                      {item.name} <small>× {item.qty}</small>
                    </span>
                    <span>{formatINR(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mini-cart__subtotal">
                <span>Subtotal</span>
                <strong>{formatINR(totals.itemTotal)}</strong>
              </div>
              {totals.savings > 0 && (
                <p className="mini-cart__saving">You save {formatINR(totals.savings)}</p>
              )}
              <Button to="/cart" full>
                View cart &amp; checkout
              </Button>
            </div>
          ) : (
            !cartElsewhere && (
              <div className="mini-cart mini-cart--empty">
                <ShoppingBag size={22} />
                <h3>Cart khaali hai</h3>
                <p>Menu se apni favourite dish add karo.</p>
              </div>
            )
          )}
        </aside>
      </div>

      {cartIsHere && itemsCount > 0 && (
        <div className="mobile-cart-bar">
          <span>
            <strong>{itemsCount} items</strong>
            <small>{formatINR(totals.itemTotal)}</small>
          </span>
          <Link to="/cart" className="btn btn--primary">
            View cart
          </Link>
        </div>
      )}
    </div>
  )
}
