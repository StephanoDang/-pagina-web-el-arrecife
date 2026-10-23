import { useState } from 'react'
import { useForm } from 'react-hook-form'
import './ReservationPage.css'

interface ReservationDetails {
  date: string
  time: string
}

export default function ReservationPage() {
  const [reviewed, setReviewed] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<ReservationDetails>({
    defaultValues: { date: '', time: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  })

  return (
    <section className="reservation-page site-container" aria-labelledby="reservation-title">
      <p className="reservation-eyebrow">Reservas</p>
      <h1 id="reservation-title">Planifica tu visita</h1>
      <p className="reservation-intro">Elige una fecha y una hora. Ambos campos son obligatorios.</p>
      <p className="reservation-notice" id="reservation-availability">
        Horarios y disponibilidad por confirmar con el restaurante.
      </p>
      <form className="reservation-form" noValidate aria-describedby="reservation-availability"
        onChange={() => setReviewed(false)}
        onSubmit={handleSubmit(() => setReviewed(true), () => setReviewed(false))}>
        <div className="reservation-fields">
          <div className="reservation-field">
            <label htmlFor="reservation-date">Fecha de la visita</label>
            <input id="reservation-date" type="date" required
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? 'reservation-date-error' : undefined}
              {...register('date', { required: 'Elige una fecha para tu visita.' })} />
            {errors.date && <p className="reservation-error" id="reservation-date-error" role="alert">{errors.date.message}</p>}
          </div>
          <div className="reservation-field">
            <label htmlFor="reservation-time">Hora de la visita</label>
            <input id="reservation-time" type="time" step={60} required
              aria-invalid={Boolean(errors.time)}
              aria-describedby={errors.time ? 'reservation-time-error' : undefined}
              {...register('time', { required: 'Elige una hora para tu visita.' })} />
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
