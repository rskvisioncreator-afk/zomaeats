import type { AppUser, Dish, NewOrderInput, Order, OrderStatus, Restaurant } from '@/types'
import { blobToDataUrl, compressImage, sleep, uid } from '@/lib/utils'
import { seedDishes, seedRestaurants } from '@/data/seed'
import type { DataProvider, UploadProgress } from './types'

interface DemoDb {
  restaurants: Restaurant[]
  dishes: Dish[]
  orders: Order[]
  profiles: Record<string, AppUser>
  seedVersion: number
}

const DB_KEY = 'zomaeats:db:v1'
// Bump this whenever new seeded restaurants/dishes ship, so existing demo
// players receive them without losing their orders or admin edits.
const SEED_VERSION = 3

function initialState(): DemoDb {
  return {
    restaurants: structuredClone(seedRestaurants),
    dishes: structuredClone(seedDishes),
    orders: [],
    profiles: {},
    seedVersion: SEED_VERSION,
  }
}

function loadDb(): DemoDb {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (!raw) {
      const fresh = initialState()
      localStorage.setItem(DB_KEY, JSON.stringify(fresh))
      return fresh
    }
    const db = JSON.parse(raw) as DemoDb
    if ((db.seedVersion ?? 1) < SEED_VERSION) {
      const restaurantIds = new Set(db.restaurants.map((restaurant) => restaurant.id))
      const dishIds = new Set(db.dishes.map((dish) => dish.id))
      for (const restaurant of seedRestaurants) {
        if (!restaurantIds.has(restaurant.id)) db.restaurants.push(structuredClone(restaurant))
      }
      for (const dish of seedDishes) {
        if (!dishIds.has(dish.id)) db.dishes.push(structuredClone(dish))
      }
      db.seedVersion = SEED_VERSION
      saveDb(db)
    }
    return db
  } catch {
    return initialState()
  }
}

function saveDb(db: DemoDb): void {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch (error) {
    console.warn('Demo DB write failed (storage full?)', error)
  }
}

const LATENCY = 180

/**
 * Demo provider — same contract as the Firebase provider but backed by
 * localStorage, so the whole product works with zero backend setup.
 */
export const localProvider: DataProvider = {
  kind: 'demo',

  async listRestaurants() {
    await sleep(LATENCY)
    return loadDb().restaurants
  },

  async getRestaurant(id) {
    await sleep(LATENCY)
    return loadDb().restaurants.find((r) => r.id === id) ?? null
  },

  async saveRestaurant(restaurant) {
    await sleep(LATENCY)
    const db = loadDb()
    const id = restaurant.id || `${restaurant.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${uid()}`
    const next: Restaurant = { ...restaurant, id, createdAt: restaurant.createdAt ?? new Date().toISOString() }
    const index = db.restaurants.findIndex((r) => r.id === id)
    if (index >= 0) db.restaurants[index] = next
    else db.restaurants.unshift(next)
    saveDb(db)
    return next
  },

  async deleteRestaurant(id) {
    await sleep(LATENCY)
    const db = loadDb()
    db.restaurants = db.restaurants.filter((r) => r.id !== id)
    db.dishes = db.dishes.filter((d) => d.restaurantId !== id)
    saveDb(db)
  },

  async listDishes(restaurantId) {
    await sleep(LATENCY)
    const dishes = loadDb().dishes
    return restaurantId ? dishes.filter((d) => d.restaurantId === restaurantId) : dishes
  },

  async saveDish(dish) {
    await sleep(LATENCY)
    const db = loadDb()
    const id = dish.id || `${dish.restaurantId}-${uid('dish')}`
    const next: Dish = { ...dish, id }
    const index = db.dishes.findIndex((d) => d.id === id)
    if (index >= 0) db.dishes[index] = next
    else db.dishes.unshift(next)
    saveDb(db)
    return next
  },

  async deleteDish(id) {
    await sleep(LATENCY)
    const db = loadDb()
    db.dishes = db.dishes.filter((d) => d.id !== id)
    saveDb(db)
  },

  async createOrder(input: NewOrderInput) {
    await sleep(500)
    const db = loadDb()
    const order: Order = {
      id: uid('order'),
      userId: input.userId,
      userName: input.userName,
      restaurantId: input.restaurantId,
      restaurantName: input.restaurantName,
      restaurantImage: input.restaurantImage,
      items: input.items,
      itemTotal: input.totals.itemTotal,
      deliveryFee: input.totals.deliveryFee,
      taxes: input.totals.taxes,
      platformFee: input.totals.platformFee,
      discount: input.totals.discount,
      total: input.totals.total,
      couponCode: input.couponCode,
      address: input.address,
      paymentMethod: input.paymentMethod,
      status: 'placed',
      etaMinutes: input.etaMinutes,
      createdAt: new Date().toISOString(),
    }
    db.orders.unshift(order)
    saveDb(db)
    return order
  },

  async listOrders(userId) {
    await sleep(LATENCY)
    const orders = loadDb().orders
    const filtered = userId ? orders.filter((o) => o.userId === userId) : orders
    return [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  async getOrder(id) {
    await sleep(LATENCY)
    return loadDb().orders.find((o) => o.id === id) ?? null
  },

  async updateOrderStatus(id, status: OrderStatus) {
    await sleep(LATENCY)
    const db = loadDb()
    const order = db.orders.find((o) => o.id === id)
    if (order) order.status = status
    saveDb(db)
  },

  async getProfile(uid) {
    return loadDb().profiles[uid] ?? null
  },

  async saveProfile(profile) {
    const db = loadDb()
    db.profiles[profile.uid] = profile
    saveDb(db)
  },

  async seedDemoData() {
    await sleep(400)
    const db = loadDb()
    db.restaurants = structuredClone(seedRestaurants)
    db.dishes = structuredClone(seedDishes)
    saveDb(db)
    return { restaurants: db.restaurants.length, dishes: db.dishes.length }
  },

  async uploadImage(file: File, _folder, onProgress?: UploadProgress) {
    onProgress?.(15)
    const blob = await compressImage(file)
    onProgress?.(70)
    const dataUrl = await blobToDataUrl(blob)
    onProgress?.(100)
    return dataUrl
  },
}

export function resetDemoDb(): void {
  localStorage.removeItem(DB_KEY)
}
