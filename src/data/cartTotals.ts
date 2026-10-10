import type { CartItem } from '../types/cart'
import { menuDishes } from './menu.ts'

/** Calcula en céntimos con los precios publicados, sin aplicar impuestos adicionales. */
export function calculateCartTotals(items: readonly CartItem[]) {
  const subtotalsInCents = items.map((item) => {
    const dish = menuDishes.find((candidate) => candidate.id === item.dishId)
    const presentation = dish?.presentations.find((option) => option.id === item.presentationId)
    if (!presentation || !Number.isSafeInteger(item.quantity) || item.quantity < 1) return null
    const subtotal = presentation.priceInCents * item.quantity
    return Number.isSafeInteger(subtotal) ? subtotal : null
  })
  const sum = subtotalsInCents.reduce<number>((total, subtotal) => total + (subtotal ?? 0), 0)
  const totalInCents = subtotalsInCents.includes(null) || !Number.isSafeInteger(sum) ? null : sum
  return { subtotalsInCents, totalInCents }
}
