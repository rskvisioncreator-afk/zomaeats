import { useEffect, useMemo } from 'react'
import { dataProvider } from '@/services'
import type { Order, Restaurant } from '@/types'
import { useAsyncData } from './useAsyncData'

export function useRestaurants() {
  const result = useAsyncData<Restaurant[]>(() => dataProvider.listRestaurants(), [])
  const restaurants = useMemo(
    () => (result.data ? [...result.data].sort((a, b) => b.rating - a.rating) : null),
    [result.data],
  )
  return { ...result, data: restaurants }
}

export function useRestaurantDetail(id: string) {
  const restaurant = useAsyncData(() => dataProvider.getRestaurant(id), [id])
  const dishes = useAsyncData(() => dataProvider.listDishes(id), [id])
  return { restaurant, dishes }
}

export function useOrders(userId?: string | null) {
  return useAsyncData<Order[]>(
    () => (userId ? dataProvider.listOrders(userId) : Promise.resolve([])),
    [userId],
  )
}

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Zomaeats` : 'Zomaeats · Food delivery in minutes'
  }, [title])
}
