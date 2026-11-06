import { useMemo, useState, type FormEvent } from 'react'
import type { Dish } from '../../types/menu'
import { menuCategories, menuDishes } from '../../data/menu'
import AdminButton from './components/AdminButton'
import AdminModal from './components/AdminModal'
import AdminTable, { type AdminTableColumn } from './components/AdminTable'
import { parseAdminDishPrice, validateAdminDishForm, type AdminDishFormErrors, type AdminDishFormValues } from './adminDishForm'
import { setAdminDishAvailability, updateAdminDish } from './adminDishState'
import './AdminDishManagementPage.css'

const initialForm: AdminDishFormValues = { name: '', categoryId: '', price: '', description: '' }
const priceFormat = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

function formatPrice(priceInCents: number) {
  return priceFormat.format(priceInCents / 100)
}

export default function AdminDishManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [editingDishId, setEditingDishId] = useState<string | null>(null)
  const [dishPendingDeactivation, setDishPendingDeactivation] = useState<Dish | null>(null)
  const [errors, setErrors] = useState<AdminDishFormErrors>({})
  const [dishes, setDishes] = useState<Dish[]>(menuDishes)
  const [announcement, setAnnouncement] = useState('')

  const columns = useMemo<AdminTableColumn<Dish>[]>(() => [
    { key: 'name', header: 'Plato', render: (dish) => <strong>{dish.name}</strong> },
    {
      key: 'category',
      header: 'Categoría',
      render: (dish) => menuCategories.find((category) => category.id === dish.categoryId)?.name ?? 'Sin categoría',
    },
    {
      key: 'price',
      header: 'Precio desde',
      render: (dish) => formatPrice(dish.presentations[0].priceInCents),
    },
    {
      key: 'availability',
      header: 'Disponibilidad',
      render: (dish) => <span className={`admin-dish-status${dish.available ? '' : ' is-unavailable'}`}>{dish.available ? 'Disponible' : 'Desactivado'}</span>,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (dish) => (
        <div className="admin-dish-actions">
          <AdminButton onClick={() => startEditing(dish)}>Editar</AdminButton>
          {dish.available
            ? <AdminButton onClick={() => setDishPendingDeactivation(dish)} variant="danger">Desactivar</AdminButton>
            : <AdminButton onClick={() => restoreDish(dish)}>Reactivar</AdminButton>}
        </div>
      ),
    },
  ], [])

  function closeModal() {
    setIsModalOpen(false)
    setEditingDishId(null)
    setErrors({})
  }

  function updateField(field: keyof AdminDishFormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function startEditing(dish: Dish) {
    setForm({
      name: dish.name,
      categoryId: dish.categoryId,
      price: (dish.presentations[0].priceInCents / 100).toFixed(2),
      description: dish.description,
    })
    setEditingDishId(dish.id)
    setErrors({})
    setIsModalOpen(true)
  }

  function restoreDish(dish: Dish) {
    setDishes((current) => setAdminDishAvailability(current, dish.id, true))
    setAnnouncement(`${dish.name} se reactivó en esta vista de demostración.`)
  }

  function confirmDeactivation() {
    if (!dishPendingDeactivation) return
    const dish = dishPendingDeactivation
    setDishes((current) => setAdminDishAvailability(current, dish.id, false))
    setDishPendingDeactivation(null)
    setAnnouncement(`${dish.name} se desactivó en esta vista de demostración.`)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationErrors = validateAdminDishForm(form, menuCategories)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const priceInCents = parseAdminDishPrice(form.price)
    if (priceInCents === null) return

    if (editingDishId) {
      setDishes((current) => updateAdminDish(current, editingDishId, form, priceInCents))
      setAnnouncement(`${form.name.trim()} se actualizó. Se conservó el identificador del plato.`)
    } else {
      const newDish: Dish = {
        id: crypto.randomUUID(),
        categoryId: form.categoryId,
        name: form.name.trim(),
        description: form.description.trim(),
        available: true,
        presentations: [{ id: 'unica', name: 'Única', priceInCents }],
      }
      setDishes((current) => [...current, newDish])
      setAnnouncement(`${newDish.name} se añadió a esta vista de demostración.`)
    }
    setForm(initialForm)
    closeModal()
  }

  return (
    <section className="admin-dishes-page" aria-labelledby="admin-dishes-title">
      <header className="admin-dishes-heading">
        <div>
          <p className="admin-eyebrow">CONTENIDO · DEMOSTRACIÓN</p>
          <h2 id="admin-dishes-title">Gestión de platos</h2>
          <p>Edita, desactiva y reactiva platos de ejemplo. Los cambios solo duran mientras esta vista está abierta.</p>
        </div>
        <AdminButton onClick={() => { setForm(initialForm); setEditingDishId(null); setIsModalOpen(true) }}>Nuevo plato</AdminButton>
      </header>

      <p className="admin-dishes-notice">Datos de demostración: los cambios no modifican la carta pública ni se guardan.</p>
      {announcement && <p className="admin-dishes-announcement" role="status">{announcement}</p>}

      <AdminTable
        caption="Platos de demostración"
        columns={columns}
        emptyMessage="No hay platos para mostrar. Usa «Nuevo plato» para comenzar."
        getRowKey={(dish) => dish.id}
        rows={dishes}
      />

      <AdminModal footer={(
        <>
          <AdminButton onClick={closeModal} variant="secondary">Cancelar</AdminButton>
          <AdminButton form="admin-dish-form" type="submit">{editingDishId ? 'Guardar cambios' : 'Guardar plato'}</AdminButton>
        </>
      )} onClose={closeModal} open={isModalOpen} title={editingDishId ? 'Editar plato' : 'Nuevo plato'}>
        <form className="admin-dish-form" id="admin-dish-form" noValidate onSubmit={handleSubmit}>
          <div className="admin-dish-field">
            <label htmlFor="admin-dish-name">Nombre del plato <span aria-hidden="true">*</span></label>
            <input aria-describedby={errors.name ? 'admin-dish-name-error' : undefined} aria-invalid={Boolean(errors.name)} autoComplete="off" id="admin-dish-name" maxLength={80} onChange={(event) => updateField('name', event.target.value)} required value={form.name} />
            {errors.name && <p className="admin-dish-field-error" id="admin-dish-name-error" role="alert">{errors.name}</p>}
          </div>

          <div className="admin-dish-field">
            <label htmlFor="admin-dish-category">Categoría <span aria-hidden="true">*</span></label>
            <select aria-describedby={errors.categoryId ? 'admin-dish-category-error' : undefined} aria-invalid={Boolean(errors.categoryId)} id="admin-dish-category" onChange={(event) => updateField('categoryId', event.target.value)} required value={form.categoryId}>
              <option value="">Selecciona una categoría</option>
              {menuCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            {errors.categoryId && <p className="admin-dish-field-error" id="admin-dish-category-error" role="alert">{errors.categoryId}</p>}
          </div>

          <div className="admin-dish-field">
            <label htmlFor="admin-dish-price">Precio de la primera presentación (S/) <span aria-hidden="true">*</span></label>
            <input aria-describedby={errors.price ? 'admin-dish-price-error' : 'admin-dish-price-hint'} aria-invalid={Boolean(errors.price)} id="admin-dish-price" inputMode="decimal" onChange={(event) => updateField('price', event.target.value)} placeholder="0.00" required value={form.price} />
            {errors.price
              ? <p className="admin-dish-field-error" id="admin-dish-price-error" role="alert">{errors.price}</p>
              : <p className="admin-dish-field-hint" id="admin-dish-price-hint">Usa hasta dos decimales. También puedes escribir coma decimal. Las demás presentaciones se conservan.</p>}
          </div>

          <div className="admin-dish-field">
            <label htmlFor="admin-dish-description">Descripción <span>(opcional)</span></label>
            <textarea id="admin-dish-description" maxLength={240} onChange={(event) => updateField('description', event.target.value)} rows={3} value={form.description} />
          </div>
        </form>
      </AdminModal>

      <AdminModal
        footer={(
          <>
            <AdminButton onClick={() => setDishPendingDeactivation(null)} variant="secondary">Cancelar</AdminButton>
            <AdminButton onClick={confirmDeactivation} variant="danger">Desactivar plato</AdminButton>
          </>
        )}
        onClose={() => setDishPendingDeactivation(null)}
        open={dishPendingDeactivation !== null}
        title="Confirmar desactivación"
      >
        <p className="admin-dish-confirmation">¿Quieres desactivar <strong>{dishPendingDeactivation?.name}</strong>? No aparecerá como disponible y podrás reactivarlo después.</p>
      </AdminModal>
    </section>
  )
}
