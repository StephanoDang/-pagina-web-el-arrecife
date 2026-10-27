import assert from 'node:assert/strict'
import test from 'node:test'
import { reservationPartyPolicy, validateReservationPeople } from '../src/data/reservationValidation.ts'

test('aplica el límite autorizado de diez personas y registra el aforo de referencia', () => {
  assert.equal(reservationPartyPolicy.maxPerReservation, 10)
  assert.equal(reservationPartyPolicy.capacity, 120)
  assert.equal(validateReservationPeople('1'), true)
  assert.equal(validateReservationPeople('10'), true)
  for (const count of ['11', '120', '121']) {
    assert.equal(validateReservationPeople(count), 'El máximo por reserva es de 10 personas.')
  }
})

test('rechaza cantidades vacías, cero, negativas, decimales, exponentes y enteros inseguros', () => {
  for (const value of ['', ' ', '0', '-1', '1.5', 'NaN', 'Infinity', '1e2', '+2', 'dos', '9007199254740992']) {
    assert.equal(typeof validateReservationPeople(value), 'string', value)
  }
})

test('valida el máximo configurable sin confundirlo con plazas disponibles', () => {
  // Límite ficticio exclusivo de esta prueba; no es una regla del restaurante.
  assert.equal(validateReservationPeople('1', 6), true)
  assert.equal(validateReservationPeople('6', 6), true)
  assert.equal(validateReservationPeople('7', 6), 'El máximo por reserva es de 6 personas.')
})

test('una configuración de máximo inválida no acepta la revisión', () => {
  for (const max of [0, -1, 2.5, NaN, Infinity]) {
    assert.equal(typeof validateReservationPeople('1', max), 'string')
  }
})
