import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { COLLECTIONS } from '@/data/catalog'

export function CollectionGrid() {
  return (
    <section className="container collections">
      <SectionHeader
        eyebrow="Handpicked"
        title="Collections made for you"
        subtitle="Curated lists from the Zomaeats kitchen — no scrolling needed."
        action={{ label: 'Explore all', to: '/search' }}
      />
      <div className="collections__grid">
        {COLLECTIONS.map((collection) => (
          <Link
            key={collection.key}
            to={`/search?collection=${collection.key}`}
            className="collection-card"
          >
            <SmartImage src={collection.image} alt={collection.title} className="collection-card__image" />
            <span className="collection-card__overlay" />
            <span className="collection-card__arrow">
              <ArrowUpRight size={18} />
            </span>
            <span className="collection-card__text">
              <strong>{collection.title}</strong>
              <small>{collection.subtitle}</small>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
