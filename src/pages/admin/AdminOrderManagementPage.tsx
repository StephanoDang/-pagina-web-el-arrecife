import { useMemo, useState } from 'react'
import AdminButton from './components/AdminButton'
import AdminTable, { type AdminTableColumn } from './components/AdminTable'
import { adminOrderStatuses, adminOrderStatusLabels, formatAdminOrderId, groupAdminOrdersByStatus, sortAdminOrders, transitionAdminOrderStatus, type AdminOrder, type AdminOrderStatus } from './adminOrders'
import './AdminOrderManagementPage.css'

const receivedOrders: AdminOrder[] = []
const currencyFormat = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })
const dateFormat = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Lima',
})

export default function AdminOrderManagementPage({ initialOrders = receivedOrders }: { initialOrders?: AdminOrder[] } = {}) {
  const [view, setView] = useState<'table' | 'board'>('board')
  const [orders, setOrders] = useState(() => sortAdminOrders(initialOrders))
  const ordersByStatus = useMemo(() => groupAdminOrdersByStatus(orders), [orders])
  const columns = useMemo<AdminTableColumn<AdminOrder>[]>(() => [
    { key: 'id', header: 'Código', render: (order) => <strong>{formatAdminOrderId(order.id)}</strong> },
    { key: 'receivedAt', header: 'Recibido', render: (order) => dateFormat.format(new Date(order.receivedAt)) },
    { key: 'customer', header: 'Cliente', render: (order) => order.customerName },
    { key: 'delivery', header: 'Entrega', render: (order) => order.deliveryMethod === 'delivery' ? 'Delivery' : 'Recojo en tienda' },
    { key: 'total', header: 'Total', render: (order) => currencyFormat.format(order.totalInCents / 100) },
  ], [])

  function advanceOrder(order: AdminOrder) {
    const currentIndex = adminOrderStatuses.indexOf(order.status)
    const nextStatus = adminOrderStatuses[currentIndex + 1] as AdminOrderStatus | undefined
    if (!nextStatus) return
    setOrders((current) => transitionAdminOrderStatus(current, order.id, nextStatus))
  }

  return (
    <section className="admin-orders-page" aria-labelledby="admin-orders-title">
      <header className="admin-orders-heading">
        <div>
          <p className="admin-eyebrow">VENTAS · PEDIDOS</p>
          <h2 id="admin-orders-title">Órdenes entrantes</h2>
          <p>Consulta el código, la fecha de recepción, el cliente, la forma de entrega y el importe de cada orden.</p>
        </div>
        <p className="admin-orders-count" role="status">{orders.length} {orders.length === 1 ? 'orden recibida' : 'órdenes recibidas'}</p>
      </header>

      <p className="admin-orders-notice">Los resúmenes creados en la página pública todavía son borradores y no aparecen como órdenes recibidas. Los cambios de estado son temporales en esta demostración.</p>

      <div className="admin-orders-view-switch" role="group" aria-label="Vista de pedidos">
        <AdminButton aria-pressed={view === 'table'} onClick={() => setView('table')} variant={view === 'table' ? 'primary' : 'secondary'}>Tabla</AdminButton>
        <AdminButton aria-pressed={view === 'board'} onClick={() => setView('board')} variant={view === 'board' ? 'primary' : 'secondary'}>Tablero</AdminButton>
      </div>

      <div hidden={view !== 'table'}>
        <AdminTable
          caption="Pedidos recibidos"
          columns={columns}
          emptyMessage="Aún no hay órdenes recibidas. Cuando se conecte la recepción de pedidos, aparecerán aquí."
          getRowKey={(order) => order.id}
          rows={orders}
        />
      </div>
      <div className="admin-orders-board" hidden={view !== 'board'} aria-label="Pedidos por estado">
        {adminOrderStatuses.map((status) => {
          const laneOrders = ordersByStatus[status]
          return (
            <section className="admin-orders-lane" key={status} aria-labelledby={`admin-orders-${status}`}>
              <header className="admin-orders-lane-heading">
                <h3 id={`admin-orders-${status}`}>{adminOrderStatusLabels[status]}</h3>
                <span aria-label={`${laneOrders.length} pedidos`}>{laneOrders.length}</span>
              </header>
              {laneOrders.length === 0 ? (
                <p className="admin-orders-lane-empty">No hay pedidos en este estado.</p>
              ) : (
                <ul className="admin-orders-lane-list">
                  {laneOrders.map((order) => (
                    <li className="admin-orders-card" key={order.id}>
                      <strong>{formatAdminOrderId(order.id)}</strong>
                      <span>{order.customerName}</span>
                      <small>{dateFormat.format(new Date(order.receivedAt))} · {currencyFormat.format(order.totalInCents / 100)}</small>
                      {order.status !== 'delivered' && (
                        <AdminButton
                          aria-label={`${order.status === 'pending' ? 'Iniciar preparación' : 'Marcar entregado'} ${formatAdminOrderId(order.id)}`}
                          onClick={() => advanceOrder(order)}
                          variant="secondary"
                        >
                          {order.status === 'pending' ? 'Iniciar preparación' : 'Marcar entregado'}
                        </AdminButton>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </section>
  )
}
