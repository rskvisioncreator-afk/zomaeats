import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { BILL, COUPONS, couponDiscount, readStorage, writeStorage } from '@/lib/utils'
import type { CartItem, CartTotals, Coupon, Dish, Restaurant } from '@/types'

interface CartState {
  restaurantId: string | null
  restaurantName: string
  restaurantImage: string
  items: CartItem[]
  couponCode: string | null
}

interface PendingItem {
  dish: Dish
  restaurant: Restaurant
}

interface CartContextValue {
  cart: CartState
  itemsCount: number
  totals: CartTotals
  coupon: Coupon | null
  pendingItem: PendingItem | null
  addItem: (dish: Dish, restaurant: Restaurant) => 'added' | 'conflict'
  resolveConflict: (replace: boolean) => void
  removeItem: (dishId: string) => void
  setQty: (dishId: string, qty: number) => void
  clearCart: () => void
  startCart: (restaurant: Restaurant, items: CartItem[]) => void
  applyCoupon: (code: string) => { ok: boolean; message: string }
  removeCoupon: () => void
}

const CART_KEY = 'zomaeats:cart:v1'

const EMPTY_CART: CartState = {
  restaurantId: null,
  restaurantName: '',
  restaurantImage: '',
  items: [],
  couponCode: null,
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(() => readStorage(CART_KEY, EMPTY_CART))
  const [pendingItem, setPendingItem] = useState<PendingItem | null>(null)

  useEffect(() => {
    writeStorage(CART_KEY, cart)
  }, [cart])

  const addItem = useCallback(
    (dish: Dish, restaurant: Restaurant) => {
      const conflict = cart.restaurantId !== null && cart.restaurantId !== restaurant.id
      if (conflict) {
        setPendingItem({ dish, restaurant })
        return 'conflict' as const
      }
      setCart((current) => {
        const existing = current.items.find((item) => item.dishId === dish.id)
        const items = existing
          ? current.items.map((item) =>
              item.dishId === dish.id ? { ...item, qty: item.qty + 1 } : item,
            )
          : [
              ...current.items,
              {
                dishId: dish.id,
                name: dish.name,
                price: dish.price,
                image: dish.image,
                isVeg: dish.isVeg,
                qty: 1,
              },
            ]
        return {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          restaurantImage: restaurant.image,
          items,
          couponCode: current.couponCode,
        }
      })
      return 'added' as const
    },
    [cart.restaurantId],
  )

  const resolveConflict = useCallback(
    (replace: boolean) => {
      if (replace && pendingItem) {
        const { dish, restaurant } = pendingItem
        setCart({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          restaurantImage: restaurant.image,
          items: [
            {
              dishId: dish.id,
              name: dish.name,
              price: dish.price,
              image: dish.image,
              isVeg: dish.isVeg,
              qty: 1,
            },
          ],
          couponCode: null,
        })
      }
      setPendingItem(null)
    },
    [pendingItem],
  )

  const removeItem = useCallback((dishId: string) => {
    setCart((current) => {
      const items = current.items.filter((item) => item.dishId !== dishId)
      return items.length === 0 ? EMPTY_CART : { ...current, items }
    })
  }, [])

  const setQty = useCallback((dishId: string, qty: number) => {
    setCart((current) => {
      const items =
        qty <= 0
          ? current.items.filter((item) => item.dishId !== dishId)
          : current.items.map((item) => (item.dishId === dishId ? { ...item, qty } : item))
      return items.length === 0 ? EMPTY_CART : { ...current, items }
    })
  }, [])

  const clearCart = useCallback(() => {
    setCart(EMPTY_CART)
    setPendingItem(null)
  }, [])

  const startCart = useCallback((restaurant: Restaurant, items: CartItem[]) => {
    setCart({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantImage: restaurant.image,
      items,
      couponCode: null,
    })
    setPendingItem(null)
  }, [])

  const applyCoupon = useCallback(
    (code: string) => {
      const normalized = code.trim().toUpperCase()
      const found = COUPONS.find((coupon) => coupon.code === normalized)
      if (!found) return { ok: false, message: 'Ye coupon code valid nahi hai.' }
      const itemTotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0)
      if (itemTotal < found.minOrder) {
        return { ok: false, message: `Is coupon ke liye minimum ₹${found.minOrder} ka order chahiye.` }
      }
      setCart((current) => ({ ...current, couponCode: found.code }))
      return { ok: true, message: `${found.label} applied!` }
    },
    [cart.items],
  )

  const removeCoupon = useCallback(() => {
    setCart((current) => ({ ...current, couponCode: null }))
  }, [])

  const itemsCount = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.qty, 0),
    [cart.items],
  )

  const coupon = useMemo(
    () => COUPONS.find((entry) => entry.code === cart.couponCode) ?? null,
    [cart.couponCode],
  )

  const totals = useMemo<CartTotals>(() => {
    const itemTotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0)
    const deliveryFee = itemTotal === 0 || itemTotal >= BILL.freeDeliveryAbove ? 0 : BILL.deliveryFee
    const taxes = Math.round(itemTotal * BILL.taxRate)
    const platformFee = itemTotal === 0 ? 0 : BILL.platformFee
    const discount = couponDiscount(coupon, itemTotal, deliveryFee)
    const total = Math.max(0, itemTotal + deliveryFee + taxes + platformFee - discount)
    return {
      itemTotal,
      deliveryFee,
      taxes,
      platformFee,
      discount,
      total,
      savings: discount + (deliveryFee === 0 && itemTotal > 0 ? BILL.deliveryFee : 0),
    }
  }, [cart.items, coupon])

  const value = useMemo(
    () => ({
      cart,
      itemsCount,
      totals,
      coupon,
      pendingItem,
      addItem,
      resolveConflict,
      removeItem,
      setQty,
      clearCart,
      startCart,
      applyCoupon,
      removeCoupon,
    }),
    [
      cart,
      itemsCount,
      totals,
      coupon,
      pendingItem,
      addItem,
      resolveConflict,
      removeItem,
      setQty,
      clearCart,
      startCart,
      applyCoupon,
      removeCoupon,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
