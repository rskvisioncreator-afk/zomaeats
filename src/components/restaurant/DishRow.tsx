import { Plus, Star } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { VegMark } from '@/components/ui/Feedback'
import { useCart } from '@/context/CartContext'
import { formatINR } from '@/lib/utils'
import type { Dish, Restaurant } from '@/types'

interface DishRowProps {
  dish: Dish
  restaurant: Restaurant
}

export function DishRow({ dish, restaurant }: DishRowProps) {
  const { cart, addItem, setQty } = useCart()
  const item = cart.items.find((entry) => entry.dishId === dish.id)

  return (
    <article className="dish-row">
      <div className="dish-row__content">
        <div className="dish-row__badges">
          <VegMark isVeg={dish.isVeg} size="sm" />
          {dish.isBestseller && <span className="bestseller-chip">🔥 Mast Sold</span>}
          {dish.soldOut && <span className="soldout-chip">SOLD OUT</span>}
        </div>
        <h4>{dish.name}</h4>
        <p className="dish-row__price">{formatINR(dish.price)}</p>
        {dish.rating && (
          <span className="dish-row__rating">
            <Star size={11} fill="currentColor" strokeWidth={0} /> {dish.rating}
          </span>
        )}
        <p className="dish-row__desc">{dish.description}</p>
        {dish.serves ? <span className="dish-row__serves">Serves {dish.serves}</span> : null}
      </div>

      <div className="dish-row__media">
        <SmartImage src={dish.image} alt={dish.name} className="dish-row__image" />
        {dish.soldOut ? (
          <button type="button" className="dish-add dish-add--disabled" disabled>
            SOLD OUT
          </button>
        ) : item ? (
          <div className="dish-row__stepper">
            <QuantityStepper
              value={item.qty}
              onDecrease={() => setQty(dish.id, item.qty - 1)}
              onIncrease={() => setQty(dish.id, item.qty + 1)}
              size="sm"
            />
          </div>
        ) : (
          <button type="button" className="dish-add" onClick={() => addItem(dish, restaurant)}>
            ADD <Plus size={13} />
          </button>
        )}
      </div>
    </article>
  )
}
