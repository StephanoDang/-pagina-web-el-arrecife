async () => {
  // Ejecutar en /pedidos recién cargada. Usa datos ficticios y el formulario React real.
  const results = []
  const form = document.querySelector('.order-form')
  const address = document.getElementById('customer-address')
  const status = () => document.querySelector('.order-status').textContent
  const errorNames = () => [...document.querySelectorAll('.order-error')].map(e => e.id)
  const settle = async () => { for (let i = 0; i < 3; i++) await new Promise(requestAnimationFrame) }
  const assert = (condition, label) => { if (!condition) throw new Error(label) }
  const check = (condition, label) => { assert(condition, label); results.push({ caso: label, resultado: 'correcto' }) }
  const fill = (name, value) => {
    const element = document.getElementById(`customer-${name}`)
    const prototype = name === 'address' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value)
    element.dispatchEvent(new Event('input', { bubbles: true }))
  }
  const select = async method => {
    document.querySelector(`input[value=${method}]`).click()
    await settle()
    assert(document.querySelectorAll('.order-delivery-option input:checked').length === 1, 'Selección no exclusiva')
    assert(new FormData(form).get('deliveryMethod') === method, 'Método incorrecto en el formulario')
  }
  const submit = async (label, values, expected) => {
    for (const [name, value] of Object.entries(values)) fill(name, value)
    await settle()
    form.requestSubmit()
    await settle()
    const ids = expected.map(name => `customer-${name}-error`)
    assert(JSON.stringify(errorNames()) === JSON.stringify(ids), `${label}: errores inesperados ${errorNames()}`)
    for (const name of ['name', 'phone', 'address']) {
      const element = document.getElementById(`customer-${name}`)
      assert(element.getAttribute('aria-invalid') === String(expected.includes(name)), `${label}: aria-invalid incorrecto`)
      if (expected.includes(name)) {
        assert(element.getAttribute('aria-describedby').split(' ').includes(`customer-${name}-error`), `${label}: error sin asociar`)
        assert(document.getElementById(`customer-${name}-error`).getAttribute('role') === 'alert', `${label}: error sin alert`)
      }
    }
    assert(expected.length ? !status() : status().includes('todavía no se ha enviado'), `${label}: aviso de revisión incorrecto`)
    if (expected.length) assert(document.activeElement.id === `customer-${expected[0]}`, `${label}: foco incorrecto`)
    results.push({ caso: label, resultado: 'correcto', errores: ids })
  }
  const valid = { name: 'Ana Prueba', phone: '+51 (987) 654-321', address: 'Calle de Prueba 123, Comas' }
  const cost = document.getElementById('delivery-cost-info')
  check(new FormData(form).get('deliveryMethod') === 'delivery' && !address.disabled && address.required, 'Delivery inicial exige dirección')
  check(cost.textContent.includes('pendiente de confirmar') && cost.getAttribute('role') === 'status' && cost.getAttribute('aria-atomic') === 'true'
    && document.querySelector('.order-delivery-method').getAttribute('aria-describedby').split(' ').includes(cost.id), 'Aviso de tarifa pendiente asociado y accesible')
  await submit('Delivery vacío', { name: '', phone: '', address: '' }, ['name', 'phone', 'address'])
  await submit('Delivery con solo espacios', { name: '   ', phone: '   ', address: '   ' }, ['name', 'phone', 'address'])
  await submit('Delivery con contacto válido y dirección vacía', { ...valid, address: '' }, ['address'])
  await submit('Delivery con dirección de 4 caracteres', { ...valid, address: 'abcd' }, ['address'])
  await submit('Delivery con dirección de 5 caracteres', { ...valid, address: 'A 123' }, [])
  await submit('Delivery con dirección de 200 caracteres', { ...valid, address: 'A'.repeat(200) }, [])
  await submit('Delivery con dirección de 201 caracteres inyectados', { ...valid, address: 'A'.repeat(201) }, ['address'])
  await select('pickup')
  check(address.disabled && !address.required && !address.getClientRects().length && !document.getElementById('customer-address-error'), 'Pasar a recojo limpia error y oculta/deshabilita dirección')
  check(!new FormData(form).has('address'), 'Recojo excluye dirección de FormData')
  check(cost.textContent.includes('Recojo en tienda') && !cost.textContent.includes('Costo de delivery'), 'Aviso de recojo reemplaza aviso de delivery')
  await submit('Recojo con dirección larga anterior no bloquea revisión', { name: valid.name, phone: valid.phone }, [])
  await select('delivery')
  check(!status() && address.value.length === 201 && !address.disabled && address.required, 'Volver a delivery conserva texto y retira revisión anterior')
  await submit('Volver a delivery reactiva validación de longitud', {}, ['address'])
  await submit('Corregir dirección para delivery', valid, [])
  await select('pickup')
  check(!status(), 'Cambiar método retira aviso de revisión válida')
  await submit('Recojo con nombre y teléfono vacíos', { name: '', phone: '' }, ['name', 'phone'])
  await submit('Recojo con teléfono inválido', { name: valid.name, phone: 'abc' }, ['phone'])
  fill('phone', valid.phone)
  await settle()
  check(!document.getElementById('customer-phone-error') && !status(), 'Corrección en recojo revalida sin confirmar automáticamente')
  await submit('Recojo con contacto válido y dirección vacía', { ...valid, address: '' }, [])
  await select('delivery')
  await submit('Dirección vacía sigue siendo obligatoria al volver a delivery', {}, ['address'])
  await select('pickup')
  await submit('Dirección corta oculta no bloquea recojo', { ...valid, address: 'abcd' }, [])
  await select('delivery')
  check(address.value === 'abcd', 'Se conserva dirección corta al alternar métodos')
  await submit('Delivery exige corregir dirección corta conservada', {}, ['address'])
  await submit('Delivery admite espacios exteriores y teléfono con formato', { name: '  Ana Prueba  ', phone: '  +51 (987) 654-321  ', address: '  Calle de Prueba 123  ' }, [])
  fill('name', 'Ana Editada')
  await settle()
  check(!status(), 'Editar contacto retira aviso de revisión')
  for (let i = 0; i < 3; i++) {
    await select('pickup')
    await select('delivery')
  }
  check(address.value === '  Calle de Prueba 123  ' && !address.disabled && address.required && cost.textContent.includes('pendiente de confirmar'), 'Alternar repetidamente mantiene texto, método y aviso correctos')
  check(!/S\/|gratis|gratuit[oa]/i.test(cost.textContent), 'El aviso no inventa importes ni gratuidad')
  return { fecha: '2026-10-20', casos: results.length, resultados: results, navegador: navigator.userAgent, viewport: [innerWidth, innerHeight] }
}
