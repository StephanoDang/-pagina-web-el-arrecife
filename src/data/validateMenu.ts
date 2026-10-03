import type { Dish, MenuCategory } from '../types/menu'

export function validateMenu(categories: MenuCategory[], dishes: Dish[]): void {
  const categoryIds = new Set<string>()
  const dishIds = new Set<string>()
  const usedCategories = new Set<string>()
  for (const category of categories) {
    if (!category.id || !category.name.trim() || categoryIds.has(category.id)) {
      throw new Error(`Categoría inválida o duplicada: ${category.id}`)
    }
    categoryIds.add(category.id)
  }
  for (const dish of dishes) {
    if (!dish.id || !dish.name.trim() || dishIds.has(dish.id)) {
      throw new Error(`Producto inválido o duplicado: ${dish.id}`)
    }
    dishIds.add(dish.id)
    const memberships = [dish.categoryId, ...(dish.additionalCategoryIds ?? [])]
    if (new Set(memberships).size !== memberships.length) {
      throw new Error(`Categoría repetida en ${dish.id}`)
    }
    for (const categoryId of memberships) {
      if (!categoryIds.has(categoryId)) throw new Error(`Categoría inexistente: ${categoryId}`)
      usedCategories.add(categoryId)
    }
    if (!dish.presentations.length) throw new Error(`Producto sin presentaciones: ${dish.id}`)
    const presentationIds = new Set<string>()
    for (const option of dish.presentations) {
      if (!option.id || !option.name.trim() || presentationIds.has(option.id)) {
        throw new Error(`Presentación inválida o duplicada en ${dish.id}`)
      }
      if (!Number.isSafeInteger(option.priceInCents) || option.priceInCents < 0) {
        throw new Error(`Precio inválido en ${dish.id}: ${option.priceInCents}`)
      }
      presentationIds.add(option.id)
    }
  }
  for (const categoryId of categoryIds) {
    if (!usedCategories.has(categoryId)) throw new Error(`Categoría vacía: ${categoryId}`)
  }
}
