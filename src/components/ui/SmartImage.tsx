import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SmartImageProps {
  src?: string
  alt: string
  className?: string
  eager?: boolean
  onLoad?: () => void
}

/**
 * Image with a graceful fallback so a broken/missing upload never breaks the layout.
 */
export function SmartImage({ src, alt, className, eager = false, onLoad }: SmartImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className={cn('smart-image-fallback', className)} role="img" aria-label={alt}>
        <ImageOff size={26} />
        <span>Zomaeats</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={onLoad}
      onError={() => setFailed(true)}
    />
  )
}
