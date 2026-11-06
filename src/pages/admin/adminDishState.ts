import type { Dish } from '../../types/menu'
import type { AdminDishFormValues } from './adminDishForm'

export function updateAdminDish(dishes: Dish[], dishId: string, values: AdminDishFormValues, priceInCents: number): Dish[] {
  return dishes.map((dish) => {
    if (dish.id !== dishId) return dish
    const [firstPresentation, ...otherPresentations] = dish.presentations
    return {
      ...dish,
      categoryId: values.categoryId,
      name: values.name.trim(),
      description: values.description.trim(),
      presentations: [{ ...firstPresentation, priceInCents }, ...otherPresentations],
    }
  })
}

export function setAdminDishAvailability(dishes: Dish[], dishId: string, available: boolean): Dish[] {
  return dishes.map((dish) => dish.id === dishId ? { ...dish, available } : dish)
}
