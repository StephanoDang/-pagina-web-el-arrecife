import { useMemo, useState } from 'react'
import AdminTable, { type AdminTableColumn } from './components/AdminTable'
import AdminButton from './components/AdminButton'
import {
  filterAdminReservations,
  formatAdminReservationDate,
  sortAdminReservations,
  updateAdminReservationStatus,
  type AdminReservation,
  type AdminReservationFilters,
} from './adminReservations'
import './AdminReservationManagementPage.css'

const incomingReservations: AdminReservation[] = []

const reservationStatusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
} satisfies Record<AdminReservation['status'], string>

export default function AdminReservationManagementPage({ initialReservations = incomingReservations }: { initialReservations?: AdminReservation[] } = {}) {
  const [reservationState, setReservationState] = useState(initialReservations)
  const [filters, setFilters] = useState<AdminReservationFilters>({ weekday: 'all', status: 'all' })
  const reservations = useMemo(
    () => sortAdminReservations(filterAdminReservations(reservationState, filters)),
    [reservationState, filters],
  )
  const columns = useMemo<AdminTableColumn<AdminReservation>[]>(() => [
    { key: 'id', header: 'Código', render: (reservation) => <strong>{reservation.id}</strong> },
    { key: 'date', header: 'Fecha de visita', render: (reservation) => formatAdminReservationDate(reservation.date) },
    { key: 'time', header: 'Hora', render: (reservation) => reservation.time },
    { key: 'customer', header: 'Cliente', render: (reservation) => reservation.customerName },
    { key: 'people', header: 'Personas', render: (reservation) => reservation.people },
    { key: 'status', header: 'Estado', render: (reservation) => reservationStatusLabels[reservation.status] },
    { key: 'actions', header: 'Acciones', render: (reservation) => reservation.status === 'pending' ? (
      <div className="admin-reservation-actions">
        <AdminButton onClick={() => setReservationState((current) => updateAdminReservationStatus(current, reservation.id, 'confirmed'))}>Confirmar</AdminButton>
        <AdminButton variant="secondary" onClick={() => setReservationState((current) => updateAdminReservationStatus(current, reservation.id, 'cancelled'))}>Cancelar</AdminButton>
      </div>
    ) : <span>Sin acciones disponibles</span> },
  ], [])

  return (
    <section className="admin-reservations-page" aria-labelledby="admin-reservations-title">
      <header className="admin-reservations-heading">
        <div>
          <p className="admin-eyebrow">ATENCIÓN · RESERVAS</p>
          <h2 id="admin-reservations-title">Reservas entrantes</h2>
          <p>Revisa la fecha, hora y cantidad de personas de cada reserva recibida.</p>
        </div>
        <p className="admin-reservations-count" role="status">{reservations.length} {reservations.length === 1 ? 'reserva mostrada' : 'reservas mostradas'}</p>
      </header>

      <p className="admin-reservations-notice">Las solicitudes de reserva todavía se guardan como borradores en el navegador y no se envían al restaurante.</p>

      <div className="admin-reservation-filters" aria-label="Filtros de reservas">
        <label>
          Día de la semana
          <select
            aria-label="Filtrar reservas por día de la semana"
            onChange={(event) => setFilters((current) => ({ ...current, weekday: event.target.value as AdminReservationFilters['weekday'] }))}
            value={filters.weekday}
          >
            <option value="all">Todos los días</option>
            <option value="1">Lunes</option>
            <option value="2">Martes</option>
            <option value="3">Miércoles</option>
            <option value="4">Jueves</option>
            <option value="5">Viernes</option>
            <option value="6">Sábado</option>
            <option value="0">Domingo</option>
          </select>
        </label>
        <label>
          Estado
          <select
            aria-label="Filtrar reservas por estado"
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as AdminReservationFilters['status'] }))}
            value={filters.status}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </label>
      </div>

      <AdminTable
        caption="Reservas recibidas"
        columns={columns}
        emptyMessage={reservationState.length === 0
          ? 'Aún no hay reservas recibidas. Cuando se conecte su recepción, aparecerán aquí.'
          : 'No hay reservas que coincidan con los filtros seleccionados.'}
        getRowKey={(reservation) => reservation.id}
        rows={reservations}
      />
    </section>
  )
}
