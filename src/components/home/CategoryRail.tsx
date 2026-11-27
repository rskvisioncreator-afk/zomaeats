import { Link } from 'react-router-dom'
import { SmartImage } from '@/components/ui/SmartImage'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CUISINE_CATEGORIES } from '@/data/catalog'

export function CategoryRail() {
  return (
    <section className="container category-rail">
      <SectionHeader
        eyebrow="Craving something?"
        title="What's on your mind?"
        subtitle="Browse by cuisine and find your next favourite dish."
      />
      <div className="category-rail__scroll">
        {CUISINE_CATEGORIES.map((category) => (
          <Link
            key={category.name}
            to={`/search?cuisine=${encodeURIComponent(category.name)}`}
            className="category-item"
          >
            <span className="category-item__image">
              <SmartImage src={category.image} alt={category.name} />
            </span>
            <span className="category-item__name">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
