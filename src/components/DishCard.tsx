import type { Dish } from '../types/menu'
import MenuIcon from './MenuIcon'

const priceFormat = new Intl.NumberFormat('es-PE', {
  style: 'currency', currency: 'PEN',
})

export default function DishCard({ dish, categoryId, categoryName }: { dish: Dish; categoryId: string; categoryName: string }) {
  const headingId = `dish-${categoryId}-${dish.id}`
  const minimumPrice = Math.min(...dish.presentations.map((option) => option.priceInCents))
  const hasOptions = dish.presentations.length > 1
  const priceRows = (
    <dl className="dish-prices">
      {dish.presentations.map((presentation) => (
        <div className="dish-price-row" key={presentation.id}>
          <dt>{presentation.name === 'Única' ? 'Precio' : presentation.name}</dt>
          <dd>{priceFormat.format(presentation.priceInCents / 100)}</dd>
        </div>
      ))}
    </dl>
  )
  return (
    <article className="dish-card" aria-labelledby={headingId}>
      {dish.image && (
        <img className="dish-image" src={dish.image.src} alt={dish.image.alt} loading="lazy" />
      )}
      <div className="dish-content">
        <p className="visually-hidden">{categoryName}</p>
        <h4 id={headingId}>{dish.name}</h4>
        {dish.description && <p className="dish-description">{dish.description}</p>}
        {!dish.available && <p className="dish-unavailable">No disponible por el momento</p>}
        <div className="dish-footer">
          {hasOptions ? (
            <details className="dish-options">
              <summary>
                <span className="dish-options-label">{dish.presentations.length} opciones<MenuIcon name="chevron" /></span>
                <span className="dish-from-price"><small>Desde</small>{priceFormat.format(minimumPrice / 100)}</span>
                <span className="visually-hidden"> de {dish.name}</span>
              </summary>
              {priceRows}
            </details>
          ) : priceRows}
        </div>
      </div>
    </article>
  )
}
