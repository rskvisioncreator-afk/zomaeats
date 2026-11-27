import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/**
 * When no Firebase keys are present the app automatically runs in demo mode:
 * data lives in localStorage and auth is simulated, so the UI can be explored
 * without any backend setup.
 */
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId)

let app: FirebaseApp | null = null
let authInstance: Auth | null = null
let dbInstance: Firestore | null = null
let storageInstance: FirebaseStorage | null = null

if (isFirebaseConfigured) {
  app = initializeApp(config)
  authInstance = getAuth(app)
  dbInstance = getFirestore(app)
  storageInstance = getStorage(app)
}

export const firebaseApp = app
export const firebaseAuth = authInstance
export const firebaseDb = dbInstance
export const firebaseStorage = storageInstance

export function requireDb(): Firestore {
  if (!dbInstance) throw new Error('Firebase configure nahi hai. .env me keys daalo.')
  return dbInstance
}

export function requireAuth(): Auth {
  if (!authInstance) throw new Error('Firebase Auth configure nahi hai.')
  return authInstance
}

export function requireStorage(): FirebaseStorage {
  if (!storageInstance) throw new Error('Firebase Storage configure nahi hai.')
  return storageInstance
}

export const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)
