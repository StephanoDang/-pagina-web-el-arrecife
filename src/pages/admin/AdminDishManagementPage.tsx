import { useMemo, useState, type FormEvent } from 'react'
import type { Dish } from '../../types/menu'
import { menuCategories } from '../../data/menu'
import AdminButton from './components/AdminButton'
import AdminModal from './components/AdminModal'
import AdminTable, { type AdminTableColumn } from './components/AdminTable'
import { parseAdminDishPrice, validateAdminDishForm, type AdminDishFormErrors, type AdminDishFormValues } from './adminDishForm'
import './AdminDishManagementPage.css'

const initialForm: AdminDishFormValues = { name: '', categoryId: '', price: '', description: '' }
const priceFormat = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })

function formatPrice(priceInCents: number) {
  return priceFormat.format(priceInCents / 100)
}

export default function AdminDishManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<AdminDishFormErrors>({})
  const [createdDishes, setCreatedDishes] = useState<Dish[]>([])
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
      header: 'Precio',
      render: (dish) => formatPrice(dish.presentations[0].priceInCents),
    },
    {
      key: 'availability',
      header: 'Disponibilidad',
      render: (dish) => <span className={`admin-dish-status${dish.available ? '' : ' is-unavailable'}`}>{dish.available ? 'Disponible' : 'Desactivado'}</span>,
    },
  ], [])

  function closeModal() {
    setIsModalOpen(false)
    setErrors({})
  }

  function updateField(field: keyof AdminDishFormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationErrors = validateAdminDishForm(form, menuCategories)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const priceInCents = parseAdminDishPrice(form.price)
    if (priceInCents === null) return

    const newDish: Dish = {
      id: crypto.randomUUID(),
      categoryId: form.categoryId,
      name: form.name.trim(),
      description: form.description.trim(),
      available: true,
      presentations: [{ id: 'unica', name: 'Única', priceInCents }],
    }
    setCreatedDishes((current) => [...current, newDish])
    setForm(initialForm)
    closeModal()
    setAnnouncement(`${newDish.name} se añadió a esta vista de demostración.`)
  }

  return (
    <section className="admin-dishes-page" aria-labelledby="admin-dishes-title">
      <header className="admin-dishes-heading">
        <div>
          <p className="admin-eyebrow">CONTENIDO · DEMOSTRACIÓN</p>
          <h2 id="admin-dishes-title">Gestión de platos</h2>
          <p>Prueba el formulario de creación. Los platos añadidos solo se conservan mientras esta vista está abierta.</p>
        </div>
        <AdminButton onClick={() => setIsModalOpen(true)}>Nuevo plato</AdminButton>
      </header>

      <p className="admin-dishes-notice">Datos de demostración: los cambios no modifican la carta pública ni se guardan.</p>
      {announcement && <p className="admin-dishes-announcement" role="status">{announcement}</p>}

      <AdminTable
        caption="Platos añadidos en esta sesión"
        columns={columns}
        emptyMessage="Aún no agregaste platos. Usa «Nuevo plato» para comenzar."
        getRowKey={(dish) => dish.id}
        rows={createdDishes}
      />

      <AdminModal footer={(
        <>
          <AdminButton onClick={closeModal} variant="secondary">Cancelar</AdminButton>
          <AdminButton form="admin-dish-form" type="submit">Guardar plato</AdminButton>
        </>
      )} onClose={closeModal} open={isModalOpen} title="Nuevo plato">
        <form className="admin-dish-form" id="admin-dish-form" noValidate onSubmit={handleSubmit}>
          <div className="admin-dish-field">
            <label htmlFor="admin-dish-name">Nombre del plato <span aria-hidden="true">*</span></label>
            <input
              aria-describedby={errors.name ? 'admin-dish-name-error' : undefined}
              aria-invalid={Boolean(errors.name)}
              autoComplete="off"
              id="admin-dish-name"
              maxLength={80}
              onChange={(event) => updateField('name', event.target.value)}
              required
              value={form.name}
            />
            {errors.name && <p className="admin-dish-field-error" id="admin-dish-name-error" role="alert">{errors.name}</p>}
          </div>

          <div className="admin-dish-field">
            <label htmlFor="admin-dish-category">Categoría <span aria-hidden="true">*</span></label>
            <select
              aria-describedby={errors.categoryId ? 'admin-dish-category-error' : undefined}
              aria-invalid={Boolean(errors.categoryId)}
              id="admin-dish-category"
              onChange={(event) => updateField('categoryId', event.target.value)}
              required
              value={form.categoryId}
            >
              <option value="">Selecciona una categoría</option>
              {menuCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            {errors.categoryId && <p className="admin-dish-field-error" id="admin-dish-category-error" role="alert">{errors.categoryId}</p>}
          </div>

          <div className="admin-dish-field">
            <label htmlFor="admin-dish-price">Precio (S/) <span aria-hidden="true">*</span></label>
            <input
              aria-describedby={errors.price ? 'admin-dish-price-error' : 'admin-dish-price-hint'}
              aria-invalid={Boolean(errors.price)}
              id="admin-dish-price"
              inputMode="decimal"
              onChange={(event) => updateField('price', event.target.value)}
              placeholder="0.00"
              required
              value={form.price}
            />
            {errors.price
              ? <p className="admin-dish-field-error" id="admin-dish-price-error" role="alert">{errors.price}</p>
              : <p className="admin-dish-field-hint" id="admin-dish-price-hint">Usa hasta dos decimales. También puedes escribir coma decimal.</p>}
          </div>

          <div className="admin-dish-field">
            <label htmlFor="admin-dish-description">Descripción <span>(opcional)</span></label>
            <textarea id="admin-dish-description" maxLength={240} onChange={(event) => updateField('description', event.target.value)} rows={3} value={form.description} />
          </div>
        </form>
      </AdminModal>
    </section>
  )
}
