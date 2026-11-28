import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select, Switch, Textarea } from '@/components/ui/Field'
import { ImageUploader } from './ImageUploader'
import { dataProvider } from '@/services'
import { useToast } from '@/context/ToastContext'
import { friendlyError } from '@/lib/utils'
import type { Dish, Restaurant } from '@/types'

interface DishFormProps {
  open: boolean
  restaurants: Restaurant[]
  initial?: Dish | null
  defaultRestaurantId?: string
  onClose: () => void
  onSaved: () => void
}

const CATEGORIES = [
  'Recommended',
  'Starters',
  'Main Course',
  'Biryani',
  'Kebabs',
  'Pizza',
  'Pasta',
  'Burgers',
  'Momos',
  'Noodles',
  'Sushi',
  'Salads',
  'Bowls',
  'Breakfast',
  'Dosa',
  'Breads',
  'Rice',
  'Sides',
  'Desserts',
  'Cakes',
  'Beverages',
  'Coffee',
  'Sandwiches',
  'Soups',
  'Wraps',
]

export function DishForm({
  open,
  restaurants,
  initial,
  defaultRestaurantId,
  onClose,
  onSaved,
}: DishFormProps) {
  const [restaurantId, setRestaurantId] = useState(initial?.restaurantId ?? defaultRestaurantId ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [price, setPrice] = useState(initial ? String(initial.price) : '')
  const [category, setCategory] = useState(initial?.category ?? 'Recommended')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [image, setImage] = useState(initial?.image ?? '')
  const [isVeg, setIsVeg] = useState(initial?.isVeg ?? true)
  const [isBestseller, setIsBestseller] = useState(initial?.isBestseller ?? false)
  const [soldOut, setSoldOut] = useState(initial?.soldOut ?? false)
  const [serves, setServes] = useState(initial ? String(initial.serves ?? 2) : '2')
  const [rating, setRating] = useState(initial?.rating ? String(initial.rating) : '')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const toast = useToast()

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (!restaurantId) next.restaurantId = 'Restaurant select karo'
    if (!name.trim()) next.name = 'Dish ka naam daalo'
    if (!price || Number(price) <= 0) next.price = 'Valid price daalo'
    if (!image) next.image = 'Dish image upload karo'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSaving(true)
    try {
      const payload: Dish = {
        id: initial?.id ?? '',
        restaurantId,
        name: name.trim(),
        description: description.trim() || 'Freshly prepared in our kitchen with premium ingredients.',
        price: Number(price),
        image,
        category,
        isVeg,
        isBestseller,
        soldOut,
        serves: Number(serves) || 1,
        rating: rating ? Number(rating) : undefined,
      }
      await dataProvider.saveDish(payload)
      toast.success(initial ? 'Dish updated' : 'Dish added to the menu')
      onSaved()
    } catch (error) {
      toast.error(friendlyError(error, 'Dish save nahi hui'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit dish' : 'Add a dish'}
      description="Menu item ka price, category aur image set karo."
      size="lg"
    >
      <form className="admin-form" onSubmit={submit}>
        <Select
          label="Restaurant"
          value={restaurantId}
          onChange={(event) => setRestaurantId(event.target.value)}
          options={[
            { value: '', label: 'Select a restaurant' },
            ...restaurants.map((restaurant) => ({ value: restaurant.id, label: restaurant.name })),
          ]}
          error={errors.restaurantId}
        />

        <div className="form-grid">
          <Input
            label="Dish name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Hyderabadi Chicken Biryani"
            error={errors.name}
          />
          <Input
            label="Price (₹)"
            type="number"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="329"
            error={errors.price}
          />
        </div>

        <div className="form-grid form-grid--3">
          <Select
            label="Menu category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            options={CATEGORIES.map((entry) => ({ value: entry, label: entry }))}
          />
          <Input
            label="Serves"
            type="number"
            min="1"
            value={serves}
            onChange={(event) => setServes(event.target.value)}
          />
          <Input
            label="Rating (optional)"
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={rating}
            onChange={(event) => setRating(event.target.value)}
          />
        </div>

        <Textarea
          label="Description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Slow-cooked with aromatic spices, served hot."
        />

        <ImageUploader
          value={image}
          onChange={setImage}
          folder="dishes"
          label="Dish image"
          hint="Square image sabse accha dikhta hai."
        />
        {errors.image && <p className="field__error">{errors.image}</p>}

        <div className="admin-form__switches">
          <Switch
            checked={isVeg}
            onChange={setIsVeg}
            label="Vegetarian"
            description="Green veg mark dikhega."
          />
          <Switch
            checked={isBestseller}
            onChange={setIsBestseller}
            label="Mast Sold"
            description="Top-selling dish par 🔥 badge dikhega."
          />
          <Switch
            checked={soldOut}
            onChange={setSoldOut}
            label="Sold out"
            description="Customer ADD button disable ho jayega."
          />
        </div>

        <div className="modal-actions">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>
            {initial ? 'Save changes' : 'Add dish'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
