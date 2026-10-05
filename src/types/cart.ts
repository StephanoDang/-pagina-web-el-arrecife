import type { Dish, DishPresentation } from './menu'

export interface CartItem {
  dishId: Dish['id']
  presentationId: DishPresentation['id']
  quantity: number
}

export interface CartState {
  items: readonly CartItem[]
}
