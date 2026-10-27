async () => {
  const results = []
  const date = document.getElementById('reservation-date')
  const time = document.getElementById('reservation-time')
  const people = document.getElementById('reservation-people')
  const form = document.querySelector('.reservation-form')
  const status = () => document.querySelector('.reservation-status').textContent
  const settle = async () => { for (let i = 0; i < 4; i++) await new Promise(requestAnimationFrame) }
  const check = (ok, caso) => { if (!ok) throw new Error(caso); results.push({ caso, resultado: 'correcto' }) }
  const fill = (field, value) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(field, value)
    field.dispatchEvent(new Event('input', { bubbles: true }))
  }
  const future = new Date(Date.now() + 172800000).toISOString().slice(0, 10)
  const submit = async (label, count, expected) => {
    fill(date, future)
    fill(time, '12:00')
    fill(people, count)
    await settle()
    form.requestSubmit()
    await settle()
    const error = document.getElementById('reservation-people-error')
    check(Boolean(error) === expected && people.getAttribute('aria-invalid') === String(expected), label)
    if (expected) {
      check(!status() && document.activeElement === people && people.getAttribute('aria-describedby').includes('reservation-people-error'), `${label}: foco, error asociado y sin revisión`)
    } else {
      check(status().includes(`para ${Number(count)} ${Number(count) === 1 ? 'persona.' : 'personas.'}`) && status().includes('no se ha enviado ni confirmado'), `${label}: cantidad revisada localmente`)
    }
  }
  check(people.type === 'number' && people.required && people.min === '1' && people.step === '1', 'Campo numérico obligatorio y entero positivo')
  check(people.max === '10', 'Máximo nativo de diez personas')
  check(!form.textContent.includes('120') && !form.textContent.includes('pendientes de confirmar') && !form.textContent.includes('aforo'), 'Aforo y pendientes internos ausentes del formulario')
  await submit('Cantidad vacía', '', true)
  await submit('Cero rechazado', '0', true)
  await submit('Negativo rechazado', '-1', true)
  await submit('Decimal rechazado', '1.5', true)
  await submit('Exponente rechazado', '1e2', true)
  await submit('Entero inseguro rechazado', '9007199254740992', true)
  await submit('Una persona aceptada', '1', false)
  await submit('Grupo de cuatro aceptado', '4', false)
  await submit('Máximo de diez aceptado', '10', false)
  await submit('Once personas rechazadas', '11', true)
  await submit('Aforo no permite saltar máximo por reserva', '120', true)
  fill(people, '5')
  await settle()
  check(!status(), 'Editar personas retira la revisión anterior')
  await submit('Corregir a cinco permite revisar', '5', false)
  fill(date, '2000-01-01')
  await settle()
  form.requestSubmit()
  await settle()
  check(Boolean(document.getElementById('reservation-date-error')) && !status(), 'Regresión: fecha pasada rechazada con personas válidas')
  fill(date, future)
  fill(time, '18:00')
  await settle()
  form.requestSubmit()
  await settle()
  check(Boolean(document.getElementById('reservation-time-error')) && !status(), 'Regresión: cierre rechazado con personas válidas')
  await submit('Revisión final válida', '4', false)
  check(document.documentElement.scrollWidth <= innerWidth, 'Sin desbordamiento horizontal')
  return { casos: results.length, resultados: results, fechaPrueba: new Date().toISOString(), viewport: [innerWidth, innerHeight], navegador: navigator.userAgent, maximoProvisionalAutorizado: 10 }
}
