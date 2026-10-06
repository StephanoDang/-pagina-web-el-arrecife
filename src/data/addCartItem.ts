import type { CartItem } from '../types/cart'
import type { Dish, DishPresentation } from '../types/menu'
import { menuDishes } from './menu.ts'

/** Agrega una unidad; el plato y su presentación identifican cada línea. */
export function addCartItem(
  items: readonly CartItem[],
  dishId: Dish['id'],
  presentationId: DishPresentation['id'],
): readonly CartItem[] {
  const dish = menuDishes.find((candidate) => candidate.id === dishId)

  if (!dish?.available || !dish.presentations.some((option) => option.id === presentationId)) {
    return items
  }

  const existing = items.find((item) =>
    item.dishId === dishId && item.presentationId === presentationId)

  if (existing) {
    return items.map((item) => item === existing
      ? { ...item, quantity: item.quantity + 1 }
      : item)
  }

  return [...items, { dishId, presentationId, quantity: 1 }]
}
