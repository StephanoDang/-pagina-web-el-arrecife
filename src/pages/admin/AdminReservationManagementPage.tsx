import { useMemo, useState } from 'react'
import AdminTable, { type AdminTableColumn } from './components/AdminTable'
import AdminButton from './components/AdminButton'
import { formatAdminReservationDate, sortAdminReservations, updateAdminReservationStatus, type AdminReservation } from './adminReservations'
import './AdminReservationManagementPage.css'

const incomingReservations: AdminReservation[] = []

const reservationStatusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
} satisfies Record<AdminReservation['status'], string>

export default function AdminReservationManagementPage({ initialReservations = incomingReservations }: { initialReservations?: AdminReservation[] } = {}) {
  const [reservationState, setReservationState] = useState(initialReservations)
  const reservations = useMemo(() => sortAdminReservations(reservationState), [reservationState])
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
        <p className="admin-reservations-count" role="status">{reservations.length} {reservations.length === 1 ? 'reserva recibida' : 'reservas recibidas'}</p>
      </header>

      <p className="admin-reservations-notice">Las solicitudes de reserva todavía se guardan como borradores en el navegador y no se envían al restaurante.</p>

      <AdminTable
        caption="Reservas recibidas"
        columns={columns}
        emptyMessage="Aún no hay reservas recibidas. Cuando se conecte su recepción, aparecerán aquí."
        getRowKey={(reservation) => reservation.id}
        rows={reservations}
      />
    </section>
  )
}
