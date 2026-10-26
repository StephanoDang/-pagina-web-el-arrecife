import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getRestaurantClock, validateReservationDate, validateReservationTime } from '../data/reservationValidation'
import './ReservationPage.css'

interface ReservationDetails {
  date: string
  time: string
}

export default function ReservationPage() {
  const [reviewed, setReviewed] = useState(false)
  const [clock, setClock] = useState(() => getRestaurantClock())
  const { register, handleSubmit, getValues, trigger, formState: { errors } } = useForm<ReservationDetails>({
    defaultValues: { date: '', time: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  })

  useEffect(() => {
    const refresh = () => {
      setClock(getRestaurantClock())
      setReviewed(false)
      if (getValues('date')) void trigger(['date', 'time'])
    }
    const interval = window.setInterval(refresh, 60_000)
    window.addEventListener('focus', refresh)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refresh)
    }
  }, [getValues, trigger])

  return (
    <section className="reservation-page site-container" aria-labelledby="reservation-title">
      <p className="reservation-eyebrow">Reservas</p>
      <h1 id="reservation-title">Planifica tu visita</h1>
      <p className="reservation-intro">Elige una fecha y una hora. Ambos campos son obligatorios.</p>
      <p className="reservation-notice" id="reservation-availability">
        Fechas y horas según la hora de Perú. Horarios de atención y disponibilidad por confirmar con el restaurante.
      </p>
      <form className="reservation-form" noValidate aria-describedby="reservation-availability"
        onChange={() => setReviewed(false)}
        onSubmit={handleSubmit(() => setReviewed(true), () => setReviewed(false))}>
        <div className="reservation-fields">
          <div className="reservation-field">
            <label htmlFor="reservation-date">Fecha de la visita</label>
            <input id="reservation-date" type="date" required min={clock.date}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? 'reservation-date-error' : undefined}
              {...register('date', {
                required: 'Elige una fecha para tu visita.',
                validate: (value) => validateReservationDate(value),
                deps: ['time'],
              })} />
            {errors.date && <p className="reservation-error" id="reservation-date-error" role="alert">{errors.date.message}</p>}
          </div>
          <div className="reservation-field">
            <label htmlFor="reservation-time">Hora de la visita</label>
            <input id="reservation-time" type="time" step={60} required
              aria-invalid={Boolean(errors.time)}
              aria-describedby={errors.time ? 'reservation-time-error' : undefined}
              {...register('time', {
                required: 'Elige una hora para tu visita.',
                validate: (value) => validateReservationTime(value, getValues('date')),
              })} />
            {errors.time && <p className="reservation-error" id="reservation-time-error" role="alert">{errors.time.message}</p>}
          </div>
        </div>
        <button type="submit" className="site-primary-link reservation-submit">Revisar fecha y hora</button>
        <p className="reservation-status" role="status">
          {reviewed ? 'Fecha y hora seleccionadas. La reserva todavía no se ha enviado ni confirmado.' : ''}
        </p>
      </form>
    </section>
  )
}
