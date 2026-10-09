import type { CartItem } from '../types/cart'
import type { Dish, DishPresentation } from '../types/menu'

/** Modifica una línea existente; una cantidad inválida conserva el estado. */
export function updateCartItemQuantity(
  items: readonly CartItem[],
  dishId: Dish['id'],
  presentationId: DishPresentation['id'],
  quantity: number,
): readonly CartItem[] {
  if (!Number.isSafeInteger(quantity) || quantity < 1) return items

  const existing = items.find((item) =>
    item.dishId === dishId && item.presentationId === presentationId)
  if (!existing || existing.quantity === quantity) return items

  return items.map((item) => item === existing ? { ...item, quantity } : item)
}

/** Elimina únicamente la combinación de plato y presentación indicada. */
export function removeCartItem(
  items: readonly CartItem[],
  dishId: Dish['id'],
  presentationId: DishPresentation['id'],
): readonly CartItem[] {
  const remaining = items.filter((item) =>
    item.dishId !== dishId || item.presentationId !== presentationId)
  return remaining.length === items.length ? items : remaining
}
