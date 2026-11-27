import { Link } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn('logo', className)} aria-label="Zomaeats home">
      <span className="logo__mark">
        <UtensilsCrossed size={20} strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="logo__word">
          zomaeats<span className="logo__dot">.</span>
        </span>
      )}
    </Link>
  )
}
