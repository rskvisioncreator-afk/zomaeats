import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useLocation } from '@/context/LocationContext'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

interface LocationModalProps {
  open: boolean
  onClose: () => void
}

export function LocationModal({ open, onClose }: LocationModalProps) {
  const { location, setLocation, cities } = useLocation()
  const [city, setCity] = useState(location.city)
  const [area, setArea] = useState(location.area)
  const toast = useToast()

  const cityData = cities.find((entry) => entry.city === city) ?? cities[0]

  const handleSave = () => {
    setLocation({ city, area })
    toast.success(`Delivering to ${area}, ${city}`)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Choose delivery location"
      description="Aapka khana kahan pahunchana hai? City aur area select karo."
      size="md"
      footer={
        <div className="location-modal__footer">
          <span className="muted">
            Delivering in <strong>{cityData.eta}</strong> near {area}
          </span>
          <Button onClick={handleSave}>Confirm location</Button>
        </div>
      }
    >
      <div className="city-tabs" role="tablist" aria-label="Select city">
        {cities.map((entry) => (
          <button
            key={entry.city}
            type="button"
            role="tab"
            aria-selected={entry.city === city}
            className={cn('city-tab', entry.city === city && 'is-active')}
            onClick={() => {
              setCity(entry.city)
              setArea(entry.areas[0])
            }}
          >
            {entry.city}
          </button>
        ))}
      </div>

      <div className="area-grid">
        {cityData.areas.map((entry) => (
          <button
            key={entry}
            type="button"
            className={cn('area-option', entry === area && 'is-active')}
            onClick={() => setArea(entry)}
          >
            <MapPin size={16} />
            <span>{entry}</span>
          </button>
        ))}
      </div>
    </Modal>
  )
}
