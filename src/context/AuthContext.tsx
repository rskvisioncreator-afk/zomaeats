import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { adminEmails, firebaseAuth, isFirebaseConfigured } from '@/lib/firebase'
import { dataProvider } from '@/services'
import { DEMO_ACCOUNTS } from '@/data/seed'
import { friendlyError, readStorage, slugify, writeStorage } from '@/lib/utils'
import type { AppUser } from '@/types'

const DEMO_USER_KEY = 'zomaeats:user'

interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  isAdmin: boolean
  isDemo: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOutUser: () => Promise<void>
  updateUser: (patch: Partial<AppUser>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function demoProfile(email: string, name?: string): AppUser {
  const normalized = email.trim().toLowerCase()
  const isAdminEmail =
    normalized === DEMO_ACCOUNTS.admin.email ||
    normalized.startsWith('admin@') ||
    adminEmails.includes(normalized)
  return {
    uid: `demo_${slugify(normalized)}`,
    name: name?.trim() || normalized.split('@')[0].replace(/[._]/g, ' '),
    email: normalized,
    role: isAdminEmail ? 'admin' : 'customer',
    addresses: [],
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !firebaseAuth) {
      setUser(readStorage<AppUser | null>(DEMO_USER_KEY, null))
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null)
          return
        }
        const stored = await dataProvider.getProfile(firebaseUser.uid)
        const fallback: AppUser = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Foodie',
          email: firebaseUser.email ?? '',
          photoURL: firebaseUser.photoURL ?? undefined,
          // Security rules only allow a user to create their profile as a
          // customer. Admins are promoted from the Firebase Console.
          role: 'customer',
          addresses: [],
        }
        const profile = stored ?? fallback
        if (!stored) await dataProvider.saveProfile(profile)
        setUser(profile)
      } finally {
        setLoading(false)
      }
    })
    return unsubscribe
  }, [])

  const persist = useCallback(async (next: AppUser) => {
    setUser(next)
    if (!isFirebaseConfigured) writeStorage(DEMO_USER_KEY, next)
    await dataProvider.saveProfile(next)
  }, [])

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!isFirebaseConfigured || !firebaseAuth) {
        if (!email.includes('@')) throw new Error('Valid email daalo')
        if (password.length < 4) throw new Error('Password kam se kam 4 characters ka ho')
        const base = demoProfile(email)
        const existing = await dataProvider.getProfile(base.uid)
        await persist({ ...base, ...existing, role: base.role, email: base.email })
        return
      }
      try {
        await signInWithEmailAndPassword(firebaseAuth, email.trim(), password)
      } catch (error) {
        throw new Error(friendlyError(error, 'Sign in nahi ho paya'))
      }
    },
    [persist],
  )

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      if (!name.trim()) throw new Error('Apna naam daalo')
      if (!isFirebaseConfigured || !firebaseAuth) {
        await persist(demoProfile(email, name))
        return
      }
      try {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password)
        await updateProfile(credential.user, { displayName: name.trim() })
        const profile: AppUser = {
          uid: credential.user.uid,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          // Self-signup is always a customer; promote admins in the console.
          role: 'customer',
          addresses: [],
        }
        await persist(profile)
      } catch (error) {
        throw new Error(friendlyError(error, 'Account nahi ban paya'))
      }
    },
    [persist],
  )

  const signInWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured || !firebaseAuth) {
      const demo = demoProfile(DEMO_ACCOUNTS.customer.email, DEMO_ACCOUNTS.customer.name)
      const existing = await dataProvider.getProfile(demo.uid)
      await persist({ ...demo, ...existing, role: demo.role })
      return
    }
    try {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider())
    } catch (error) {
      throw new Error(friendlyError(error, 'Google sign-in nahi ho paya'))
    }
  }, [persist])

  const signOutUser = useCallback(async () => {
    if (isFirebaseConfigured && firebaseAuth) await signOut(firebaseAuth)
    localStorage.removeItem(DEMO_USER_KEY)
    setUser(null)
  }, [])

  const updateUser = useCallback(
    async (patch: Partial<AppUser>) => {
      if (!user) throw new Error('Pehle login karo')
      const next: AppUser = { ...user, ...patch }
      await persist(next)
    },
    [persist, user],
  )

  const isAdmin = Boolean(
    user && (user.role === 'admin' || adminEmails.includes(user.email.toLowerCase())),
  )

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin,
      isDemo: !isFirebaseConfigured,
      signIn,
      signUp,
      signInWithGoogle,
      signOutUser,
      updateUser,
    }),
    [user, loading, isAdmin, signIn, signUp, signInWithGoogle, signOutUser, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
