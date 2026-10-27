import assert from 'node:assert/strict'
import test from 'node:test'
import { reservationPartyPolicy, validateReservationPeople } from '../src/data/reservationValidation.ts'

test('el máximo comercial queda pendiente sin inventar aforo', () => {
  assert.equal(reservationPartyPolicy.maxPerReservation, null)
  assert.equal(validateReservationPeople('1'), true)
  assert.equal(validateReservationPeople('25'), true)
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
