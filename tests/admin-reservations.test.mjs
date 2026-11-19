import assert from 'node:assert/strict'
import test from 'node:test'
import { filterAdminReservations, formatAdminReservationDate, sortAdminReservations, updateAdminReservationStatus } from '../src/pages/admin/adminReservations.ts'

const reservations = [
  { id: 'RES-2', date: '2026-11-20', time: '12:00', customerName: 'Ana', people: 4, status: 'pending' },
  { id: 'RES-3', date: '2026-11-20', time: '12:00', customerName: 'Luis', people: 2, status: 'confirmed' },
  { id: 'RES-1', date: '2026-11-19', time: '18:30', customerName: 'Sol', people: 6, status: 'pending' },
]

test('ordena las reservas por fecha y hora, y desempata por código sin mutar la lista', () => {
  assert.deepEqual(sortAdminReservations(reservations).map((reservation) => reservation.id), ['RES-1', 'RES-2', 'RES-3'])
  assert.deepEqual(reservations.map((reservation) => reservation.id), ['RES-2', 'RES-3', 'RES-1'])
})

test('filtra reservas por día y estado, combinando ambos criterios', () => {
  assert.deepEqual(filterAdminReservations(reservations, { weekday: '5', status: 'all' }).map((reservation) => reservation.id), ['RES-2', 'RES-3'])
  assert.deepEqual(filterAdminReservations(reservations, { weekday: 'all', status: 'pending' }).map((reservation) => reservation.id), ['RES-2', 'RES-1'])
  assert.deepEqual(filterAdminReservations(reservations, { weekday: '5', status: 'pending' }).map((reservation) => reservation.id), ['RES-2'])
})

test('devuelve una lista vacía cuando los filtros combinados no coinciden', () => {
  assert.deepEqual(filterAdminReservations(reservations, { weekday: '1', status: 'cancelled' }), [])
})

test('excluye fechas inválidas de un filtro por día', () => {
  const invalidDate = [{ ...reservations[0], date: '2026-02-30' }]
  assert.deepEqual(filterAdminReservations(invalidDate, { weekday: '1', status: 'all' }), [])
})

test('formatea la fecha de visita sin desplazar el día por zona horaria', () => {
  assert.equal(formatAdminReservationDate('2026-11-20'), '20 de noviembre de 2026')
  assert.equal(formatAdminReservationDate('fecha-inválida'), 'fecha-inválida')
})

test('confirma o cancela una reserva pendiente una sola vez', () => {
  const confirmed = updateAdminReservationStatus(reservations, 'RES-2', 'confirmed')
  assert.equal(confirmed.find((reservation) => reservation.id === 'RES-2')?.status, 'confirmed')
  assert.equal(updateAdminReservationStatus(confirmed, 'RES-2', 'cancelled').find((reservation) => reservation.id === 'RES-2')?.status, 'confirmed')

  const cancelled = updateAdminReservationStatus(reservations, 'RES-2', 'cancelled')
  assert.equal(cancelled.find((reservation) => reservation.id === 'RES-2')?.status, 'cancelled')
  assert.equal(updateAdminReservationStatus(cancelled, 'RES-2', 'confirmed').find((reservation) => reservation.id === 'RES-2')?.status, 'cancelled')
  assert.equal(updateAdminReservationStatus(reservations, 'inexistente', 'confirmed').length, reservations.length)
})
