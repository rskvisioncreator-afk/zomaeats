import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, SearchX, SlidersHorizontal, X } from 'lucide-react'
import { RestaurantCard, RestaurantCardSkeleton } from '@/components/restaurant/RestaurantCard'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { dataProvider } from '@/services'
import { useAsyncData } from '@/hooks/useAsyncData'
import { usePageTitle, useRestaurants } from '@/hooks/useData'
import { CUISINES } from '@/data/catalog'
import { cn } from '@/lib/utils'
import type { Dish, RestaurantFilters } from '@/types'

const SORTS: { value: NonNullable<RestaurantFilters['sort']>; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Rating: high to low' },
  { value: 'delivery', label: 'Delivery time' },
  { value: 'cost-low', label: 'Cost: low to high' },
  { value: 'cost-high', label: 'Cost: high to low' },
]

const RATINGS = [4.0, 4.5]
const PRICES = [300, 500, 800]

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const { data: restaurants, loading, error, reload } = useRestaurants()
  const dishes = useAsyncData<Dish[]>(() => dataProvider.listDishes(), [])
  const [draft, setDraft] = useState(params.get('q') ?? '')
  const [filtersOpen, setFiltersOpen] = useState(false)
  usePageTitle('Search restaurants')

  const q = params.get('q') ?? ''
  const cuisine = params.get('cuisine') ?? ''
  const collection = params.get('collection') ?? ''
  const offers = params.get('offers') === '1'
  const veg = params.get('veg') === '1'
  const rating = Number(params.get('rating') ?? 0)
  const price = Number(params.get('price') ?? 0)
  const sort = (params.get('sort') ?? 'relevance') as NonNullable<RestaurantFilters['sort']>

  useEffect(() => {
    setDraft(q)
  }, [q])

  const setParam = (key: string, value?: string | null) => {
    const next = new URLSearchParams(params)
    if (!value) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const clearAll = () => {
    setParams(new URLSearchParams(), { replace: true })
    setDraft('')
  }

  const vegRestaurantIds = useMemo(() => {
    const map = new Set<string>()
    for (const dish of dishes.data ?? []) {
      if (dish.isVeg) map.add(dish.restaurantId)
    }
    return map
  }, [dishes.data])

  const dishMatchIds = useMemo(() => {
    if (!q.trim()) return new Set<string>()
    const needle = q.trim().toLowerCase()
    return new Set(
      (dishes.data ?? [])
        .filter((dish) => dish.name.toLowerCase().includes(needle))
        .map((dish) => dish.restaurantId),
    )
  }, [dishes.data, q])

  const results = useMemo(() => {
    if (!restaurants) return []
    const needle = q.trim().toLowerCase()
    const filtered = restaurants.filter((restaurant) => {
      const matchesQuery =
        !needle ||
        restaurant.name.toLowerCase().includes(needle) ||
        restaurant.area.toLowerCase().includes(needle) ||
        restaurant.cuisines.some((entry) => entry.toLowerCase().includes(needle)) ||
        dishMatchIds.has(restaurant.id)
      const matchesCuisine =
        !cuisine || restaurant.cuisines.some((entry) => entry.toLowerCase() === cuisine.toLowerCase())
      const matchesCollection = !collection || restaurant.collection === collection
      const matchesOffers = !offers || Boolean(restaurant.offer)
      const matchesVeg = !veg || restaurant.pureVeg || vegRestaurantIds.has(restaurant.id)
      const matchesRating = !rating || restaurant.rating >= rating
      const matchesPrice = !price || restaurant.priceForTwo <= price
      return (
        matchesQuery &&
        matchesCuisine &&
        matchesCollection &&
        matchesOffers &&
        matchesVeg &&
        matchesRating &&
        matchesPrice
      )
    })

    const sorted = [...filtered]
    if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating)
    else if (sort === 'delivery') sorted.sort((a, b) => a.deliveryTimeMin - b.deliveryTimeMin)
    else if (sort === 'cost-low') sorted.sort((a, b) => a.priceForTwo - b.priceForTwo)
    else if (sort === 'cost-high') sorted.sort((a, b) => b.priceForTwo - a.priceForTwo)
    return sorted
  }, [restaurants, q, dishMatchIds, cuisine, collection, offers, veg, rating, price, sort, vegRestaurantIds])

  const activeFilters = [
    cuisine && { key: 'cuisine', label: cuisine },
    collection && { key: 'collection', label: collection.replace('-', ' ') },
    offers && { key: 'offers', label: 'With offers' },
    veg && { key: 'veg', label: 'Veg only' },
    rating > 0 && { key: 'rating', label: `${rating}★ & above` },
    price > 0 && { key: 'price', label: `Under ₹${price} for two` },
    q && { key: 'q', label: `“${q}”` },
  ].filter(Boolean) as { key: string; label: string }[]

  const title = cuisine
    ? `Best ${cuisine} restaurants`
    : collection
      ? 'Handpicked collections'
      : q
        ? `Results for “${q}”`
        : 'Restaurants near you'

  return (
    <div className="container page search-page">
      <SectionHeader
        eyebrow={`${results.length} places found`}
        title={title}
        subtitle="Filters lagao, apna perfect meal dhundho."
        action={{ label: 'Clear all', to: '/search' }}
      />

      <div className="search-toolbar">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') setParam('q', draft.trim() || null)
          }}
          placeholder="Search restaurant, cuisine or dish..."
          aria-label="Search restaurants"
        />
        <Button size="sm" onClick={() => setParam('q', draft.trim() || null)}>
          Search
        </Button>
        <button
          type="button"
          className={cn('filters-toggle', filtersOpen && 'is-open')}
          onClick={() => setFiltersOpen((value) => !value)}
        >
          <SlidersHorizontal size={16} /> Filters
          {activeFilters.length > 0 && <span>{activeFilters.length}</span>}
        </button>
      </div>

      {activeFilters.length > 0 && (
        <div className="active-filters">
          {activeFilters.map((filter) => (
            <button key={filter.key} type="button" onClick={() => setParam(filter.key, null)}>
              {filter.label} <X size={13} />
            </button>
          ))}
          <button type="button" className="active-filters__clear" onClick={clearAll}>
            Clear all
          </button>
        </div>
      )}

      <div className="search-layout">
        <aside className={cn('filters', filtersOpen && 'is-open')}>
          <div className="filters__head">
            <h3>
              <Filter size={16} /> Filters
            </h3>
            <button type="button" onClick={clearAll}>
              Reset
            </button>
          </div>

          <div className="filters__group">
            <h4>Sort by</h4>
            <div className="filters__options filters__options--stack">
              {SORTS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn('filter-option', sort === option.value && 'is-active')}
                  onClick={() => setParam('sort', option.value === 'relevance' ? null : option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filters__group">
            <h4>Cuisines</h4>
            <div className="filters__chips">
              {CUISINES.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  className={cn('filter-chip', cuisine === entry && 'is-active')}
                  onClick={() => setParam('cuisine', cuisine === entry ? null : entry)}
                >
                  {entry}
                </button>
              ))}
            </div>
          </div>

          <div className="filters__group">
            <h4>Rating</h4>
            <div className="filters__chips">
              {RATINGS.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  className={cn('filter-chip', rating === entry && 'is-active')}
                  onClick={() => setParam('rating', rating === entry ? null : String(entry))}
                >
                  ★ {entry}+
                </button>
              ))}
            </div>
          </div>

          <div className="filters__group">
            <h4>Cost for two</h4>
            <div className="filters__chips">
              {PRICES.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  className={cn('filter-chip', price === entry && 'is-active')}
                  onClick={() => setParam('price', price === entry ? null : String(entry))}
                >
                  Under ₹{entry}
                </button>
              ))}
            </div>
          </div>

          <label className="filters__switch">
            <span>Pure veg options</span>
            <button
              type="button"
              role="switch"
              aria-checked={veg}
              className={cn('switch switch--sm', veg && 'is-on')}
              onClick={() => setParam('veg', veg ? null : '1')}
            >
              <span className="switch__thumb" />
            </button>
          </label>

          <label className="filters__switch">
            <span>Great offers</span>
            <button
              type="button"
              role="switch"
              aria-checked={offers}
              className={cn('switch switch--sm', offers && 'is-on')}
              onClick={() => setParam('offers', offers ? null : '1')}
            >
              <span className="switch__thumb" />
            </button>
          </label>

          <Button
            full
            className="filters__apply"
            onClick={() => setFiltersOpen(false)}
          >
            Show {results.length} restaurants
          </Button>
        </aside>

        <section className="search-results">
          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : loading ? (
            <div className="restaurant-grid restaurant-grid--search">
              {Array.from({ length: 6 }).map((_, index) => (
                <RestaurantCardSkeleton key={index} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              icon={<SearchX size={28} />}
              title="Koi restaurant match nahi hua"
              description="Try changing the cuisine, clearing filters or searching for a dish like “biryani”."
              action={
                <Button variant="outline" onClick={clearAll}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <div className="search-results__meta">
                <span>
                  Showing <strong>{results.length}</strong> restaurants
                </span>
                <span>Sorted by {SORTS.find((entry) => entry.value === sort)?.label}</span>
              </div>
              <div className="restaurant-grid restaurant-grid--search">
                {results.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            </>
          )}
          {dishes.loading && <Skeleton className="search-loading" />}
        </section>
      </div>
    </div>
  )
}
