import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select, Switch } from '@/components/ui/Field'
import { ImageUploader } from './ImageUploader'
import { dataProvider } from '@/services'
import { useToast } from '@/context/ToastContext'
import { CITIES } from '@/data/catalog'
import { friendlyError } from '@/lib/utils'
import type { CollectionKey, Restaurant } from '@/types'

interface RestaurantFormProps {
  open: boolean
  initial?: Restaurant | null
  onClose: () => void
  onSaved: () => void
}

type FormState = {
  name: string
  cuisines: string
  area: string
  city: string
  address: string
  image: string
  coverImage: string
  offer: string
  rating: string
  ratingCount: string
  deliveryTimeMin: string
  distanceKm: string
  priceForTwo: string
  collection: string
  pureVeg: boolean
}

const EMPTY: FormState = {
  name: '',
  cuisines: '',
  area: '',
  city: 'Delhi NCR',
  address: '',
  image: '',
  coverImage: '',
  offer: '',
  rating: '4.2',
  ratingCount: '0',
  deliveryTimeMin: '30',
  distanceKm: '2.0',
  priceForTwo: '400',
  collection: '',
  pureVeg: false,
}

export function RestaurantForm({ open, initial, onClose, onSaved }: RestaurantFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    initial
      ? {
          name: initial.name,
          cuisines: initial.cuisines.join(', '),
          area: initial.area,
          city: initial.city,
          address: initial.address ?? '',
          image: initial.image,
          coverImage: initial.coverImage ?? '',
          offer: initial.offer ?? '',
          rating: String(initial.rating),
          ratingCount: String(initial.ratingCount),
          deliveryTimeMin: String(initial.deliveryTimeMin),
          distanceKm: String(initial.distanceKm),
          priceForTwo: String(initial.priceForTwo),
          collection: initial.collection ?? '',
          pureVeg: Boolean(initial.pureVeg),
        }
      : EMPTY,
  )
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const toast = useToast()

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'Restaurant ka naam daalo'
    if (!form.cuisines.trim()) next.cuisines = 'Kam se kam ek cuisine daalo'
    if (!form.area.trim()) next.area = 'Area daalo'
    if (!form.image) next.image = 'Cover image upload karo'
    if (!form.priceForTwo || Number(form.priceForTwo) <= 0) next.priceForTwo = 'Valid cost daalo'
    if (Number(form.rating) < 0 || Number(form.rating) > 5) next.rating = 'Rating 0–5 ke beech ho'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const payload: Restaurant = {
        id: initial?.id ?? '',
        name: form.name.trim(),
        cuisines: form.cuisines
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean),
        area: form.area.trim(),
        city: form.city,
        address: form.address.trim() || undefined,
        image: form.image,
        coverImage: form.coverImage || form.image,
        offer: form.offer.trim() || undefined,
        rating: Number(form.rating),
        ratingCount: Number(form.ratingCount) || 0,
        deliveryTimeMin: Number(form.deliveryTimeMin) || 30,
        distanceKm: Number(form.distanceKm) || 0,
        priceForTwo: Number(form.priceForTwo) || 0,
        collection: (form.collection || undefined) as CollectionKey | undefined,
        pureVeg: form.pureVeg || undefined,
        dishCount: initial?.dishCount,
        createdAt: initial?.createdAt,
      }
      await dataProvider.saveRestaurant(payload)
      toast.success(initial ? 'Restaurant updated' : 'Restaurant added')
      onSaved()
    } catch (error) {
      toast.error(friendlyError(error, 'Restaurant save nahi hua'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit restaurant' : 'Add a restaurant'}
      description="Menu images Firebase Storage me upload hongi (demo mode me locally)."
      size="lg"
    >
      <form className="admin-form" onSubmit={submit}>
        <div className="form-grid">
          <Input
            label="Restaurant name"
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="Biryani Blues"
            error={errors.name}
          />
          <Input
            label="Cuisines (comma separated)"
            value={form.cuisines}
            onChange={(event) => update('cuisines', event.target.value)}
            placeholder="Biryani, Mughlai, Kebabs"
            error={errors.cuisines}
          />
        </div>

        <div className="form-grid form-grid--3">
          <Input
            label="Area"
            value={form.area}
            onChange={(event) => update('area', event.target.value)}
            placeholder="Connaught Place"
            error={errors.area}
          />
          <Select
            label="City"
            value={form.city}
            onChange={(event) => update('city', event.target.value)}
            options={CITIES.map((entry) => ({ value: entry.city, label: entry.city }))}
          />
          <Input
            label="Offer (optional)"
            value={form.offer}
            onChange={(event) => update('offer', event.target.value)}
            placeholder="50% OFF up to ₹100"
          />
        </div>

        <Input
          label="Full address"
          value={form.address}
          onChange={(event) => update('address', event.target.value)}
          placeholder="H-12, Inner Circle, Connaught Place"
        />

        <div className="form-grid form-grid--4">
          <Input
            label="Rating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={form.rating}
            onChange={(event) => update('rating', event.target.value)}
            error={errors.rating}
          />
          <Input
            label="Rating count"
            type="number"
            value={form.ratingCount}
            onChange={(event) => update('ratingCount', event.target.value)}
          />
          <Input
            label="Delivery (min)"
            type="number"
            value={form.deliveryTimeMin}
            onChange={(event) => update('deliveryTimeMin', event.target.value)}
          />
          <Input
            label="Cost for two (₹)"
            type="number"
            value={form.priceForTwo}
            onChange={(event) => update('priceForTwo', event.target.value)}
            error={errors.priceForTwo}
          />
        </div>

        <div className="form-grid">
          <Input
            label="Distance (km)"
            type="number"
            step="0.1"
            value={form.distanceKm}
            onChange={(event) => update('distanceKm', event.target.value)}
          />
          <Select
            label="Collection tag"
            value={form.collection}
            onChange={(event) => update('collection', event.target.value)}
            options={[
              { value: '', label: 'None' },
              { value: 'bestseller', label: 'Bestseller' },
              { value: 'top-rated', label: 'Top rated' },
              { value: 'new', label: 'Newly opened' },
            ]}
          />
        </div>

        <ImageUploader
          value={form.image}
          onChange={(url) => update('image', url)}
          folder="restaurants"
          label="Cover image"
          hint="Wide image best rahegi (16:9)."
        />
        {errors.image && <p className="field__error">{errors.image}</p>}

        <Switch
          checked={form.pureVeg}
          onChange={(value) => update('pureVeg', value)}
          label="Pure vegetarian restaurant"
          description="Card par green Pure Veg badge dikhega."
        />

        <div className="modal-actions">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>
            {initial ? 'Save changes' : 'Add restaurant'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
