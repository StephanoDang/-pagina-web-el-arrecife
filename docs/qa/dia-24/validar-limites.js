async () => {
  const NativeDate = window.Date
  let instant = '2026-10-26T14:00:00Z'
  window.Date = class extends NativeDate {
    constructor(...args) { super(...(args.length ? args : [instant])) }
    static now() { return new NativeDate(instant).getTime() }
  }
  const results = []
  const settle = async () => { for (let i = 0; i < 4; i++) await new Promise(requestAnimationFrame) }
  const date = document.getElementById('reservation-date')
  const time = document.getElementById('reservation-time')
  const form = document.querySelector('.reservation-form')
  const status = () => document.querySelector('.reservation-status').textContent
  const check = (ok, caso) => {
    if (!ok) throw new Error(caso)
    results.push({ caso, resultado: 'correcto' })
  }
  const fill = (field, value) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(field, value)
    field.dispatchEvent(new Event('input', { bubbles: true }))
  }
  const refresh = async (value) => {
    instant = value
    window.dispatchEvent(new Event('focus'))
    await settle()
  }
  const submit = async (label, day, hour, expected) => {
    fill(date, day)
    fill(time, hour)
    await settle()
    form.requestSubmit()
    await settle()
    const actual = [...document.querySelectorAll('.reservation-error')].map(e => e.id)
    check(JSON.stringify(actual) === JSON.stringify(expected.map(name => `reservation-${name}-error`)), label)
    check(expected.length ? !status() : status().includes('no se ha enviado ni confirmado'), `${label}: revisión local correcta`)
    for (const name of ['date', 'time']) {
      const field = name === 'date' ? date : time
      if (field.getAttribute('aria-invalid') !== String(expected.includes(name))) throw new Error(`${label}: aria-invalid ${name}`)
      if (expected.includes(name) && field.getAttribute('aria-describedby') !== `reservation-${name}-error`) throw new Error(`${label}: error no asociado`)
    }
    if (expected.length && document.activeElement.id !== `reservation-${expected[0]}`) throw new Error(`${label}: foco incorrecto`)
  }
  try {
    await refresh(instant)
    check(date.min === '2026-10-26' && time.min === '10:00' && time.max === '17:59', 'Límites nativos: hoy en Perú y 10:00–17:59')
    check(document.getElementById('reservation-availability').textContent.includes('provisional'), 'Horario identificado como provisional')
    await submit('Campos vacíos', '', '', ['date', 'time'])
    await submit('Fecha de ayer rechazada', '2026-10-25', '12:00', ['date'])
    await submit('Minuto anterior a apertura', '2026-10-26', '09:59', ['time'])
    await submit('Apertura del lunes aceptada', '2026-10-26', '10:00', [])
    await submit('Último minuto antes del cierre', '2026-10-26', '17:59', [])
    await submit('Cierre rechazado', '2026-10-26', '18:00', ['time'])
    await submit('Minuto posterior al cierre', '2026-10-26', '18:01', ['time'])
    for (const day of ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01']) {
      await submit(`Apertura aceptada ${day}`, day, '10:00', [])
    }
    await refresh('2026-10-26T19:30:45Z')
    await submit('Hora pasada hoy', '2026-10-26', '14:29', ['time'])
    await submit('Minuto actual rechazado', '2026-10-26', '14:30', ['time'])
    await submit('Minuto futuro aceptado', '2026-10-26', '14:31', [])
    await submit('Hora anterior válida mañana', '2026-10-27', '10:00', [])
    fill(date, '2026-10-26')
    await settle()
    check(!status() && time.getAttribute('aria-invalid') === 'true', 'Cambiar mañana por hoy retira revisión y revalida hora pasada')
    await refresh('2026-10-26T23:00:00Z')
    await submit('Hoy después del cierre', '2026-10-26', '17:59', ['time'])
    await submit('Mañana después del cierre de hoy', '2026-10-27', '10:00', [])
    await refresh('2026-10-27T04:59:00Z')
    check(date.min === '2026-10-26', 'Día de Perú antes de medianoche aunque UTC sea mañana')
    await refresh('2026-10-27T05:00:00Z')
    check(date.min === '2026-10-27' && !status(), 'Medianoche actualiza min y retira revisión al recuperar foco')
    await submit('Día anterior tras medianoche', '2026-10-26', '12:00', ['date'])
    await submit('Apertura del nuevo día', '2026-10-27', '10:00', [])
    check(document.documentElement.scrollWidth <= innerWidth, 'Sin desbordamiento horizontal')
    return { casos: results.length, resultados: results, relojSimulado: true, viewport: [innerWidth, innerHeight], navegador: navigator.userAgent }
  } finally {
    window.Date = NativeDate
    window.dispatchEvent(new Event('focus'))
  }
}
