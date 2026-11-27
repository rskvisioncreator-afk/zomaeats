import type { Coupon, OrderStatus } from '@/types'

/** INR formatter — no decimals when the amount is a whole number. */
export function formatINR(value: number, withDecimals = false): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  }).format(value)
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function uid(prefix = 'id'): string {
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now().toString(36)}${random}`
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn('localStorage write failed', error)
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

/** Percentage used by the progress meter in order tracking. */
export function orderProgress(status: OrderStatus): number {
  const steps: Record<OrderStatus, number> = {
    placed: 10,
    confirmed: 35,
    preparing: 55,
    out_for_delivery: 80,
    delivered: 100,
    cancelled: 100,
  }
  return steps[status]
}

export const BILL = {
  deliveryFee: 39,
  freeDeliveryAbove: 499,
  taxRate: 0.05,
  platformFee: 6,
} as const

export const COUPONS: Coupon[] = [
  {
    code: 'WELCOME50',
    label: '50% OFF up to ₹100',
    type: 'percent',
    value: 50,
    maxDiscount: 100,
    minOrder: 199,
  },
  {
    code: 'TASTY125',
    label: 'Flat ₹125 OFF',
    type: 'flat',
    value: 125,
    minOrder: 499,
  },
  {
    code: 'FREEDEL',
    label: 'Free delivery on this order',
    type: 'delivery',
    value: 100,
    minOrder: 0,
  },
]

export function couponDiscount(coupon: Coupon | null, itemTotal: number, deliveryFee: number): number {
  if (!coupon || itemTotal < coupon.minOrder) return 0
  if (coupon.type === 'flat') return coupon.value
  if (coupon.type === 'delivery') return deliveryFee
  const raw = Math.round((itemTotal * coupon.value) / 100)
  return Math.min(raw, coupon.maxDiscount ?? raw)
}

/**
 * Compresses an image in the browser before upload.
 * Keeps uploads small and fast — good for Firebase Storage and localStorage demo mode.
 */
export async function compressImage(file: File, maxSize = 1280, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('Sirf image files allowed hain')
  if (file.size > 6 * 1024 * 1024) throw new Error('Image 6MB se choti honi chahiye')

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Image compress nahi hui'))),
      'image/jpeg',
      quality,
    )
  })
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('File read failed'))
    reader.readAsDataURL(blob)
  })
}

/** Maps a Firestore error to a friendly message. */
export function friendlyError(error: unknown, fallback = 'Kuch galat ho gaya, dobara try karo.'): string {
  if (error instanceof Error && error.message) {
    const map: Record<string, string> = {
      'auth/invalid-credential': 'Email ya password galat hai.',
      'auth/user-not-found': 'Is email se koi account nahi mila.',
      'auth/wrong-password': 'Password galat hai.',
      'auth/email-already-in-use': 'Ye email pehle se registered hai.',
      'auth/weak-password': 'Password kam se kam 6 characters ka rakho.',
      'auth/popup-closed-by-user': 'Google sign-in cancel ho gaya.',
      'permission-denied': 'Permission nahi hai. Admin se contact karo.',
      'storage/unauthorized': 'Image upload ki permission nahi hai.',
    }
    for (const [code, message] of Object.entries(map)) {
      if (error.message.includes(code)) return message
    }
    return error.message
  }
  return fallback
}
