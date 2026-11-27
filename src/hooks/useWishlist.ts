import { useCallback, useEffect, useState } from 'react'
import { readStorage, writeStorage } from '@/lib/utils'

const KEY = 'zomaeats:wishlist:v1'

/** Small persisted favourites list used by the heart button on restaurant cards. */
export function useWishlist() {
  const [ids, setIds] = useState<string[]>(() => readStorage<string[]>(KEY, []))

  useEffect(() => {
    writeStorage(KEY, ids)
  }, [ids])

  const toggle = useCallback((id: string) => {
    setIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    )
  }, [])

  return { ids, toggle, has: (id: string) => ids.includes(id) }
}
