import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { CITIES } from '@/data/catalog'
import { useLocation } from '@/context/LocationContext'
import { cn, uid } from '@/lib/utils'
import type { Address } from '@/types'

interface AddressFormProps {
  open: boolean
  initial?: Address | null
  onClose: () => void
  onSave: (address: Address) => void
}

type Errors = Partial<Record<keyof Address, string>>

const LABELS: Address['label'][] = ['Home', 'Work', 'Other']

export function AddressForm({ open, initial, onClose, onSave }: AddressFormProps) {
  const { location } = useLocation()
  const [form, setForm] = useState<Address>(
    initial ?? {
      id: uid('addr'),
      label: 'Home',
      name: '',
      phone: '',
      line1: '',
      line2: '',
      city: location.city,
      pincode: '',
    },
  )
  const [errors, setErrors] = useState<Errors>({})

  const update = (key: keyof Address, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const validate = (): boolean => {
    const next: Errors = {}
    if (!form.name.trim()) next.name = 'Naam zaroori hai'
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) next.phone = '10 digit ka valid mobile number daalo'
    if (!form.line1.trim()) next.line1 = 'House / flat / street likho'
    if (!form.city.trim()) next.city = 'City select karo'
    if (!/^\d{6}$/.test(form.pincode.trim())) next.pincode = '6 digit pincode daalo'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    onSave({
      ...form,
      id: initial?.id ?? uid('addr'),
      name: form.name.trim(),
      phone: form.phone.trim(),
      line1: form.line1.trim(),
      line2: form.line2?.trim(),
      pincode: form.pincode.trim(),
    })
  }

  const cityOptions =
    CITIES.find((entry) => entry.city === form.city)?.areas.map((area) => ({
      value: area,
      label: area,
    })) ?? []

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit address' : 'Add delivery address'} size="md">
      <form className="address-form" onSubmit={submit}>
        <div className="address-form__labels">
          {LABELS.map((label) => (
            <button
              key={label}
              type="button"
              className={cn('filter-chip', form.label === label && 'is-active')}
              onClick={() => update('label', label)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="form-grid">
          <Input
            label="Full name"
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="Aarav Sharma"
            error={errors.name}
            autoComplete="name"
          />
          <Input
            label="Phone number"
            value={form.phone}
            onChange={(event) => update('phone', event.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="98765 43210"
            error={errors.phone}
            inputMode="numeric"
            autoComplete="tel"
          />
        </div>

        <Input
          label="Flat / House / Building / Street"
          value={form.line1}
          onChange={(event) => update('line1', event.target.value)}
          placeholder="B-42, Green Park Extension"
          error={errors.line1}
          autoComplete="address-line1"
        />
        <Input
          label="Area / Landmark (optional)"
          value={form.line2 ?? ''}
          onChange={(event) => update('line2', event.target.value)}
          placeholder="Near Mother Dairy"
          autoComplete="address-line2"
        />

        <div className="form-grid">
          <Input
            label="City"
            value={form.city}
            onChange={(event) => update('city', event.target.value)}
            error={errors.city}
            autoComplete="address-level2"
            list="city-suggestions"
            placeholder="Delhi NCR / Bihar"
          />
          <datalist id="city-suggestions">
            {CITIES.map((entry) => (
              <option key={entry.city} value={entry.city} />
            ))}
          </datalist>
          <Input
            label="Pincode"
            value={form.pincode}
            onChange={(event) => update('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="110016"
            error={errors.pincode}
            inputMode="numeric"
            autoComplete="postal-code"
          />
        </div>

        {cityOptions.length > 0 && (
          <Select
            label="Popular areas"
            value=""
            onChange={(event) => event.target.value && update('line2', event.target.value)}
            options={[{ value: '', label: 'Select an area (optional)' }, ...cityOptions]}
            hint="Ye sirf suggestion hai — aap apna exact address upar likh sakte ho."
          />
        )}

        <div className="modal-actions">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save address</Button>
        </div>
      </form>
    </Modal>
  )
}
