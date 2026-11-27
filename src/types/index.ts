export type CollectionKey = 'bestseller' | 'top-rated' | 'new'

export interface Restaurant {
  id: string
  name: string
  cuisines: string[]
  area: string
  city: string
  rating: number
  ratingCount: number
  deliveryTimeMin: number
  distanceKm: number
  priceForTwo: number
  offer?: string
  image: string
  coverImage?: string
  address?: string
  pureVeg?: boolean
  collection?: CollectionKey
  dishCount?: number
  createdAt?: string
}

export interface Dish {
  id: string
  restaurantId: string
  name: string
  description: string
  price: number
  image: string
  category: string
  isVeg: boolean
  isBestseller?: boolean
  serves?: number
  rating?: number
}

export interface CartItem {
  dishId: string
  name: string
  price: number
  image: string
  isVeg: boolean
  qty: number
}

export interface CartTotals {
  itemTotal: number
  deliveryFee: number
  taxes: number
  platformFee: number
  discount: number
  total: number
  savings: number
}

export type CouponType = 'percent' | 'flat' | 'delivery'

export interface Coupon {
  code: string
  label: string
  type: CouponType
  value: number
  minOrder: number
  maxDiscount?: number
}

export interface Address {
  id: string
  label: 'Home' | 'Work' | 'Other'
  name: string
  phone: string
  line1: string
  line2?: string
  city: string
  pincode: string
}

export type UserRole = 'customer' | 'admin'

export interface AppUser {
  uid: string
  name: string
  email: string
  phone?: string
  photoURL?: string
  role: UserRole
  addresses: Address[]
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export interface OrderItem {
  dishId: string
  name: string
  price: number
  qty: number
  isVeg: boolean
  image: string
}

export type PaymentMethod = 'UPI' | 'Card' | 'Cash on Delivery'

export interface Order {
  id: string
  userId: string
  userName: string
  restaurantId: string
  restaurantName: string
  restaurantImage?: string
  items: OrderItem[]
  itemTotal: number
  deliveryFee: number
  taxes: number
  platformFee: number
  discount: number
  total: number
  couponCode?: string
  address: Address
  paymentMethod: PaymentMethod
  status: OrderStatus
  etaMinutes: number
  createdAt: string
}

export interface NewOrderInput {
  userId: string
  userName: string
  restaurantId: string
  restaurantName: string
  restaurantImage?: string
  items: OrderItem[]
  totals: CartTotals
  couponCode?: string
  address: Address
  paymentMethod: PaymentMethod
  etaMinutes: number
}

export interface RestaurantFilters {
  query?: string
  cuisine?: string
  city?: string
  area?: string
  vegOnly?: boolean
  minRating?: number
  maxPrice?: number
  sort?: 'relevance' | 'rating' | 'delivery' | 'cost-low' | 'cost-high'
}

export const ORDER_FLOW: { key: OrderStatus; label: string; hint: string }[] = [
  { key: 'placed', label: 'Order placed', hint: 'We have received your order' },
  { key: 'confirmed', label: 'Confirmed', hint: 'Restaurant accepted your order' },
  { key: 'preparing', label: 'Preparing', hint: 'Chef is working the magic' },
  { key: 'out_for_delivery', label: 'On the way', hint: 'Rider picked up your food' },
  { key: 'delivered', label: 'Delivered', hint: 'Enjoy your meal!' },
]
