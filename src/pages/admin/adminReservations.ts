export type AdminReservationStatus = 'pending' | 'confirmed' | 'cancelled'

export interface AdminReservation {
  id: string
  date: string
  time: string
  customerName: string
  people: number
  status: AdminReservationStatus
}

export type AdminReservationWeekday = 'all' | '0' | '1' | '2' | '3' | '4' | '5' | '6'

export interface AdminReservationFilters {
  weekday: AdminReservationWeekday
  status: AdminReservationStatus | 'all'
}

/** Filters by the visit's local calendar date, stored as YYYY-MM-DD. */
export function filterAdminReservations(
  reservations: readonly AdminReservation[],
  filters: AdminReservationFilters,
): AdminReservation[] {
  return reservations.filter((reservation) => {
    if (filters.status !== 'all' && reservation.status !== filters.status) return false
    if (filters.weekday === 'all') return true

    const date = new Date(`${reservation.date}T00:00:00.000Z`)
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== reservation.date) return false
    return String(date.getUTCDay()) === filters.weekday
  })
}

/** Changes only pending reservations; repeated or terminal actions are ignored. */
export function updateAdminReservationStatus(
  reservations: readonly AdminReservation[],
  id: string,
  status: Exclude<AdminReservationStatus, 'pending'>,
): AdminReservation[] {
  const reservation = reservations.find((item) => item.id === id)
  if (!reservation || reservation.status !== 'pending') return [...reservations]
  return reservations.map((item) => item.id === id ? { ...item, status } : item)
}

/** Earliest visit first; IDs keep reservations with identical schedules deterministic. */
export function sortAdminReservations(reservations: readonly AdminReservation[]): AdminReservation[] {
  return [...reservations].sort((left, right) => {
    const scheduleDifference = `${left.date}T${left.time}`.localeCompare(`${right.date}T${right.time}`)
    return scheduleDifference || left.id.localeCompare(right.id, 'en')
  })
}

export function formatAdminReservationDate(date: string): string {
  const parsedDate = new Date(`${date}T12:00:00.000Z`)
  if (!Number.isFinite(parsedDate.getTime())) return date
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'long', timeZone: 'UTC' }).format(parsedDate)
}
