import { Link } from 'react-router-dom'
import { Bike, MapPin, UtensilsCrossed } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'

const STEPS = [
  {
    icon: MapPin,
    title: 'Set your location',
    text: 'Apna area choose karo — hum nearest kitchens dikhayenge, delivery time ke saath.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Pick your food',
    text: 'Ratings, bestsellers aur honest reviews dekh ke order karo. Veg filter bhi hai.',
  },
  {
    icon: Bike,
    title: 'Track till the door',
    text: 'Order placed se delivered tak live status. Garam khana, 30 minute me.',
  },
]

export function HowItWorks() {
  return (
    <section className="container how-it-works">
      <SectionHeader
        eyebrow="Zero drama"
        title="Ordering in 3 easy steps"
        subtitle="No calls, no confusion. Bas bhookh, aur hum."
      />
      <div className="how-it-works__grid">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          return (
            <article key={step.title} className="step-card">
              <span className="step-card__number">0{index + 1}</span>
              <span className="step-card__icon">
                <Icon size={22} />
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          )
        })}
      </div>

      <div className="partner-banner">
        <div>
          <span className="partner-banner__eyebrow">For restaurant owners</span>
          <h2>Aapka restaurant bhi Zomaeats par aa sakta hai.</h2>
          <p>Menu manage karo, images upload karo aur orders live track karo — sab ek dashboard se.</p>
        </div>
        <Link to="/admin" className="btn btn--light btn--lg">
          Open partner dashboard
        </Link>
      </div>
    </section>
  )
}
