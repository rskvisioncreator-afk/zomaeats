import { cn } from '@/lib/utils'

interface MenuNavProps {
  categories: string[]
  active: string
  onSelect: (category: string) => void
  itemCount: number
}

export function MenuNav({ categories, active, onSelect, itemCount }: MenuNavProps) {
  return (
    <nav className="menu-nav" aria-label="Menu categories">
      <span className="menu-nav__label">{itemCount} items</span>
      <div className="menu-nav__scroll">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={cn('menu-nav__chip', active === category && 'is-active')}
            onClick={() => onSelect(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </nav>
  )
}
