import assert from 'node:assert/strict'
import test from 'node:test'
import { formatAdminOrderId, groupAdminOrdersByStatus, sortAdminOrders, transitionAdminOrderStatus } from '../src/pages/admin/adminOrders.ts'

const orders = [
  { id: 'PED-102', receivedAt: '2026-11-10T16:30:00.000Z', customerName: 'Ana', deliveryMethod: 'pickup', totalInCents: 2500, status: 'pending' },
  { id: 'PED-101', receivedAt: '2026-11-10T18:30:00.000Z', customerName: 'Luis', deliveryMethod: 'delivery', totalInCents: 3500, status: 'preparing' },
  { id: 'PED-103', receivedAt: '2026-11-10T18:30:00.000Z', customerName: 'Sol', deliveryMethod: 'pickup', totalInCents: 4500, status: 'delivered' },
]

test('ordena las órdenes por fecha descendente y desempata por identificador', () => {
  assert.deepEqual(sortAdminOrders(orders).map((order) => order.id), ['PED-101', 'PED-103', 'PED-102'])
  assert.deepEqual(orders.map((order) => order.id), ['PED-102', 'PED-101', 'PED-103'])
})

test('conserva y normaliza el identificador visible de cada orden', () => {
  assert.equal(formatAdminOrderId('PED-101'), 'PED-101')
  assert.equal(formatAdminOrderId('101'), 'PED-101')
})

test('agrupa los pedidos en las tres columnas Kanban sin alterar la lista', () => {
  const grouped = groupAdminOrdersByStatus(orders)
  assert.deepEqual(grouped.pending.map((order) => order.id), ['PED-102'])
  assert.deepEqual(grouped.preparing.map((order) => order.id), ['PED-101'])
  assert.deepEqual(grouped.delivered.map((order) => order.id), ['PED-103'])
  assert.equal(orders.length, 3)
})

test('permite avanzar solo al siguiente estado y no aplica transiciones repetidas o fuera de orden', () => {
  const pending = [orders[0]]
  const preparing = transitionAdminOrderStatus(pending, 'PED-102', 'preparing')
  assert.equal(preparing[0].status, 'preparing')
  assert.notEqual(preparing, pending)

  const duplicate = transitionAdminOrderStatus(preparing, 'PED-102', 'preparing')
  const skipped = transitionAdminOrderStatus(pending, 'PED-102', 'delivered')
  const backward = transitionAdminOrderStatus([orders[2]], 'PED-103', 'pending')
  const unknown = transitionAdminOrderStatus(pending, 'missing', 'preparing')
  assert.equal(duplicate, preparing)
  assert.equal(skipped, pending)
  assert.equal(backward[0].status, 'delivered')
  assert.equal(unknown, pending)

  const delivered = transitionAdminOrderStatus(preparing, 'PED-102', 'delivered')
  assert.equal(delivered[0].status, 'delivered')
  assert.equal(transitionAdminOrderStatus(delivered, 'PED-102', 'delivered'), delivered)
})
