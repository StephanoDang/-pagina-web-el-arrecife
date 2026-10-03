import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import MenuCategories from '../components/MenuCategories'
import DishCard from '../components/DishCard'
import MenuIcon from '../components/MenuIcon'
import { beverageSurchargeNotice, getDishesForCategory, menuCategories, menuDishes } from '../data/menu'
import { filterMenu } from '../data/filterMenu'
import './MenuPage.css'

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQuery = searchParams.get('buscar') ?? ''
  const [searchDraft, setSearchDraft] = useState(urlQuery)
  // La escritura es síncrona; React Router puede actualizar la URL en una transición.
  const query = searchDraft
  const requestedCategory = searchParams.get('categoria') ?? 'all'
  const selectedCategory = menuCategories.some((category) => category.id === requestedCategory)
    ? requestedCategory : 'all'
  const selectedName = menuCategories.find((category) => category.id === selectedCategory)?.name
  const searchRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const { sections, categories, totalMatches, resultCount } = useMemo(
    () => filterMenu(menuCategories, getDishesForCategory, query, selectedCategory),
    [query, selectedCategory],
  )
  const hasFilters = Boolean(query.trim()) || selectedCategory !== 'all'

  useEffect(() => {
    const toolbar = toolbarRef.current
    if (!toolbar) return
    const observer = new ResizeObserver(() => {
      pageRef.current?.style.setProperty('--menu-toolbar-height', `${toolbar.getBoundingClientRect().height}px`)
    })
    observer.observe(toolbar)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const restoreUrlSearch = () => setSearchDraft(new URLSearchParams(window.location.search).get('buscar') ?? '')
    window.addEventListener('popstate', restoreUrlSearch)
    return () => window.removeEventListener('popstate', restoreUrlSearch)
  }, [])

  useEffect(() => {
    // Sincronizar enlaces externos tras la navegación, sin interrumpir la escritura.
    const frame = requestAnimationFrame(() => {
      if (document.activeElement !== searchRef.current) setSearchDraft(urlQuery)
    })
    return () => cancelAnimationFrame(frame)
  }, [urlQuery])

  function updateFilters(nextQuery: string, nextCategory: string) {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      if (nextQuery) next.set('buscar', nextQuery)
      else next.delete('buscar')
      if (nextCategory !== 'all') next.set('categoria', nextCategory)
      else next.delete('categoria')
      return next
    }, { replace: true, preventScrollReset: true })
  }

  function selectCategory(categoryId: string) {
    updateFilters(query, categoryId)
    const toolbarHeight = toolbarRef.current?.getBoundingClientRect().height ?? 90
    if (resultsRef.current && resultsRef.current.getBoundingClientRect().top < toolbarHeight + 16) {
      resultsRef.current.scrollIntoView({ block: 'start', behavior: 'instant' })
    }
  }

  function resetFilters() {
    setSearchDraft('')
    updateFilters('', 'all')
    searchRef.current?.focus({ preventScroll: true })
  }

  return (
    <div className="menu-page" ref={pageRef}>
      <div className="site-container">
        <header className="menu-hero">
          <div className="menu-hero-copy">
            <p className="menu-eyebrow"><span />El Arrecife de Mamafé</p>
            <h1>Nuestra <em>carta.</em></h1>
            <p className="menu-hero-description">Sabores del mar, tradición peruana y algo para cada antojo.</p>
            <div className="menu-hero-meta"><span>Cocina peruana</span><span>Maestro &amp; Retablo</span></div>
          </div>
          <div className="menu-hero-seal" aria-hidden="true">
            <span>EL ARRECIFE</span><MenuIcon name="bowl" /><span>DEL MAR A TU MESA</span>
          </div>
        </header>

        <div className="menu-toolbar" ref={toolbarRef}>
          <div className="menu-toolbar-main">
          <form className="menu-search" role="search" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="menu-search" className="visually-hidden">Buscar en la carta</label>
            <MenuIcon name="search" />
            <input ref={searchRef} id="menu-search" type="search" placeholder="Busca un plato, bebida o ingrediente"
              value={query}
              onChange={(event) => { setSearchDraft(event.target.value); updateFilters(event.target.value, selectedCategory) }}
              autoComplete="off" enterKeyHint="search" aria-controls="menu-results" />
            {query && <button className="search-clear" type="button" aria-label="Limpiar búsqueda"
              onClick={() => { setSearchDraft(''); updateFilters('', selectedCategory); searchRef.current?.focus() }}><MenuIcon name="close" /></button>}
          </form>
          <p className="menu-catalog-size"><strong>{menuDishes.length}</strong> platos y bebidas <span>·</span> {menuCategories.length} categorías</p>
          </div>
          {hasFilters && <div className="menu-filter-status">
            <p><span>{selectedName ?? 'Todas las categorías'}</span><strong>{resultCount} resultados</strong></p>
            <button type="button" className="menu-reset" onClick={resetFilters}>
              <MenuIcon name="close" />Limpiar filtros
            </button>
          </div>}
        </div>

        <div className="menu-layout">
          <MenuCategories categories={categories} selectedCategory={selectedCategory}
            totalCount={totalMatches} onSelect={selectCategory} />
          <div className="menu-results" id="menu-results" ref={resultsRef}>
            <header className="menu-results-heading">
              <div>
                <p className="menu-overline">ENCUENTRA TU FAVORITO</p>
                <h2>{selectedName ?? 'La carta completa'}</h2>
                <p className="menu-result-count" role="status" aria-live="polite" aria-atomic="true">
                  {resultCount} {resultCount === 1 ? 'plato o bebida' : 'platos y bebidas'}
                  {query.trim() && <> para «{query.trim()}»</>}
                </p>
              </div>
            </header>

            <div className="menu-price-note">
              <p>Precios en soles <span>·</span> Ambas sedes</p>
              <details>
                <summary aria-label="Recargos de bebidas">Recargos<span className="menu-note-detail"> de bebidas</span><MenuIcon name="chevron" /></summary>
                <p>{beverageSurchargeNotice}</p>
              </details>
            </div>

            {sections.length > 0 ? sections.map((category) => (
              <section className="menu-section" key={category.id} aria-labelledby={`category-${category.id}`}>
                <div className="menu-section-heading">
                  <h3 id={`category-${category.id}`}>{category.name}</h3>
                  <span>{category.dishes.length} {category.dishes.length === 1 ? 'opción' : 'opciones'}</span>
                </div>
                <div className="dish-grid">
                  {category.dishes.map((dish) => (
                    <DishCard key={dish.id} dish={dish} categoryId={category.id} categoryName={category.name} />
                  ))}
                </div>
              </section>
            )) : (
              <section className="menu-empty" aria-labelledby="menu-empty-title">
                <div className="menu-empty-icon"><MenuIcon name="search" /></div>
                <h3 id="menu-empty-title">Ese antojo aún no aparece</h3>
                <p>No encontramos resultados{selectedName && <> en {selectedName}</>}.
                  Prueba con otro nombre o explora toda la carta.</p>
                <button type="button" className="menu-primary-button" onClick={resetFilters}>Ver toda la carta<MenuIcon name="arrow" /></button>
              </section>
            )}
          </div>
        </div>
        <div className="menu-closing"><MenuIcon name="bowl" /><p>El buen sabor se comparte.</p><span>El Arrecife de Mamafé</span></div>
      </div>
    </div>
  )
}
