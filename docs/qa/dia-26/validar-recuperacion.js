async () => {
  const results = []
  const check = (ok, caso) => { if (!ok) throw new Error(caso); results.push({ caso, resultado: 'correcto' }) }
  const draft = JSON.parse(localStorage.getItem('el-arrecife:reservation-draft:v1'))
  const summary = document.querySelector('.reservation-summary')
  check(Boolean(draft && summary?.textContent.includes(draft.id)), 'Recupera mismo identificador al recargar')
  check(document.querySelector('.reservation-status').textContent.includes('no se ha enviado'), 'Aclara que el borrador recuperado no se envió')
  const date = document.getElementById('reservation-date')
  const time = document.getElementById('reservation-time')
  const people = document.getElementById('reservation-people')
  const form = document.querySelector('.reservation-form')
  const fill = (field, value) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(field, value)
    field.dispatchEvent(new Event('input', { bubbles: true }))
  }
  const settle = () => new Promise((resolve) => setTimeout(resolve, 120))
  fill(date, draft.date); fill(time, '12:45'); fill(people, String(draft.people))
  await settle()
  check(!document.querySelector('.reservation-summary'), 'Editar retira el resumen anterior')
  form.requestSubmit(); await settle()
  const updated = JSON.parse(localStorage.getItem('el-arrecife:reservation-draft:v1'))
  check(updated.time === '12:45' && updated.id !== draft.id, 'Guarda cambios con nuevo identificador')
  fill(people, '11'); await settle(); form.requestSubmit(); await settle()
  check(Boolean(document.querySelector('#reservation-people-error')) && !document.querySelector('.reservation-summary'), 'Rechaza once y no muestra resumen válido')
  fill(date, updated.date); fill(time, updated.time); fill(people, String(updated.people)); await settle()
  const storage = Storage.prototype
  const originalSetItem = storage.setItem
  storage.setItem = function (key, value) {
    if (key === 'el-arrecife:reservation-draft:v1') throw new Error('quota exceeded')
    return originalSetItem.call(this, key, value)
  }
  try {
    form.requestSubmit(); await settle()
    check(document.querySelector('[role=alert]')?.textContent.includes('No se pudo guardar'), 'Explica fallo de escritura local')
    check(!document.querySelector('.reservation-summary'), 'Fallo local no muestra una reserva nueva como guardada')
  } finally { storage.setItem = originalSetItem }
  check(document.documentElement.scrollWidth <= innerWidth, 'Sin desbordamiento horizontal')
  return { casos: results.length, resultados: results, id: updated.id, viewport: [innerWidth, innerHeight] }
}
