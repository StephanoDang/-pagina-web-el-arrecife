import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateAdminOrderItemSubtotal, filterAdminOrders, formatAdminOrderId, groupAdminOrdersByStatus, sortAdminOrders, transitionAdminOrderStatus } from '../src/pages/admin/adminOrders.ts'

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

test('filtra el historial por fechas inclusivas en hora de Lima y combina el estado', () => {
  const history = [
    { ...orders[0], id: 'PED-201', receivedAt: '2026-11-10T04:30:00.000Z', status: 'pending' },
    { ...orders[1], id: 'PED-202', receivedAt: '2026-11-10T05:00:00.000Z', status: 'preparing' },
    { ...orders[2], id: 'PED-203', receivedAt: '2026-11-11T04:59:59.000Z', status: 'preparing' },
    { ...orders[2], id: 'PED-204', receivedAt: '2026-11-11T05:00:00.000Z', status: 'delivered' },
  ]
  const filtered = filterAdminOrders(history, { fromDate: '2026-11-10', toDate: '2026-11-10', status: 'preparing' })
  assert.deepEqual(filtered.map((order) => order.id), ['PED-202', 'PED-203'])
  assert.deepEqual(filterAdminOrders(history, { fromDate: '2026-11-11', toDate: '2026-11-10', status: 'all' }), [])
  assert.deepEqual(filterAdminOrders(history, { fromDate: '', toDate: '', status: 'delivered' }).map((order) => order.id), ['PED-204'])
})

test('calcula subtotales de líneas y rechaza cantidades o importes inválidos', () => {
  const line = { id: 'line-1', name: 'Jalea', presentation: 'Familiar', quantity: 2, unitPriceInCents: 4800 }
  assert.equal(calculateAdminOrderItemSubtotal(line), 9600)
  assert.equal(calculateAdminOrderItemSubtotal({ ...line, quantity: 0 }), null)
  assert.equal(calculateAdminOrderItemSubtotal({ ...line, unitPriceInCents: -1 }), null)
  assert.equal(calculateAdminOrderItemSubtotal({ ...line, quantity: Number.MAX_SAFE_INTEGER }), null)
})
