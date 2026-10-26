import assert from 'node:assert/strict'
import test from 'node:test'
import { getRestaurantClock, validateReservationDate, validateReservationTime } from '../src/data/reservationValidation.ts'

const now = new Date('2026-10-26T19:30:45Z') // 14:30 en Perú.

test('usa el día de Perú incluso cuando UTC ya pasó a mañana', () => {
  assert.deepEqual(getRestaurantClock(new Date('2026-10-27T02:00:00Z')), { date: '2026-10-26', time: '21:00' })
  assert.deepEqual(getRestaurantClock(new Date('2026-10-27T05:00:00Z')), { date: '2026-10-27', time: '00:00' })
})

test('rechaza fechas pasadas, inexistentes y formatos inválidos', () => {
  for (const date of ['2026-10-25', '2026-02-30', '2027-02-29', '2026-13-01', '26/10/2026', '', '0000-01-01']) {
    assert.equal(typeof validateReservationDate(date, now), 'string', date)
  }
  for (const date of ['2026-10-26', '2026-10-27', '2028-02-29']) {
    assert.equal(validateReservationDate(date, now), true, date)
  }
})

test('rechaza horas pasadas y el minuto actual; acepta minutos futuros y otros días', () => {
  for (const time of ['00:00', '14:29', '14:30']) {
    assert.equal(typeof validateReservationTime(time, '2026-10-26', now), 'string', time)
  }
  assert.equal(validateReservationTime('14:31', '2026-10-26', now), true)
  assert.equal(validateReservationTime('00:00', '2026-10-27', now), true)
  for (const time of ['', '24:00', '12:60', '9:00', '12:30:00']) {
    assert.equal(typeof validateReservationTime(time, '2026-10-27', now), 'string', time)
  }
})

test('revalida con el reloj actualizado al pasar el tiempo y cambiar de día', () => {
  assert.equal(validateReservationTime('14:31', '2026-10-26', now), true)
  assert.equal(typeof validateReservationTime('14:31', '2026-10-26', new Date('2026-10-26T19:31:00Z')), 'string')
  assert.equal(typeof validateReservationDate('2026-10-26', new Date('2026-10-27T05:00:00Z')), 'string')
})
