import { AlertCircle } from 'lucide-react'
import { Hero } from '@/components/home/Hero'
import { OfferStrip } from '@/components/home/OfferStrip'
import { CategoryRail } from '@/components/home/CategoryRail'
import { CollectionGrid } from '@/components/home/CollectionGrid'
import { HowItWorks } from '@/components/home/HowItWorks'
import { RestaurantCard, RestaurantCardSkeleton } from '@/components/restaurant/RestaurantCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmptyState, ErrorState } from '@/components/ui/Feedback'
import { useRestaurants, usePageTitle } from '@/hooks/useData'
import { useLocation } from '@/context/LocationContext'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'

export function HomePage() {
  usePageTitle()
  const { data, loading, error, reload } = useRestaurants()
  const { location } = useLocation()
  const { isAdmin } = useAuth()

  const inCity = (data ?? []).filter((restaurant) => restaurant.city === location.city)
  const popular = (inCity.length >= 3 ? inCity : data ?? []).slice(0, 8)

  return (
    <>
      <Hero restaurantCount={data?.length ?? 20} />
      <OfferStrip />
      <CategoryRail />

      <section className="container popular">
        <SectionHeader
          eyebrow={`Delivering to ${location.area}`}
          title={`Popular restaurants in ${location.city}`}
          subtitle="Top-rated kitchens, fastest delivery aur best offers — sab ek jagah."
          action={{ label: 'See all restaurants', to: '/search' }}
        />

        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading ? (
          <div className="restaurant-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <RestaurantCardSkeleton key={index} />
            ))}
          </div>
        ) : popular.length === 0 ? (
          <EmptyState
            icon={<AlertCircle size={26} />}
            title="Yahan abhi koi restaurant nahi hai"
            description={
              isAdmin
                ? 'Admin dashboard se demo data seed karo ya naya restaurant add karo.'
                : 'Location change karke dekho, ya thodi der baad wapas aana.'
            }
            action={
              isAdmin ? (
                <Button to="/admin">Open admin dashboard</Button>
              ) : (
                <Button to="/search" variant="outline">
                  Browse all restaurants
                </Button>
              )
            }
          />
        ) : (
          <div className="restaurant-grid">
            {popular.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>

      <CollectionGrid />
      <HowItWorks />
    </>
  )
}
