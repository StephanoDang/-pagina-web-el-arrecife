import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import './OrderPage.css'

interface CustomerDetails {
  deliveryMethod: 'delivery' | 'pickup'
  name: string
  phone: string
  address: string
}

export default function OrderPage() {
  const [reviewed, setReviewed] = useState(false)
  const { register, handleSubmit, control, clearErrors, formState: { errors } } = useForm<CustomerDetails>({
    defaultValues: { deliveryMethod: 'delivery', name: '', phone: '', address: '' },
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
        onChange={() => setReviewed(false)}
        onSubmit={handleSubmit(() => setReviewed(true), () => setReviewed(false))}>
        <fieldset className="order-delivery-method"
          aria-describedby={errors.deliveryMethod ? 'delivery-method-error' : undefined}>
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
        <button type="submit" className="site-primary-link order-submit">Revisar mis datos</button>
        <p className="order-status" role="status">
          {reviewed ? 'Tus datos están completos. El pedido todavía no se ha enviado.' : ''}
        </p>
      </form>
    </section>
  )
}
