import CategoryList from '../components/CategoryList'
import DishCard from '../components/DishCard'
import { menuCategories, menuDishes } from '../data/menu'
import './MenuPage.css'

export default function MenuPage() {
  return (
    <div className="menu-page site-container">
      <header className="menu-heading">
        <p className="menu-eyebrow">El Arrecife de Mamafé</p>
        <h1>Nuestra carta</h1>
        <p>Sabores del mar y de la cocina peruana.</p>
        <p className="menu-notice">Selección inicial de nuestra carta. Precios en soles, iguales en ambas sedes.</p>
      </header>
      <CategoryList categories={menuCategories} />
      {menuCategories.map((category) => (
        <section className="menu-section" key={category.id} aria-labelledby={`category-${category.id}`}>
          <h2 id={`category-${category.id}`} tabIndex={-1}>{category.name}</h2>
          <div className="dish-grid">
            {menuDishes.filter((dish) => dish.categoryId === category.id).map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
