import type { MenuCategory } from '../types/menu'
import MenuIcon from './MenuIcon'

type CategoryOption = MenuCategory & { count: number }
interface Props {
  categories: CategoryOption[]
  selectedCategory: string
  totalCount: number
  onSelect: (categoryId: string) => void
}

const groups = [
  { name: 'Del mar', ids: ['leches', 'copones', 'cebiches-tradicionales', 'cebiches', 'conchas-negras', 'tiraditos', 'duos', 'causas', 'chicharrones', 'jalea', 'arroces', 'parihuelas', 'sudados', 'chilcanos', 'pescados', 'parrilla', 'risottos'] },
  { name: 'Cocina peruana', ids: ['cecina', 'fetuchinis', 'pollo', 'norte', 'sur', 'centro', 'criolla', 'tacu-tacus', 'panceta'] },
  { name: 'Para compartir', ids: ['piqueos', 'piqueos-dos', 'postres'] },
  { name: 'Para brindar', ids: ['bebidas', 'infusiones', 'cervezas', 'pisco', 'sangria', 'vinos'] },
]

export default function MenuCategories({ categories, selectedCategory, totalCount, onSelect }: Props) {
  function categoryButton(id: string, name: string, count: number) {
    return (
      <button type="button" className="category-button" aria-pressed={selectedCategory === id}
        onClick={() => onSelect(id)}>
        <span>{name}</span><span className="category-count">{count}</span>
      </button>
    )
  }

  return (
    <aside className="menu-sidebar" aria-label="Filtros de la carta">
      <div className="category-title"><MenuIcon name="filter" /><h2>Explora la carta</h2></div>
      <div className="mobile-category-select">
        <label htmlFor="menu-category">Categoría</label>
        <div className="category-select-wrap">
          <select id="menu-category" value={selectedCategory} onChange={(event) => onSelect(event.target.value)}>
            <option value="all">Todas las categorías ({totalCount})</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name} ({category.count})</option>
            ))}
          </select>
          <MenuIcon name="chevron" />
        </div>
      </div>
      <nav className="category-options" aria-label="Filtrar por categoría">
        {categoryButton('all', 'Toda la carta', totalCount)}
        {groups.map((group) => (
          <div className="category-group" key={group.name}>
            <h3>{group.name}</h3>
            <ul>
              {group.ids.map((id) => {
                const category = categories.find((item) => item.id === id)
                return category && <li key={id}>{categoryButton(id, category.name, category.count)}</li>
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="mobile-category-shortcuts" aria-label="Categorías frecuentes">
        {categoryButton('all', 'Todo', totalCount)}
        {categories.filter((category) => ['cebiches', 'causas', 'norte', 'bebidas'].includes(category.id))
          .map((category) => <div key={category.id}>{categoryButton(category.id, category.name, category.count)}</div>)}
      </div>
    </aside>
  )
}
