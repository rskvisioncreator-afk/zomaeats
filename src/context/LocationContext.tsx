import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CITIES } from '@/data/catalog'
import { readStorage, writeStorage } from '@/lib/utils'

export interface DeliveryLocation {
  city: string
  area: string
}

interface LocationContextValue {
  location: DeliveryLocation
  setLocation: (location: DeliveryLocation) => void
  cities: typeof CITIES
}

const LOCATION_KEY = 'zomaeats:location:v1'
const DEFAULT_LOCATION: DeliveryLocation = { city: 'Delhi NCR', area: 'Connaught Place' }

const LocationContext = createContext<LocationContextValue | null>(null)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<DeliveryLocation>(() =>
    readStorage(LOCATION_KEY, DEFAULT_LOCATION),
  )

  const setLocation = useCallback((next: DeliveryLocation) => {
    setLocationState(next)
    writeStorage(LOCATION_KEY, next)
  }, [])

  const value = useMemo(
    () => ({ location, setLocation, cities: CITIES }),
    [location, setLocation],
  )

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export function useLocation(): LocationContextValue {
  const context = useContext(LocationContext)
  if (!context) throw new Error('useLocation must be used within LocationProvider')
  return context
}
