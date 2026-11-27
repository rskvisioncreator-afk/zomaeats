import type { AppUser, Dish, NewOrderInput, Order, OrderStatus, Restaurant } from '@/types'

export type UploadProgress = (percent: number) => void

export interface DataProvider {
  readonly kind: 'firebase' | 'demo'
  listRestaurants(): Promise<Restaurant[]>
  getRestaurant(id: string): Promise<Restaurant | null>
  saveRestaurant(restaurant: Restaurant): Promise<Restaurant>
  deleteRestaurant(id: string): Promise<void>

  listDishes(restaurantId?: string): Promise<Dish[]>
  saveDish(dish: Dish): Promise<Dish>
  deleteDish(id: string): Promise<void>

  createOrder(input: NewOrderInput): Promise<Order>
  listOrders(userId?: string): Promise<Order[]>
  getOrder(id: string): Promise<Order | null>
  updateOrderStatus(id: string, status: OrderStatus): Promise<void>

  getProfile(uid: string): Promise<AppUser | null>
  saveProfile(profile: AppUser): Promise<void>

  seedDemoData(): Promise<{ restaurants: number; dishes: number }>
  uploadImage(file: File, folder: 'restaurants' | 'dishes', onProgress?: UploadProgress): Promise<string>
}
