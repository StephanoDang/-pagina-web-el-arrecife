import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createReservationDraft, loadReservationDraft, saveReservationDraft } from '../data/reservationDraft'
import { getRestaurantClock, reservationHours, reservationPartyPolicy, validateReservationDate, validateReservationTime, validateReservationPeople } from '../data/reservationValidation'
import './ReservationPage.css'

import type { ReservationDetails, ReservationDraft } from '../data/reservationDraft'

export default function ReservationPage() {
  const [storedReservation] = useState(() => loadReservationDraft())
  const [savedDraft, setSavedDraft] = useState<ReservationDraft | null>(storedReservation.draft)
  const [saveError, setSaveError] = useState(storedReservation.error)
  const [clock, setClock] = useState(() => getRestaurantClock())
  const { register, handleSubmit, getValues, trigger, formState: { errors } } = useForm<ReservationDetails>({
    defaultValues: { date: '', time: '', people: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  })

  useEffect(() => {
    const refresh = () => {
      setClock(getRestaurantClock())
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
      <p className="reservation-intro">Elige una fecha, una hora y el número de personas. Todos los campos son obligatorios.</p>
      <p className="reservation-notice" id="reservation-availability">
        Horario provisional: lunes a domingo, de 10:00 a 18:00 (hora de Perú).
        Elige una hora anterior al cierre. Los horarios pueden variar en feriados.
        Disponibilidad por confirmar con el restaurante.
      </p>
      <form className="reservation-form" noValidate aria-describedby="reservation-availability"
        onChange={() => { setSavedDraft(null); setSaveError('') }}
        onSubmit={handleSubmit((details) => {
          try {
            const draft = createReservationDraft(details)
            const result = saveReservationDraft(draft)
            if (result.saved) {
              setSavedDraft(draft)
              setSaveError('')
            } else {
              setSavedDraft(null)
              setSaveError(result.error)
            }
          } catch (error) {
            setSavedDraft(null)
            setSaveError(error instanceof Error ? error.message : 'No se pudo guardar la reserva.')
          }
        }, () => { setSavedDraft(null); setSaveError('') })}>
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
              min={reservationHours.opens} max={reservationHours.lastStart}
              aria-invalid={Boolean(errors.time)}
              aria-describedby={errors.time ? 'reservation-time-error' : undefined}
              {...register('time', {
                required: 'Elige una hora para tu visita.',
                validate: (value) => validateReservationTime(value, getValues('date')),
              })} />
            {errors.time && <p className="reservation-error" id="reservation-time-error" role="alert">{errors.time.message}</p>}
          </div>
          <div className="reservation-field">
            <label htmlFor="reservation-people">Número de personas</label>
            <input id="reservation-people" type="number" inputMode="numeric" min={1} step={1} required
              max={reservationPartyPolicy.maxPerReservation ?? undefined}
              aria-invalid={Boolean(errors.people)}
              aria-describedby={`reservation-people-help${errors.people ? ' reservation-people-error' : ''}`}
              {...register('people', {
                required: 'Indica cuántas personas asistirán.',
                validate: (value) => validateReservationPeople(value),
              })} />
            <p className="reservation-help" id="reservation-people-help">
              Indica cuántas personas asistirán a la visita.
            </p>
            {errors.people && <p className="reservation-error" id="reservation-people-error" role="alert">{errors.people.message}</p>}
          </div>
        </div>
        <button type="submit" className="site-primary-link reservation-submit">Guardar reserva en este dispositivo</button>
        <p className="reservation-status" role="status" aria-atomic="true">
          {savedDraft ? 'Reserva guardada en este dispositivo. Todavía no se ha enviado al restaurante ni está confirmada.' : ''}
        </p>
        {saveError && <p className="reservation-error" role="alert">{saveError}</p>}
      </form>
      {savedDraft && (
        <section className="reservation-summary" aria-labelledby="reservation-summary-title">
          <h2 id="reservation-summary-title">Resumen de la reserva</h2>
          <p>Este registro está guardado solo en este navegador. El restaurante no lo ha recibido ni confirmado.</p>
          <dl className="reservation-summary-details">
            <div><dt>Identificador</dt><dd>{savedDraft.id}</dd></div>
            <div><dt>Fecha</dt><dd>{new Intl.DateTimeFormat('es-PE', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${savedDraft.date}T00:00:00Z`))}</dd></div>
            <div><dt>Hora</dt><dd>{savedDraft.time} (hora de Perú)</dd></div>
            <div><dt>Personas</dt><dd>{savedDraft.people}</dd></div>
          </dl>
        </section>
      )}
    </section>
  )
}
