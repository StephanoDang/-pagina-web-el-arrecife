import type { MenuCategory } from '../types/menu'

export default function CategoryList({ categories }: { categories: MenuCategory[] }) {
  return (
    <nav className="menu-categories" aria-label="Categorías de la carta">
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            <a href={`#category-${category.id}`}>{category.name}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
