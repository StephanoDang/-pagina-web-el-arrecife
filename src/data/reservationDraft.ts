import { reservationHours, reservationPartyPolicy, validateReservationDate, validateReservationPeople, validateReservationTime } from './reservationValidation.ts'

export const RESERVATION_DRAFT_KEY = 'el-arrecife:reservation-draft:v1'

export interface ReservationDetails {
  date: string
  time: string
  people: string
}

export interface ReservationDraft {
  version: 1
  status: 'draft'
  id: string
  savedAt: string
  date: string
  time: string
  people: number
}

export function createReservationDraft(
  details: ReservationDetails,
  options: { id?: string; savedAt?: string } = {},
): ReservationDraft {
  if (validateReservationDate(details.date) !== true
    || validateReservationTime(details.time, details.date) !== true
    || validateReservationPeople(details.people) !== true) {
    throw new Error('Revisa la fecha, la hora y el número de personas antes de guardar.')
  }
  const savedAt = options.savedAt ?? new Date().toISOString()
  const id = options.id ?? `res-${crypto.randomUUID()}`
  if (!/^res-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    || !Number.isFinite(Date.parse(savedAt))) throw new Error('No se pudo crear un identificador de reserva válido.')
  return {
    version: 1,
    status: 'draft',
    id,
    savedAt,
    date: details.date,
    time: details.time,
    people: Number(details.people),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && !value.startsWith('0000')
}

export function parseReservationDraft(raw: string): ReservationDraft {
  const value: unknown = JSON.parse(raw)
  if (!isRecord(value)
    || value.version !== 1 || value.status !== 'draft'
    || typeof value.id !== 'string' || !/^res-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.id)
    || typeof value.savedAt !== 'string' || !Number.isFinite(Date.parse(value.savedAt))
    || typeof value.date !== 'string' || !isCalendarDate(value.date)
    || typeof value.time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.time)
    || value.time < reservationHours.opens || value.time >= reservationHours.closes
    || typeof value.people !== 'number' || !Number.isSafeInteger(value.people)
    || validateReservationPeople(String(value.people), reservationPartyPolicy.maxPerReservation) !== true) {
    throw new Error('El borrador de reserva guardado no es válido.')
  }
  return {
    version: 1,
    status: 'draft',
    id: value.id as string,
    savedAt: value.savedAt as string,
    date: value.date as string,
    time: value.time as string,
    people: value.people as number,
  }
}

export function saveReservationDraft(
  draft: ReservationDraft,
  write: (key: string, value: string) => void = (key, value) => window.localStorage.setItem(key, value),
): { saved: true } | { saved: false; error: string } {
  try {
    write(RESERVATION_DRAFT_KEY, JSON.stringify(draft))
    return { saved: true }
  } catch {
    return { saved: false, error: 'No se pudo guardar la reserva en este navegador. Comprueba el espacio disponible e inténtalo de nuevo.' }
  }
}

export function loadReservationDraft(
  read: (key: string) => string | null = (key) => window.localStorage.getItem(key),
): { draft: ReservationDraft | null; error: string } {
  let raw: string | null
  try {
    raw = read(RESERVATION_DRAFT_KEY)
  } catch {
    return { draft: null, error: 'No se pudo leer la reserva guardada en este navegador.' }
  }
  if (raw === null) return { draft: null, error: '' }
  try {
    return { draft: parseReservationDraft(raw), error: '' }
  } catch {
    return { draft: null, error: 'La reserva guardada no es válida. Puedes completar una nueva.' }
  }
}
