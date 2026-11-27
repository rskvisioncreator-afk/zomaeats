import { Check, Copy, Gift, Percent, Truck } from 'lucide-react'
import { useState } from 'react'
import { OFFERS } from '@/data/catalog'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

const ICONS = { red: Percent, dark: Truck, gold: Gift }

export function OfferStrip() {
  const toast = useToast()
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(code)
      toast.success(`${code} copied — cart me apply karo!`)
      window.setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.info(`Coupon code: ${code}`)
    }
  }

  return (
    <section className="container offers">
      <div className="offers__head">
        <h2>Best offers for you</h2>
        <span>Tap a card to copy the code</span>
      </div>
      <div className="offers__grid">
        {OFFERS.map((offer) => {
          const Icon = ICONS[offer.tone]
          return (
            <button
              key={offer.code}
              type="button"
              className={cn('offer-card', `offer-card--${offer.tone}`)}
              onClick={() => copy(offer.code)}
            >
              <div className="offer-card__text">
                <strong>{offer.title}</strong>
                <span>{offer.subtitle}</span>
                <em className="offer-card__code">
                  {offer.code}
                  {copied === offer.code ? <Check size={13} /> : <Copy size={13} />}
                </em>
              </div>
              <span className="offer-card__icon">
                <Icon size={34} strokeWidth={1.6} />
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
