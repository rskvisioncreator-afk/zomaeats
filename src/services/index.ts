import { isFirebaseConfigured } from '@/lib/firebase'
import { firebaseProvider } from './firebaseProvider'
import { localProvider } from './localProvider'
import type { DataProvider } from './types'

/**
 * Single entry point for all data operations.
 * Switches automatically to Firebase as soon as env keys are present.
 */
export const dataProvider: DataProvider = isFirebaseConfigured ? firebaseProvider : localProvider

export const isDemoMode = !isFirebaseConfigured
export type { DataProvider }
