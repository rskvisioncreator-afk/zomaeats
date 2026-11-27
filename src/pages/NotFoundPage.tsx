import { Compass, Home, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usePageTitle } from '@/hooks/useData'

export function NotFoundPage() {
  usePageTitle('Page not found')

  return (
    <div className="container page not-found">
      <div className="not-found__art">
        <span className="not-found__plate">
          <UtensilsCrossed size={46} />
        </span>
        <span className="not-found__code">404</span>
      </div>
      <h1>Ye dish menu par nahi hai</h1>
      <p>
        Page jo aap dhundh rahe ho wo exist nahi karta, ya ho sakta hai shift ho gaya ho.
      </p>
      <div className="not-found__actions">
        <Button to="/" icon={<Home size={16} />}>Back to home</Button>
        <Button to="/search" variant="outline" icon={<Compass size={16} />}>Browse restaurants</Button>
      </div>
    </div>
  )
}
