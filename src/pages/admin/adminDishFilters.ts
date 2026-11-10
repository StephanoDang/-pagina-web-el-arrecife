import type { Dish } from '../../types/menu'

export type AdminDishFilters = { query: string; categoryId: string; availability: 'all' | 'available' | 'unavailable' }

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es')
}

export function filterAdminDishes(dishes: Dish[], filters: AdminDishFilters): Dish[] {
  const words = normalize(filters.query).split(/\s+/).filter(Boolean)
  return dishes.filter((dish) => {
    if (filters.categoryId !== 'all' && dish.categoryId !== filters.categoryId && !dish.additionalCategoryIds?.includes(filters.categoryId)) return false
    if (filters.availability === 'available' && !dish.available) return false
    if (filters.availability === 'unavailable' && dish.available) return false
    const searchable = normalize([dish.name, dish.description, dish.id].join(' '))
    return words.every((word) => searchable.includes(word))
  })
}

export function getPageCount(itemCount: number, pageSize: number): number {
  return Math.max(1, Math.ceil(itemCount / pageSize))
}

export function paginateItems<T>(items: T[], page: number, pageSize: number): T[] {
  return items.slice((page - 1) * pageSize, page * pageSize)
}
