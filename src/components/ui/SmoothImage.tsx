import { useState } from 'react'
import { SmartImage } from '@/components/ui/SmartImage'
import { cn } from '@/lib/utils'

interface SmoothImageProps {
  src: string
  alt: string
  className?: string
  eager?: boolean
}

/**
 * Full-bleed decorative image that fades in once decoded.
 */
export function SmoothImage({ src, alt, className, eager = true }: SmoothImageProps) {
  const [loaded, setLoaded] = useState(false)
  return (
    <span className={cn('smooth-image', loaded && 'is-loaded', className)}>
      <SmartImage
        src={src}
        alt={alt}
        eager={eager}
        className="smooth-image__img"
        onLoad={() => setLoaded(true)}
      />
      {!loaded && <span className="smooth-image__shimmer" aria-hidden="true" />}
    </span>
  )
}
