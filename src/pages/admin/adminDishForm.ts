import type { MenuCategory } from '../../types/menu'

export type AdminDishFormValues = {
  name: string
  categoryId: string
  price: string
  description: string
}

export type AdminDishFormErrors = Partial<Record<keyof AdminDishFormValues, string>>

export function parseAdminDishPrice(rawPrice: string): number | null {
  const normalized = rawPrice.trim().replace(',', '.')
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null

  const [wholePart, decimalPart = ''] = normalized.split('.')
  const cents = Number(wholePart) * 100 + Number(decimalPart.padEnd(2, '0'))
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null
}

export function validateAdminDishForm(values: AdminDishFormValues, categories: MenuCategory[]): AdminDishFormErrors {
  const errors: AdminDishFormErrors = {}

  if (!values.name.trim()) errors.name = 'Escribe el nombre del plato.'
  if (!values.categoryId) {
    errors.categoryId = 'Selecciona una categoría.'
  } else if (!categories.some((category) => category.id === values.categoryId)) {
    errors.categoryId = 'Selecciona una categoría válida.'
  }

  if (!values.price.trim()) {
    errors.price = 'Escribe el precio del plato.'
  } else if (parseAdminDishPrice(values.price) === null) {
    errors.price = 'Ingresa un precio mayor que cero con hasta dos decimales.'
  }

  return errors
}
