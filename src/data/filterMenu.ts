import type { Dish, MenuCategory } from '../types/menu'

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

/** Busca todas las palabras, sin distinguir tildes, mayúsculas ni puntuación. */
export function matchesMenuSearch(dish: Dish, categoryName: string, query: string): boolean {
  const words = normalize(query).split(' ').filter(Boolean)
  const text = normalize([
    dish.name, dish.description, categoryName,
    ...dish.presentations.map((option) => option.name),
  ].join(' '))
  return words.every((word) => text.includes(word))
}

export function filterMenu(
  categories: MenuCategory[],
  getDishes: (categoryId: string) => Dish[],
  query: string,
  selectedCategory: string,
) {
  const matches = categories.map((category) => ({
    ...category,
    dishes: getDishes(category.id).filter((dish) => matchesMenuSearch(dish, category.name, query)),
  }))
  const sections = matches.filter((category) =>
    category.dishes.length > 0 && (selectedCategory === 'all' || category.id === selectedCategory))
  return {
    sections,
    categories: matches.map(({ id, name, dishes }) => ({ id, name, count: dishes.length })),
    totalMatches: new Set(matches.flatMap((category) => category.dishes.map((dish) => dish.id))).size,
    resultCount: new Set(sections.flatMap((category) => category.dishes.map((dish) => dish.id))).size,
  }
}
