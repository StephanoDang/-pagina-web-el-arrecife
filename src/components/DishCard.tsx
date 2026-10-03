import type { Dish } from '../types/menu'

const priceFormat = new Intl.NumberFormat('es-PE', {
  style: 'currency', currency: 'PEN',
})

export default function DishCard({ dish, categoryId }: { dish: Dish; categoryId: string }) {
  const headingId = `dish-${categoryId}-${dish.id}`
  return (
    <article className="dish-card" aria-labelledby={headingId}>
      {dish.image && (
        <img className="dish-image" src={dish.image.src} alt={dish.image.alt} loading="lazy" />
      )}
      <div className="dish-content">
        <h3 id={headingId}>{dish.name}</h3>
        {dish.description && <p className="dish-description">{dish.description}</p>}
        {!dish.available && <p className="dish-unavailable">No disponible por el momento</p>}
        <dl className="dish-prices">
          {dish.presentations.map((presentation) => (
            <div className="dish-price-row" key={presentation.id}>
              <dt>{presentation.name}</dt>
              <dd>{priceFormat.format(presentation.priceInCents / 100)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  )
}
