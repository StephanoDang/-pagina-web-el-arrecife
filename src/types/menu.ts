export interface MenuCategory {
  id: string
  name: string
}

export interface DishPresentation {
  id: string
  name: string
  /** Precio en céntimos de sol: 3500 equivale a S/ 35.00. */
  priceInCents: number
}

export interface Dish {
  id: string
  categoryId: MenuCategory['id']
  /** Secciones adicionales del PDF que ofrecen el mismo producto y precio. */
  additionalCategoryIds?: MenuCategory['id'][]
  name: string
  description: string
  available: boolean
  image?: {
    src: string
    alt: string
  }
  /** Al menos una presentación; usar «Única» cuando solo haya un precio. */
  presentations: [DishPresentation, ...DishPresentation[]]
}
