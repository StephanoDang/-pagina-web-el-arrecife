import type { CartItem } from '../types/cart'
import { menuDishes } from './menu.ts'

export type CartTaxPolicy =
  | { mode: 'pending' }
  | { mode: 'included'; rateBasisPoints: null }
  | { mode: 'included' | 'additional'; rateBasisPoints: number }

// Precios con IGV incluido confirmados por el usuario; tasa pendiente de confirmar.
export const cartTaxPolicy: CartTaxPolicy = { mode: 'included', rateBasisPoints: null }

export function calculateTax(amountInCents: number | null, policy: CartTaxPolicy) {
  if (policy.mode !== 'pending' && policy.rateBasisPoints !== null && (!Number.isSafeInteger(policy.rateBasisPoints) || policy.rateBasisPoints < 0)) {
    throw new RangeError('La tasa de IGV debe ser un entero no negativo en puntos básicos')
  }
  if (amountInCents === null || !Number.isSafeInteger(amountInCents) || amountInCents < 0) {
    return { baseInCents: null, igvInCents: null, totalInCents: null }
  }
  if (policy.mode === 'pending' || policy.rateBasisPoints === null) {
    return { baseInCents: null, igvInCents: null, totalInCents: amountInCents }
  }
  // BigInt mantiene exactos los cálculos y el redondeo a céntimos.
  const amount = BigInt(amountInCents)
  const rate = BigInt(policy.rateBasisPoints)
  const divisor = policy.mode === 'included' ? 10000n + rate : 10000n
  const numerator = policy.mode === 'included' ? amount * 10000n : amount * rate
  const rounded = (numerator + divisor / 2n) / divisor
  const base = policy.mode === 'included' ? rounded : amount
  const igv = policy.mode === 'included' ? amount - base : rounded
  const total = base + igv
  if (total > BigInt(Number.MAX_SAFE_INTEGER)) {
    return { baseInCents: null, igvInCents: null, totalInCents: null }
  }
  return { baseInCents: Number(base), igvInCents: Number(igv), totalInCents: Number(total) }
}

/** Calcula en céntimos; el IGV incluido se desglosa sin volver a sumarlo. */
export function calculateCartTotals(items: readonly CartItem[], policy: CartTaxPolicy = cartTaxPolicy) {
  const subtotalsInCents = items.map((item) => {
    const dish = menuDishes.find((candidate) => candidate.id === item.dishId)
    const presentation = dish?.presentations.find((option) => option.id === item.presentationId)
    if (!presentation || !Number.isSafeInteger(item.quantity) || item.quantity < 1) return null
    const subtotal = presentation.priceInCents * item.quantity
    return Number.isSafeInteger(subtotal) ? subtotal : null
  })
  const sum = subtotalsInCents.reduce<number>((total, subtotal) => total + (subtotal ?? 0), 0)
  const totalInCents = subtotalsInCents.includes(null) || !Number.isSafeInteger(sum) ? null : sum
  return { subtotalsInCents, ...calculateTax(totalInCents, policy) }
}
