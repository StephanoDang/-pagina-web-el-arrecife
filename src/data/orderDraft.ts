import type { CartItem } from '../types/cart'
import { calculateCartTotals } from './cartTotals.ts'
import { menuDishes } from './menu.ts'

export interface CustomerDetails {
  deliveryMethod: 'delivery' | 'pickup'
  name: string
  phone: string
  address: string
}

export const ORDER_DRAFT_KEY = 'el-arrecife:order-draft:v1'

/** Instantánea local del pedido; no representa una orden enviada al restaurante. */
export function createOrderDraft(items: readonly CartItem[], customer: CustomerDetails) {
  if (items.length === 0) throw new Error('Añade productos al carrito antes de generar el resumen.')
  const totals = calculateCartTotals(items)
  if (totals.totalInCents === null) throw new Error('Revisa los productos y cantidades del carrito.')

  const lines = items.map((item, index) => {
    const dish = menuDishes.find((candidate) => candidate.id === item.dishId)
    const presentation = dish?.presentations.find((option) => option.id === item.presentationId)
    if (!dish?.available || !presentation) throw new Error('Hay productos no disponibles. Revisa el carrito.')
    return {
      ...item,
      name: dish.name,
      presentation: presentation.name,
      unitPriceInCents: presentation.priceInCents,
      subtotalInCents: totals.subtotalsInCents[index]!,
    }
  })

  return {
    version: 1 as const,
    status: 'draft' as const,
    savedAt: new Date().toISOString(),
    currency: 'PEN' as const,
    customer: {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      deliveryMethod: customer.deliveryMethod,
      ...(customer.deliveryMethod === 'delivery' ? { address: customer.address.trim() } : {}),
    },
    items: lines,
    productsTotalInCents: totals.totalInCents,
    igvIncluded: true,
    deliveryCostInCents: null,
  }
}

export type OrderDraft = ReturnType<typeof createOrderDraft>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Valida datos locales no confiables y contrasta precios y disponibilidad actuales. */
export function parseOrderDraft(raw: string): OrderDraft {
  const value: unknown = JSON.parse(raw)
  const invalid = () => new Error('El borrador guardado no es válido o su carta ha cambiado. Genera un nuevo resumen.')
  if (!isRecord(value) || value.version !== 1 || value.status !== 'draft'
    || value.currency !== 'PEN' || value.igvIncluded !== true || value.deliveryCostInCents !== null
    || typeof value.savedAt !== 'string' || !Number.isFinite(Date.parse(value.savedAt))
    || !isRecord(value.customer) || !Array.isArray(value.items) || value.items.length === 0) throw invalid()
  const customer = value.customer
  if (typeof customer.name !== 'string' || !customer.name.trim() || customer.name.trim().length > 100
    || typeof customer.phone !== 'string' || customer.phone.length > 40
    || !/^\+?\d{7,15}$/.test(customer.phone.replace(/[\s().-]/g, ''))
    || (customer.deliveryMethod !== 'delivery' && customer.deliveryMethod !== 'pickup')
    || (customer.deliveryMethod === 'delivery' && (typeof customer.address !== 'string'
      || customer.address.trim().length < 5 || customer.address.trim().length > 200))) throw invalid()

  const savedItems = value.items
  const ids = new Set<string>()
  const items = savedItems.map((item: unknown) => {
    if (!isRecord(item) || typeof item.dishId !== 'string' || typeof item.presentationId !== 'string'
      || typeof item.quantity !== 'number' || !Number.isSafeInteger(item.quantity) || item.quantity < 1) throw invalid()
    const key = JSON.stringify([item.dishId, item.presentationId])
    if (ids.has(key)) throw invalid()
    ids.add(key)
    return { dishId: item.dishId, presentationId: item.presentationId, quantity: item.quantity }
  })
  const draft = createOrderDraft(items, {
    name: customer.name, phone: customer.phone, deliveryMethod: customer.deliveryMethod,
    address: customer.deliveryMethod === 'delivery' ? customer.address as string : '',
  })
  if (value.productsTotalInCents !== draft.productsTotalInCents
    || !draft.items.every((item, index) => {
      const saved = savedItems[index]
      return saved.name === item.name && saved.presentation === item.presentation
        && saved.unitPriceInCents === item.unitPriceInCents && saved.subtotalInCents === item.subtotalInCents
    })) throw invalid()
  return { ...draft, savedAt: value.savedAt }
}

export function loadOrderDraft(read: () => string | null = () =>
  typeof window === 'undefined' ? null : window.localStorage.getItem(ORDER_DRAFT_KEY),
): { draft: OrderDraft | null; error: string } {
  let raw: string | null
  try {
    raw = read()
  } catch {
    return { draft: null, error: 'No se pudo leer el borrador en este navegador. Puedes completar una nueva orden.' }
  }
  if (raw === null) return { draft: null, error: '' }
  try {
    return { draft: parseOrderDraft(raw), error: '' }
  } catch {
    return { draft: null, error: 'No se recuperó el borrador: contiene datos inválidos o la carta ha cambiado. Genera un nuevo resumen.' }
  }
}
