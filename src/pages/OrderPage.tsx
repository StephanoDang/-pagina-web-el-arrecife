import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router'
import { useCart } from '../hooks/useCart'
import { createOrderDraft, loadOrderDraft, ORDER_DRAFT_KEY } from '../data/orderDraft'
import type { CustomerDetails, OrderDraft } from '../data/orderDraft'
import type { CartItem } from '../types/cart'
import './OrderPage.css'

const priceFormat = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

export default function OrderPage() {
  const { items } = useCart()
  const [recovery] = useState(() => {
    const result = loadOrderDraft()
    const matchesCart = result.draft?.items.length === items.length && result.draft.items.every((line, index) =>
      line.dishId === items[index].dishId && line.presentationId === items[index].presentationId && line.quantity === items[index].quantity)
    return { ...result, draft: matchesCart ? result.draft : null }
  })
  const [review, setReview] = useState<{ draft: OrderDraft; source: readonly CartItem[]; saved: boolean; recovered?: boolean } | null>(() =>
    recovery.draft ? { draft: recovery.draft, source: items, saved: true, recovered: true } : null)
  const [summaryError, setSummaryError] = useState(recovery.error)
  const currentReview = review?.source === items ? review : null
  const clearReview = () => { setReview(null); setSummaryError('') }
  const generateSummary = (customer: CustomerDetails) => {
    clearReview()
    let draft: OrderDraft
    try {
      draft = createOrderDraft(items, customer)
    } catch (error) {
      setSummaryError(error instanceof Error ? error.message : 'No se pudo generar el resumen.')
      return
    }
    try {
      window.localStorage.setItem(ORDER_DRAFT_KEY, JSON.stringify(draft))
      setReview({ draft, source: items, saved: true })
    } catch {
      setReview({ draft, source: items, saved: false })
      setSummaryError('No se pudo guardar el borrador en este navegador. Puedes volver a intentarlo con el botón.')
    }
  }
  const { register, handleSubmit, control, clearErrors, formState: { errors } } = useForm<CustomerDetails>({
    defaultValues: recovery.draft ? { ...recovery.draft.customer, address: recovery.draft.customer.address ?? '' }
      : { deliveryMethod: 'delivery', name: '', phone: '', address: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  })
  const deliveryMethod = useWatch({ control, name: 'deliveryMethod' })
  const isDelivery = deliveryMethod === 'delivery'
  const clearAddressError = () => clearErrors('address')

  return (
    <section className="order-page site-container" aria-labelledby="order-title">
      <p className="order-eyebrow">Tu pedido</p>
      <h1 id="order-title">Datos de contacto</h1>
      <p className="order-intro">Nombre y teléfono son obligatorios. Para delivery, añade también tu dirección.</p>
      <form className="order-form" noValidate
        onChange={clearReview}
        onSubmit={handleSubmit(generateSummary, clearReview)}>
        <fieldset className="order-delivery-method"
          aria-describedby={`delivery-cost-info${errors.deliveryMethod ? ' delivery-method-error' : ''}`}>
          <legend>¿Cómo recibirás tu pedido?</legend>
          <div className="order-delivery-options">
            <label className="order-delivery-option">
              <input type="radio" value="delivery"
                aria-invalid={Boolean(errors.deliveryMethod)}
                aria-describedby={errors.deliveryMethod ? 'delivery-method-error' : undefined}
                {...register('deliveryMethod', {
                  required: 'Elige cómo recibirás tu pedido.',
                  validate: (value) => value === 'delivery' || value === 'pickup'
                    || 'Elige delivery o recojo en tienda.',
                  onChange: clearAddressError,
                })} />
              <span>Delivery</span>
            </label>
            <label className="order-delivery-option">
              <input type="radio" value="pickup"
                aria-invalid={Boolean(errors.deliveryMethod)}
                aria-describedby={errors.deliveryMethod ? 'delivery-method-error' : undefined}
                {...register('deliveryMethod', { onChange: clearAddressError })} />
              <span>Recojo en tienda</span>
            </label>
          </div>
          <p id="delivery-cost-info" className="order-delivery-info" role="status" aria-atomic="true">
            {isDelivery
              ? 'Costo de delivery: pendiente de confirmar con el restaurante. El importe de entrega aún no está calculado.'
              : 'Recojo en tienda: retirarás el pedido en el local. Consulta las condiciones de recojo con el restaurante.'}
          </p>
          {errors.deliveryMethod && <p className="order-error" id="delivery-method-error" role="alert">{errors.deliveryMethod.message}</p>}
        </fieldset>
        <div className="order-field">
          <label htmlFor="customer-name">Nombre</label>
          <input id="customer-name" type="text" autoComplete="name" required maxLength={100}
            aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'customer-name-error' : undefined}
            {...register('name', {
              setValueAs: (value: string) => value.trim(),
              required: 'Escribe tu nombre.',
              maxLength: { value: 100, message: 'El nombre debe tener como máximo 100 caracteres.' },
            })} />
          {errors.name && <p className="order-error" id="customer-name-error" role="alert">{errors.name.message}</p>}
        </div>
        <div className="order-field">
          <label htmlFor="customer-phone">Teléfono</label>
          <input id="customer-phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={40}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={`customer-phone-hint${errors.phone ? ' customer-phone-error' : ''}`}
            {...register('phone', {
              setValueAs: (value: string) => value.trim(),
              required: 'Escribe tu teléfono.',
              validate: (value) => /^\+?\d{7,15}$/.test(value.replace(/[\s().-]/g, ''))
                || 'Escribe un teléfono de entre 7 y 15 dígitos, con el código de país si corresponde.',
            })} />
          <p className="order-hint" id="customer-phone-hint">Puedes incluir el código de país, espacios, paréntesis y guiones.</p>
          {errors.phone && <p className="order-error" id="customer-phone-error" role="alert">{errors.phone.message}</p>}
        </div>
        <div className="order-field" hidden={!isDelivery}>
          <label htmlFor="customer-address">Dirección</label>
          <textarea id="customer-address" rows={3} autoComplete="street-address" required={isDelivery} maxLength={200}
            aria-invalid={Boolean(errors.address)}
            aria-describedby={`customer-address-hint${errors.address ? ' customer-address-error' : ''}`}
            {...register('address', {
              disabled: !isDelivery,
              setValueAs: (value: string) => value.trim(),
              required: 'Escribe tu dirección.',
              minLength: { value: 5, message: 'Añade una dirección de al menos 5 caracteres.' },
              maxLength: { value: 200, message: 'La dirección debe tener como máximo 200 caracteres.' },
            })} />
          <p className="order-hint" id="customer-address-hint">Dirección de delivery: incluye calle, número y distrito.</p>
          {errors.address && <p className="order-error" id="customer-address-error" role="alert">{errors.address.message}</p>}
        </div>
        <button type="submit" className="site-primary-link order-submit">Generar resumen y guardar borrador</button>
        <p className="order-status" role="status">
          {currentReview?.saved ? currentReview.recovered
            ? 'Borrador recuperado de este navegador. El pedido todavía no se ha enviado.'
            : 'Borrador guardado en este navegador. El pedido todavía no se ha enviado.' : ''}
        </p>
        {summaryError && <p className="order-error" role="alert">{summaryError}</p>}
      </form>
      {items.length === 0 && <p className="order-intro">Tu carrito está vacío. <Link to="/carta">Ver la carta</Link>.</p>}
      {currentReview && (
        <section className="order-summary" aria-labelledby="order-summary-title">
          <h2 id="order-summary-title">Resumen de la orden</h2>
          <p>Este borrador todavía no se ha enviado al restaurante. Al editar tus datos o el carrito, vuelve a generar el resumen.</p>
          <dl className="order-summary-details">
            <div><dt>Nombre</dt><dd>{currentReview.draft.customer.name}</dd></div>
            <div><dt>Teléfono</dt><dd>{currentReview.draft.customer.phone}</dd></div>
            <div><dt>Entrega</dt><dd>{currentReview.draft.customer.deliveryMethod === 'delivery' ? 'Delivery' : 'Recojo en tienda'}</dd></div>
            {currentReview.draft.customer.address && <div><dt>Dirección</dt><dd>{currentReview.draft.customer.address}</dd></div>}
          </dl>
          <ul className="order-summary-items">
            {currentReview.draft.items.map((item) => (
              <li key={JSON.stringify([item.dishId, item.presentationId])}>
                <strong>{item.name}</strong>
                <span>{item.presentation} · Cantidad: {item.quantity}</span>
                <span>{priceFormat.format(item.unitPriceInCents / 100)} por unidad</span>
                <span>Subtotal: {priceFormat.format(item.subtotalInCents / 100)}</span>
              </li>
            ))}
          </ul>
          <p><strong>Total de productos: {priceFormat.format(currentReview.draft.productsTotalInCents / 100)}</strong></p>
          <p>IGV incluido en los precios.</p>
          <p>{currentReview.draft.customer.deliveryMethod === 'delivery'
            ? 'Costo de delivery pendiente de confirmar; no incluido en el total de productos.'
            : 'Consulta las condiciones de recojo con el restaurante.'}</p>
        </section>
      )}
    </section>
  )
}
