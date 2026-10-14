async () => {
  // Ejecutar en /pedidos mediante chrome-devtools evaluate_script.
  // Datos ficticios; prueba la validación React real con eventos DOM sintéticos.
  const results = []
  const field = (name) => document.getElementById(`customer-${name}`)
  const settle = async () => {
    for (let i = 0; i < 3; i++) await new Promise(requestAnimationFrame)
  }
  const fill = (name, value) => {
    const element = field(name)
    const prototype = name === `address` ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(prototype, `value`).set.call(element, value)
    element.dispatchEvent(new Event(`input`, { bubbles: true }))
  }
  const check = (condition, message) => { if (!condition) throw new Error(message) }
  const run = async (label, values, expectedErrors) => {
    for (const [name, value] of Object.entries(values)) fill(name, value)
    await settle()
    document.querySelector(`.order-form`).requestSubmit()
    await settle()
    const errors = [...document.querySelectorAll(`.order-error`)]
    const actual = errors.map(error => error.id.replace(`customer-`, ``).replace(`-error`, ``))
    check(JSON.stringify(actual) === JSON.stringify(expectedErrors), `${label}: errores ${actual}`)
    for (const name of [`name`, `phone`, `address`]) {
      const invalid = expectedErrors.includes(name)
      check(field(name).getAttribute(`aria-invalid`) === String(invalid), `${label}: aria-invalid ${name}`)
      if (invalid) {
        check(field(name).getAttribute(`aria-describedby`).split(` `).includes(`customer-${name}-error`), `${label}: error sin asociar`)
        check(document.getElementById(`customer-${name}-error`).getAttribute(`role`) === `alert`, `${label}: error sin alert`)
      }
    }
    const status = document.querySelector(`.order-status`).textContent
    check(expectedErrors.length ? status === `` : status.includes(`todavía no se ha enviado`), `${label}: estado incorrecto`)
    if (expectedErrors.length) check(document.activeElement.id === `customer-${expectedErrors[0]}`, `${label}: foco incorrecto`)
    results.push({ caso: label, errores: errors.map(error => error.textContent), resultado: `correcto` })
  }
  const valid = { name: `Ana Pérez`, phone: `987654321`, address: `Calle de Prueba 123, Comas` }
  await run(`Campos vacíos`, { name: ``, phone: ``, address: `` }, [`name`, `phone`, `address`])
  await run(`Solo espacios`, { name: `   `, phone: `   `, address: `   ` }, [`name`, `phone`, `address`])
  for (const phone of [`abc`, `123456`, `1234567890123456`, `+51 987ABC321`, `++51987654321`, `---`]) {
    await run(`Teléfono inválido: ${phone}`, { ...valid, phone }, [`phone`])
  }
  await run(`Dirección corta`, { ...valid, address: `abcd` }, [`address`])
  await run(`Nombre demasiado largo (inyección DOM)`, { ...valid, name: `A`.repeat(101) }, [`name`])
  await run(`Dirección demasiado larga (inyección DOM)`, { ...valid, address: `A`.repeat(201) }, [`address`])
  await run(`Nombre corto y dirección de 5 caracteres`, { ...valid, name: `李`, address: `A 123` }, [])
  for (const phone of [`1234567`, `123456789012345`, `+51 (987) 654-321`, `987.654.321`]) {
    await run(`Teléfono válido: ${phone}`, { ...valid, phone }, [])
  }
  await run(`Espacios exteriores en datos válidos`, { name: `  Ana Pérez  `, phone: `  987654321  `, address: `  Calle de Prueba 123  ` }, [])
  fill(`name`, `Ana Editada`)
  await settle()
  check(document.querySelector(`.order-status`).textContent === ``, `Editar no retira el aviso de revisión`)
  results.push({ caso: `Editar después de revisar`, resultado: `aviso retirado` })
  await run(`Error de teléfono antes de corregir`, { ...valid, phone: `abc` }, [`phone`])
  fill(`phone`, `987654321`)
  await settle()
  check(!document.getElementById(`customer-phone-error`), `El error no desaparece al corregir`)
  check(field(`phone`).getAttribute(`aria-invalid`) === `false`, `aria-invalid no se actualiza`)
  check(!field(`phone`).getAttribute(`aria-describedby`).includes(`customer-phone-error`), `Referencia a error retirada incorrectamente`)
  check(document.querySelector(`.order-status`).textContent === ``, `Revalidar confirma sin enviar`)
  results.push({ caso: `Corregir sin reenviar`, resultado: `error retirado y sin confirmación automática` })
  return { casos: results.length, resultados: results, navegador: navigator.userAgent }
}
