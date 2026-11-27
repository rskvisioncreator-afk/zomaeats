import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { requireDb, requireStorage } from '@/lib/firebase'
import { compressImage, slugify } from '@/lib/utils'
import { seedDishes, seedRestaurants } from '@/data/seed'
import type { AppUser, Dish, NewOrderInput, Order, OrderStatus, Restaurant } from '@/types'
import type { DataProvider, UploadProgress } from './types'

const db = () => requireDb()

/**
 * Firestore implementation.
 * Collections: restaurants, dishes, orders, users.
 */
export const firebaseProvider: DataProvider = {
  kind: 'firebase',

  async listRestaurants() {
    const snapshot = await getDocs(collection(db(), 'restaurants'))
    return snapshot.docs.map((d) => ({ ...(d.data() as Restaurant), id: d.id }))
  },

  async getRestaurant(id) {
    const snapshot = await getDoc(doc(db(), 'restaurants', id))
    return snapshot.exists() ? ({ ...(snapshot.data() as Restaurant), id: snapshot.id }) : null
  },

  async saveRestaurant(restaurant) {
    const id =
      restaurant.id ||
      `${slugify(restaurant.name)}-${Math.random().toString(36).slice(2, 6)}`
    const payload: Restaurant = {
      ...restaurant,
      id,
      createdAt: restaurant.createdAt ?? new Date().toISOString(),
    }
    await setDoc(doc(db(), 'restaurants', id), payload)
    return payload
  },

  async deleteRestaurant(id) {
    const dishes = await getDocs(query(collection(db(), 'dishes'), where('restaurantId', '==', id)))
    const batch = writeBatch(db())
    dishes.docs.forEach((d) => batch.delete(d.ref))
    batch.delete(doc(db(), 'restaurants', id))
    await batch.commit()
  },

  async listDishes(restaurantId) {
    const dishesRef = collection(db(), 'dishes')
    const snapshot = await getDocs(
      restaurantId ? query(dishesRef, where('restaurantId', '==', restaurantId)) : dishesRef,
    )
    return snapshot.docs.map((d) => ({ ...(d.data() as Dish), id: d.id }))
  },

  async saveDish(dish) {
    const id = dish.id || doc(collection(db(), 'dishes')).id
    const payload: Dish = { ...dish, id }
    await setDoc(doc(db(), 'dishes', id), payload)
    return payload
  },

  async deleteDish(id) {
    await deleteDoc(doc(db(), 'dishes', id))
  },

  async createOrder(input: NewOrderInput) {
    const createdAt = new Date().toISOString()
    const payload: Omit<Order, 'id'> = {
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
      createdAt,
    }
    const created = await addDoc(collection(db(), 'orders'), payload)
    return { ...payload, id: created.id }
  },

  async listOrders(userId) {
    const ordersRef = collection(db(), 'orders')
    const snapshot = await getDocs(
      userId
        ? query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'))
        : query(ordersRef, orderBy('createdAt', 'desc')),
    )
    return snapshot.docs.map((d) => ({ ...(d.data() as Order), id: d.id }))
  },

  async getOrder(id) {
    const snapshot = await getDoc(doc(db(), 'orders', id))
    return snapshot.exists() ? ({ ...(snapshot.data() as Order), id: snapshot.id }) : null
  },

  async updateOrderStatus(id, status: OrderStatus) {
    await updateDoc(doc(db(), 'orders', id), { status })
  },

  async getProfile(uid) {
    const snapshot = await getDoc(doc(db(), 'users', uid))
    return snapshot.exists() ? (snapshot.data() as AppUser) : null
  },

  async saveProfile(profile) {
    await setDoc(doc(db(), 'users', profile.uid), profile, { merge: true })
  },

  async seedDemoData() {
    const batchSize = 400
    const docs = [
      ...seedRestaurants.map((restaurant) => ({ collection: 'restaurants', id: restaurant.id, data: restaurant })),
      ...seedDishes.map((dish) => ({ collection: 'dishes', id: dish.id, data: dish })),
    ]

    for (let index = 0; index < docs.length; index += batchSize) {
      const batch = writeBatch(db())
      for (const entry of docs.slice(index, index + batchSize)) {
        batch.set(doc(db(), entry.collection, entry.id), entry.data)
      }
      await batch.commit()
    }
    return { restaurants: seedRestaurants.length, dishes: seedDishes.length }
  },

  async uploadImage(file: File, folder, onProgress?: UploadProgress) {
    const blob = await compressImage(file)
    const path = `${folder}/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ''))}.jpg`
    const storageRef = ref(requireStorage(), path)
    const task = uploadBytesResumable(storageRef, blob, { contentType: 'image/jpeg' })

    return new Promise<string>((resolve, reject) => {
      task.on(
        'state_changed',
        (snapshot) => onProgress?.(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
        reject,
        async () => resolve(await getDownloadURL(task.snapshot.ref)),
      )
    })
  },
}
