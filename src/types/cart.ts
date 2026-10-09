import type { Dish, DishPresentation } from './menu'

export interface CartItem {
  dishId: Dish['id']
  presentationId: DishPresentation['id']
  quantity: number
}

export interface CartState {
  items: readonly CartItem[]
}

export interface CartContextValue extends CartState {
  addItem: (dishId: Dish['id'], presentationId: DishPresentation['id']) => void
  setQuantity: (dishId: Dish['id'], presentationId: DishPresentation['id'], quantity: number) => void
  removeItem: (dishId: Dish['id'], presentationId: DishPresentation['id']) => void
}
