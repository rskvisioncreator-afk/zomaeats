import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface SectionHeaderProps {
  eyebrow?: string
  title: ReactNode
  subtitle?: string
  action?: { label: string; to: string }
}

export function SectionHeader({ eyebrow, title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <span className="section-header__eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && (
        <Link to={action.to} className="section-header__action">
          {action.label} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}
