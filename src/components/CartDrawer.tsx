import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { menuDishes } from '../data/menu'
import { calculateCartTotals, cartTaxPolicy } from '../data/cartTotals'
import { useCart } from '../hooks/useCart'
import MenuIcon from './MenuIcon'
import './CartDrawer.css'

const priceFormat = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { items } = useCart()
  const { subtotalsInCents, baseInCents, igvInCents, totalInCents } = calculateCartTotals(items)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (!open) {
      if (dialog.open) dialog.close()
      return
    }

    if (!dialog.open) dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  return (
    <dialog ref={dialogRef} id="cart-drawer" className="cart-drawer"
      aria-labelledby="cart-title" onClose={onClose}
      onKeyDown={(event) => {
        if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )).filter((element) => element.getClientRects().length > 0 && element.tabIndex >= 0)
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (!first || !last) return
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const bounds = event.currentTarget.getBoundingClientRect()
        if (event.clientX < bounds.left || event.clientX > bounds.right
          || event.clientY < bounds.top || event.clientY > bounds.bottom) {
          event.currentTarget.close()
        }
      }}>
      <div className="cart-drawer-content">
        <header className="cart-drawer-header">
          <div>
            <p className="cart-eyebrow">El Arrecife de Mamafé</p>
            <h2 id="cart-title">Tu carrito</h2>
          </div>
          <button type="button" className="cart-close" aria-label="Cerrar carrito"
            onClick={() => dialogRef.current?.close()}>
            <MenuIcon name="close" />
          </button>
        </header>
        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty-symbol"><MenuIcon name="bag" /></span>
              <h3>Tu carrito está vacío</h3>
              <p>Explora la carta y encuentra tu próximo favorito.</p>
            </div>
          ) : (
            <ul className="cart-items">
              {items.map((item, index) => {
                const dish = menuDishes.find((candidate) => candidate.id === item.dishId)
                const presentation = dish?.presentations.find((option) => option.id === item.presentationId)
                return (
                  <li className="cart-item" key={JSON.stringify([item.dishId, item.presentationId])}>
                    <div className="cart-item-details">
                      <h3>{dish?.name ?? 'Producto no disponible'}</h3>
                      <p>{presentation?.name ?? 'Presentación no disponible'}</p>
                      {presentation && <p className="cart-unit-price">{priceFormat.format(presentation.priceInCents / 100)} por unidad</p>}
                      <p>Subtotal: {subtotalsInCents[index] === null ? 'No disponible' : priceFormat.format(subtotalsInCents[index] / 100)}</p>
                      {dish && !dish.available && <p className="cart-item-unavailable">No disponible por el momento</p>}
                    </div>
                    <span className="cart-quantity" aria-label={`Cantidad: ${item.quantity}`}>× {item.quantity}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        <footer className="cart-drawer-footer">
          {baseInCents !== null && <p>Subtotal sin IGV: {priceFormat.format(baseInCents / 100)}</p>}
          <p>IGV: {igvInCents === null
            ? cartTaxPolicy.mode === 'included' ? 'Incluido en los precios' : 'Pendiente de confirmar'
            : priceFormat.format(igvInCents / 100)}</p>
          <p aria-live="polite">Total: {totalInCents === null ? 'No disponible' : priceFormat.format(totalInCents / 100)}</p>
          <Link className="site-primary-link" to="/carta" onClick={() => dialogRef.current?.close()}>
            {items.length === 0 ? 'Explorar la carta' : 'Seguir viendo la carta'}<MenuIcon name="arrow" />
          </Link>
        </footer>
      </div>
    </dialog>
  )
}
