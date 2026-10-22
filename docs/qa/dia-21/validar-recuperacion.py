"""Con Vite en 127.0.0.1:5174 y chrome-devtools configurado: python3 este_archivo.py.
Abre un contexto aislado y usa exclusivamente datos ficticios.
"""
import json
import re
import uuid
import subprocess
from pathlib import Path

results = []
def cli(*args):
    result = subprocess.run(['chrome-devtools', *args], capture_output=True, text=True, check=True)
    return result.stdout

def check(label, body):
    script = "async () => { const assert = (v) => { if (!v) throw new Error('Fallo de comprobación'); }; const settle = async () => { for(let i=0;i<5;i++) await new Promise(requestAnimationFrame); }; " + body + "; return 'QA_OK'; }"
    output = cli('evaluate_script', script, '--pageId', page_id)
    if 'QA_OK' not in output:
        raise RuntimeError(label + ': ' + output)
    results.append({'caso': label, 'resultado': 'correcto'})

def reload(**kwargs):
    args = ['navigate_page', page_id, '--type', 'reload']
    for key, value in kwargs.items(): args += ['--' + key, value]
    cli(*args)

page_output = cli('new_page', 'http://127.0.0.1:5174/pedidos', '--isolatedContext', 'recuperacion-' + uuid.uuid4().hex)
page_id = re.search(r'^(\d+):.*\[selected\]', page_output, re.M)[1]
check('Sin borrador: formulario vacío y sin resumen', "assert(!document.querySelector('.order-summary')); assert(document.querySelector('#customer-name').value === '');")
check('Preparar orden de ejemplo con dos unidades', """
const {createOrderDraft,ORDER_DRAFT_KEY} = await import('/src/data/orderDraft.ts');
const {menuDishes} = await import('/src/data/menu.ts');
const dish=menuDishes.find(d=>d.available);
const draft=createOrderDraft([{dishId:dish.id,presentationId:dish.presentations[0].id,quantity:2}],{name:'Ana Prueba',phone:'999888777',deliveryMethod:'delivery',address:'Calle Prueba 123'});
localStorage.setItem(ORDER_DRAFT_KEY,JSON.stringify(draft));
""")
reload()
check('Recarga: cliente, dirección, cantidades, total y carrito recuperados', """
const draft=JSON.parse(localStorage.getItem('el-arrecife:order-draft:v1'));
assert(document.querySelector('#customer-name').value==='Ana Prueba');
assert(document.querySelector('#customer-address').value==='Calle Prueba 123');
assert(document.querySelector('.order-status').textContent.includes('recuperado'));
assert(document.querySelector('.order-summary').textContent.includes('Cantidad: 2'));
assert(document.querySelector('.cart-items').textContent.includes(draft.items[0].name));
assert(document.querySelector('.order-summary').textContent.includes(new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(draft.productsTotalInCents/100)));
""")
check('Editar oculta resumen y reenviar guarda datos actualizados', """
const input=document.querySelector('#customer-name');
Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'Ana Editada');
input.dispatchEvent(new Event('input',{bubbles:true})); await settle();
assert(!document.querySelector('.order-summary'));
document.querySelector('.order-form').requestSubmit(); await settle();
assert(JSON.parse(localStorage.getItem('el-arrecife:order-draft:v1')).customer.name==='Ana Editada');
assert(document.querySelector('.order-status').textContent.includes('guardado'));
""")
reload()
check('Segunda recarga conserva la edición guardada', "assert(document.querySelector('#customer-name').value==='Ana Editada'); assert(document.querySelector('.order-summary'));")
check('Guardar recojo excluye dirección', """
document.querySelector('input[value=pickup]').click(); await settle();
document.querySelector('.order-form').requestSubmit(); await settle();
const d=JSON.parse(localStorage.getItem('el-arrecife:order-draft:v1'));
assert(d.customer.deliveryMethod==='pickup'); assert(!Object.hasOwn(d.customer,'address'));
""")
reload()
check('Recuperar recojo mantiene dirección oculta y resumen', "assert(document.querySelector('input[value=pickup]').checked); assert(document.querySelector('#customer-address').disabled); assert(!document.querySelector('#customer-address').getClientRects().length); assert(document.querySelector('.order-summary'));")
check('Fallo al guardar no muestra confirmación de guardado', """
Storage.prototype.setItem = () => { throw new DOMException('Bloqueado','QuotaExceededError'); };
document.querySelector('.order-form').requestSubmit(); await settle();
assert(document.querySelector('[role=alert]').textContent.includes('No se pudo guardar'));
assert(!document.querySelector('.order-status').textContent.includes('guardado'));
""")
reload(initScript="Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Bloqueado','SecurityError')}})")
check('Lectura bloqueada informa error y permite formulario vacío', "assert(document.querySelector('[role=alert]').textContent.includes('No se pudo leer')); assert(!document.querySelector('.order-summary')); assert(document.querySelector('#customer-name').value==='');")
reload()
check('Preparar JSON corrupto', "localStorage.setItem('el-arrecife:order-draft:v1','{');")
reload()
check('JSON corrupto no bloquea la página ni recupera carrito parcial', "assert(document.querySelector('[role=alert]').textContent.includes('No se recuperó')); assert(!document.querySelector('.order-summary')); assert(document.querySelector('.cart-empty')); localStorage.removeItem('el-arrecife:order-draft:v1');")
reload()
check('Sin borrador después de limpiar: sin errores de recuperación', "assert(!document.querySelector('[role=alert]')); assert(!document.querySelector('.order-summary'));")
Path(__file__).with_name('resultados.json').write_text(json.dumps(results, ensure_ascii=False, indent=2)+'\n')
print(f'{len(results)} comprobaciones correctas')
