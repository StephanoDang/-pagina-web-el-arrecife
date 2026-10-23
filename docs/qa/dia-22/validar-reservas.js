async () => {
  const results = []
  const date = document.getElementById('reservation-date')
  const time = document.getElementById('reservation-time')
  const form = document.querySelector('.reservation-form')
  const status = () => document.querySelector('.reservation-status').textContent
  const settle = async () => { for (let i = 0; i < 3; i++) await new Promise(requestAnimationFrame) }
  const assert = (condition, message) => { if (!condition) throw new Error(message) }
  const check = (condition, label) => { assert(condition, label); results.push({ caso: label, resultado: 'correcto' }) }
  const fill = (element, value) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(element, value)
    element.dispatchEvent(new Event('input', { bubbles: true }))
  }
  const submit = async (label, dateValue, timeValue, expected) => {
    fill(date, dateValue)
    fill(time, timeValue)
    await settle()
    form.requestSubmit()
    await settle()
    const ids = [...document.querySelectorAll('.reservation-error')].map(e => e.id)
    assert(JSON.stringify(ids) === JSON.stringify(expected.map(name => `reservation-${name}-error`)), `${label}: errores inesperados`)
    for (const [name, field] of [['date', date], ['time', time]]) {
      const invalid = expected.includes(name)
      assert(field.getAttribute('aria-invalid') === String(invalid), `${label}: aria-invalid`)
      if (invalid) {
        assert(field.getAttribute('aria-describedby') === `reservation-${name}-error`, `${label}: asociación de error`)
        assert(document.getElementById(`reservation-${name}-error`).getAttribute('role') === 'alert', `${label}: role de error`)
      }
    }
    assert(expected.length ? !status() : status().includes('no se ha enviado ni confirmado'), `${label}: aviso incorrecto`)
    if (expected.length) assert(document.activeElement.id === `reservation-${expected[0]}`, `${label}: foco incorrecto`)
    results.push({ caso: label, resultado: 'correcto' })
  }
  check(date.type === 'date' && time.type === 'time' && date.required && time.required, 'Controles nativos obligatorios y con etiquetas')
  check(Boolean(document.querySelector('label[for=reservation-date]')) && Boolean(document.querySelector('label[for=reservation-time]'))
    && form.getAttribute('aria-describedby') === 'reservation-availability', 'Etiquetas y aviso de disponibilidad asociados')
  await submit('Ambos campos vacíos', '', '', ['date', 'time'])
  await submit('Solo fecha', '2026-10-24', '', ['time'])
  await submit('Solo hora', '', '13:05', ['date'])
  await submit('Fecha y hora completas', '2026-10-24', '13:05', [])
  check(date.value === '2026-10-24' && time.value === '13:05', 'Selección conserva fecha y minutos sin conversión horaria')
  fill(date, '2026-10-26')
  await settle()
  check(!status() && time.value === '13:05', 'Editar fecha retira aviso y conserva hora')
  await submit('Revisión tras cambiar fecha', '2026-10-26', '13:05', [])
  fill(time, '14:30')
  await settle()
  check(!status() && date.value === '2026-10-26', 'Editar hora retira aviso y conserva fecha')
  await submit('Revisión tras cambiar hora', '2026-10-26', '14:30', [])
  await submit('Borrar hora después de revisar', '2026-10-26', '', ['time'])
  fill(time, '15:45')
  await settle()
  check(!document.getElementById('reservation-time-error') && !status(), 'Corregir hora revalida sin revisar automáticamente')
  await submit('Borrar fecha', '', '15:45', ['date'])
  fill(date, '2026-10-27')
  await settle()
  check(!document.getElementById('reservation-date-error') && !status(), 'Corregir fecha revalida sin revisar automáticamente')
  await submit('Revisión final válida', '2026-10-27', '15:45', [])
  const fields = [date, time]
  check(document.documentElement.scrollWidth <= innerWidth && fields.every(e => e.getBoundingClientRect().width <= innerWidth
    && e.getBoundingClientRect().height >= 44 && parseFloat(getComputedStyle(e).fontSize) >= 16), 'Sin desbordamiento y campos de al menos 44 px con fuente de 16 px')
  return { fecha: '2026-10-23', casos: results.length, resultados: results, viewport: [innerWidth, innerHeight], navegador: navigator.userAgent }
}
