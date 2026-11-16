export const adminOrderStatuses = ['pending', 'preparing', 'delivered'] as const
export type AdminOrderStatus = typeof adminOrderStatuses[number]

export const adminOrderStatusLabels: Record<AdminOrderStatus, string> = {
  pending: 'Pendiente',
  preparing: 'En preparación',
  delivered: 'Entregado',
}

export interface AdminOrder {
  id: string
  receivedAt: string
  customerName: string
  deliveryMethod: 'delivery' | 'pickup'
  totalInCents: number
  status: AdminOrderStatus
  customerPhone?: string
  deliveryAddress?: string
  items?: AdminOrderItem[]
}

export interface AdminOrderItem {
  id: string
  name: string
  presentation: string
  quantity: number
  unitPriceInCents: number
}

/** Newest received orders first; IDs provide deterministic ordering for matching timestamps. */
export function sortAdminOrders(orders: readonly AdminOrder[]): AdminOrder[] {
  return [...orders].sort((left, right) => {
    const dateDifference = Date.parse(right.receivedAt) - Date.parse(left.receivedAt)
    if (Number.isFinite(dateDifference) && dateDifference !== 0) return dateDifference
    return left.id.localeCompare(right.id, 'en')
  })
}

export function formatAdminOrderId(id: string): string {
  return id.startsWith('PED-') ? id : `PED-${id}`
}

export function groupAdminOrdersByStatus(orders: readonly AdminOrder[]): Record<AdminOrderStatus, AdminOrder[]> {
  return {
    pending: orders.filter((order) => order.status === 'pending'),
    preparing: orders.filter((order) => order.status === 'preparing'),
    delivered: orders.filter((order) => order.status === 'delivered'),
  }
}

/** Advances an order by exactly one step; invalid, duplicate, backward, or skipped transitions are no-ops. */
export function transitionAdminOrderStatus(
  orders: AdminOrder[], orderId: string, nextStatus: AdminOrderStatus,
): AdminOrder[] {
  const currentOrder = orders.find((order) => order.id === orderId)
  if (!currentOrder) return orders
  const currentIndex = adminOrderStatuses.indexOf(currentOrder.status)
  const nextIndex = adminOrderStatuses.indexOf(nextStatus)
  if (nextIndex !== currentIndex + 1) return orders
  return orders.map((order) => order.id === orderId ? { ...order, status: nextStatus } : order)
}

export function calculateAdminOrderItemSubtotal(item: AdminOrderItem): number | null {
  if (!Number.isSafeInteger(item.quantity) || item.quantity < 1
    || !Number.isSafeInteger(item.unitPriceInCents) || item.unitPriceInCents < 0) return null
  const subtotal = item.quantity * item.unitPriceInCents
  return Number.isSafeInteger(subtotal) ? subtotal : null
}

export interface AdminOrderFilters {
  fromDate: string
  toDate: string
  status: AdminOrderStatus | 'all'
}

function getLimaCalendarDate(isoDate: string): string | null {
  const date = new Date(isoDate)
  if (!Number.isFinite(date.getTime())) return null
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

export function filterAdminOrders(orders: readonly AdminOrder[], filters: AdminOrderFilters): AdminOrder[] {
  return orders.filter((order) => {
    if (filters.status !== 'all' && order.status !== filters.status) return false
    if (!filters.fromDate && !filters.toDate) return true
    const receivedDate = getLimaCalendarDate(order.receivedAt)
    if (!receivedDate) return false
    return (!filters.fromDate || receivedDate >= filters.fromDate)
      && (!filters.toDate || receivedDate <= filters.toDate)
  })
}
