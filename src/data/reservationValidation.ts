// Horario provisional autorizado por el usuario: todos los días, incluido lunes.
// Los feriados pueden variar; no hay excepciones confirmadas todavía.
export const reservationHours = {
  opens: '10:00',
  closes: '18:00',
  lastStart: '17:59', // Precisión de minutos; no iniciar una visita al cierre.
} as const

// Valores provisionales autorizados el 27/10; confirmar alcance por sede.
// El aforo de referencia no equivale a plazas disponibles en tiempo real.
export const reservationPartyPolicy: { maxPerReservation: number | null; capacity: number } = {
  maxPerReservation: 10,
  capacity: 120,
}

export function validateReservationPeople(
  value: string,
  maxPerReservation: number | null = reservationPartyPolicy.maxPerReservation,
): true | string {
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1) {
    return 'Indica un número entero de personas, como mínimo 1.'
  }
  if (maxPerReservation !== null) {
    if (!Number.isSafeInteger(maxPerReservation) || maxPerReservation < 1) {
      return 'No podemos revisar el límite de personas. Consulta con el restaurante.'
    }
    if (Number(value) > maxPerReservation) {
      return `El máximo por reserva es de ${maxPerReservation} personas.`
    }
  }
  return true
}

// Las dos sedes están en Perú. No depender de la zona horaria del visitante.
export function getRestaurantClock(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now)
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)!.value
  return {
    date: `${value('year')}-${value('month')}-${value('day')}`,
    time: `${value('hour')}:${value('minute')}`,
  }
}

export function validateReservationDate(date: string, now = new Date()): true | string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Elige una fecha válida.'
  const parsed = new Date(`${date}T00:00:00Z`)
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date.startsWith('0000')) {
    return 'Elige una fecha válida.'
  }
  return date >= getRestaurantClock(now).date || 'Elige hoy o una fecha futura, según la hora de Perú.'
}

export function validateReservationTime(time: string, date: string, now = new Date()): true | string {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return 'Elige una hora válida.'
  if (time < reservationHours.opens || time >= reservationHours.closes) {
    return 'Elige una hora desde las 10:00 y antes de las 18:00 (hora de Perú).'
  }
  const clock = getRestaurantClock(now)
  // El minuto en curso ya empezó; la revisión debe corresponder a una hora futura.
  if (date === clock.date && time <= clock.time) return 'Elige una hora futura, según la hora de Perú.'
  return true
}
