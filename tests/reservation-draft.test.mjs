import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createReservationDraft, loadReservationDraft, parseReservationDraft,
  RESERVATION_DRAFT_KEY, saveReservationDraft,
} from '../src/data/reservationDraft.ts'

const details = { date: '2028-02-29', time: '12:30', people: '4' }
const options = { id: 'res-550e8400-e29b-41d4-a716-446655440000', savedAt: '2026-10-28T12:00:00.000Z' }

test('crea y valida un borrador con identificador, fecha, hora y personas', () => {
  const draft = createReservationDraft(details, options)
  assert.deepEqual(draft, {
    version: 1, status: 'draft', ...options, ...details, people: 4,
  })
  assert.deepEqual(parseReservationDraft(JSON.stringify(draft)), draft)
})

test('no guarda fechas pasadas ni campos inválidos al crear', () => {
  for (const invalid of [
    { ...details, date: '2000-01-01' }, { ...details, date: '2027-02-29' },
    { ...details, time: '09:59' }, { ...details, time: '18:00' },
    { ...details, people: '11' }, { ...details, people: '2.5' },
  ]) assert.throws(() => createReservationDraft(invalid, options))
})

test('guarda y recupera el mismo borrador desde LocalStorage', () => {
  const draft = createReservationDraft(details, options)
  const storage = new Map()
  const saved = saveReservationDraft(draft, (key, value) => storage.set(key, value))
  assert.deepEqual(saved, { saved: true })
  assert.deepEqual(loadReservationDraft((key) => storage.get(key) ?? null), { draft, error: '' })
  assert.equal(RESERVATION_DRAFT_KEY, 'el-arrecife:reservation-draft:v1')
})

test('el resumen histórico se puede recuperar después de la fecha de visita', () => {
  const pastDraft = { ...createReservationDraft(details, options), date: '2026-10-20', time: '10:00' }
  assert.deepEqual(parseReservationDraft(JSON.stringify(pastDraft)), pastDraft)
})

test('si el navegador bloquea la escritura no informa un guardado exitoso', () => {
  const draft = createReservationDraft(details, options)
  const result = saveReservationDraft(draft, () => { throw new Error('quota exceeded') })
  assert.equal(result.saved, false)
  assert.match(result.error, /No se pudo guardar/)
})

test('la recuperación separa ausencia, error de lectura y datos corruptos', () => {
  assert.deepEqual(loadReservationDraft(() => null), { draft: null, error: '' })
  assert.match(loadReservationDraft(() => { throw new Error('blocked') }).error, /No se pudo leer/)
  assert.match(loadReservationDraft(() => '{').error, /no es válida/)
  assert.equal(loadReservationDraft(() => '{').draft, null)
})

test('rechaza estructura, identificador, versión, hora o personas alterados', () => {
  const draft = createReservationDraft(details, options)
  for (const patch of [
    { version: 2 }, { status: 'confirmed' }, { id: 'bad-id' }, { date: '2027-02-29' },
    { time: '18:00' }, { people: 11 }, { people: 2.5 }, { savedAt: 'bad-date' },
  ]) assert.throws(() => parseReservationDraft(JSON.stringify({ ...draft, ...patch })))
})
