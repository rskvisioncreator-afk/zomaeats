import type { Dish, Restaurant } from '@/types'
import raw from './seed.json'

export const seedRestaurants = raw.restaurants as Restaurant[]
export const seedDishes = raw.dishes as Dish[]

export const DEMO_ACCOUNTS = {
  customer: { email: 'foodie@zomaeats.com', password: 'demo1234', name: 'Aarav Foodie' },
  admin: { email: 'admin@zomaeats.com', password: 'demo1234', name: 'Zomaeats Admin' },
} as const
