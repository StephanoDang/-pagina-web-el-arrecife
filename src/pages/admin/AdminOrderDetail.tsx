import AdminButton from './components/AdminButton'
import AdminModal from './components/AdminModal'
import { calculateAdminOrderItemSubtotal, formatAdminOrderId, type AdminOrder } from './adminOrders'

const currencyFormat = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

export default function AdminOrderDetail({ order, onClose }: { order: AdminOrder | null; onClose: () => void }) {
  return (
    <AdminModal
      footer={<AdminButton onClick={onClose} variant="secondary">Cerrar</AdminButton>}
      onClose={onClose}
      open={order !== null}
      title={order ? `Detalle ${formatAdminOrderId(order.id)}` : 'Detalle del pedido'}
    >
      {order && (
        <div className="admin-order-detail">
          <dl className="admin-order-customer">
            <div><dt>Cliente</dt><dd>{order.customerName}</dd></div>
            <div><dt>Teléfono</dt><dd>{order.customerPhone || 'No registrado'}</dd></div>
            <div><dt>Forma de entrega</dt><dd>{order.deliveryMethod === 'delivery' ? 'Delivery' : 'Recojo en tienda'}</dd></div>
            {order.deliveryMethod === 'delivery' && <div><dt>Dirección</dt><dd>{order.deliveryAddress || 'No registrada'}</dd></div>}
          </dl>

          <div className="admin-order-items-scroll" role="region" aria-label="Productos del pedido" tabIndex={0}>
            <table className="admin-order-items">
              <caption>Productos del pedido</caption>
              <thead><tr><th scope="col">Producto</th><th scope="col">Cantidad</th><th scope="col">P. unitario</th><th scope="col">Subtotal</th></tr></thead>
              <tbody>
                {(order.items ?? []).length === 0 ? (
                  <tr><td colSpan={4}>No hay productos registrados en el detalle.</td></tr>
                ) : order.items?.map((item) => {
                  const subtotal = calculateAdminOrderItemSubtotal(item)
                  return (
                    <tr key={item.id}>
                      <td>{item.name}<small>{item.presentation}</small></td>
                      <td>{item.quantity}</td>
                      <td>{currencyFormat.format(item.unitPriceInCents / 100)}</td>
                      <td>{subtotal === null ? 'Importe inválido' : currencyFormat.format(subtotal / 100)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="admin-order-total"><span>Total del pedido</span><strong>{currencyFormat.format(order.totalInCents / 100)}</strong></p>
        </div>
      )}
    </AdminModal>
  )
}
