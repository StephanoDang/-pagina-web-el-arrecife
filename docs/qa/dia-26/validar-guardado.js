async () => {
  const results = []
  const date = document.getElementById('reservation-date')
  const time = document.getElementById('reservation-time')
  const people = document.getElementById('reservation-people')
  const form = document.querySelector('.reservation-form')
  const settle = async () => { for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame) }
  const check = (ok, caso) => { if (!ok) throw new Error(caso); results.push({ caso, resultado: 'correcto' }) }
  const fill = (field, value) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(field, value)
    field.dispatchEvent(new Event('input', { bubbles: true }))
  }
  const future = new Date(Date.now() + 172800000).toISOString().slice(0,10)
  localStorage.removeItem('el-arrecife:reservation-draft:v1')
  await settle()
  check(!document.querySelector('.reservation-summary'), 'Sin confirmación antes de guardar')
  fill(date, future); fill(time, '12:30'); fill(people, '4')
  form.requestSubmit(); await settle()
  let raw = localStorage.getItem('el-arrecife:reservation-draft:v1')
  let draft = JSON.parse(raw)
  check(draft.version === 1 && draft.status === 'draft' && /^res-[0-9a-f-]{36}$/i.test(draft.id), 'Guarda borrador versionado con ID')
  check(draft.date === future && draft.time === '12:30' && draft.people === 4, 'Persiste fecha, hora y cantidad correctas')
  check(document.querySelector('.reservation-status').textContent.includes('no se ha enviado')
    && document.querySelector('.reservation-summary').textContent.includes(draft.id)
    && document.querySelector('.reservation-summary').textContent.includes('12:30')
    && !document.querySelector('.reservation-summary').textContent.includes('120'), 'Resumen claro, local y sin datos internos del aforo')
  check(!document.getElementById('reservation-error'), 'No muestra error de guardado')
  check(document.documentElement.scrollWidth <= innerWidth, 'Sin desbordamiento horizontal')
  return { casos: results.length, resultados: results, fechaPrueba: new Date().toISOString(), viewport: [innerWidth, innerHeight], navegador: navigator.userAgent, id: draft.id }
}
