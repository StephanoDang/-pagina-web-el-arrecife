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
