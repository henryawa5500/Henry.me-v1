import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { SearchIcon, GridIcon } from '../components/ui/Icons.jsx'
import Button from '../components/ui/Button.jsx'
import ProductCard from '../components/ui/ProductCard.jsx'
import heroShirts from '../assets/hero-shirts.jpg'
import { useProducts } from '../context/ProductsContext.jsx'

const filters = ['All', 'New Arrivals', 'Best Sellers', 'Discounts']

const Home = () => {
  const { products } = useProducts()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const initialFilter = searchParams.get('filter')
  const activeFilter = filters.includes(initialFilter) ? initialFilter : 'All'

  const filteredProducts = useMemo(() => {
    const byTag =
      activeFilter === 'All'
        ? products
        : products.filter((product) => product.tags?.includes(activeFilter))

    if (!searchTerm.trim()) return byTag
    const normalizedSearch = searchTerm.trim().toLowerCase()
    return byTag.filter((product) =>
      product.name.toLowerCase().includes(normalizedSearch),
    )
  }, [activeFilter, products, searchTerm])

  const handleFilterChange = (filter) => {
    if (filter === 'All') {
      setSearchParams({})
    } else {
      setSearchParams({ filter })
    }
  }

  const focusSearch = useCallback(() => {
    const section = document.getElementById('featured-products')
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    requestAnimationFrame(() => {
      const input = document.getElementById('product-search')
      input?.focus({ preventScroll: true })
    })
  }, [])

  useEffect(() => {
    if (!location.state?.focusSearch) return
    focusSearch()
    navigate(location.pathname + location.search, { replace: true, state: {} })
  }, [focusSearch, location.pathname, location.search, location.state, navigate])

  useEffect(() => {
    const handler = () => focusSearch()
    window.addEventListener('henryme:focusSearch', handler)
    return () => window.removeEventListener('henryme:focusSearch', handler)
  }, [focusSearch])

  return (
    <div className="page-transition">
      <section
        className="relative min-h-[260px] overflow-hidden rounded-2xl border border-border bg-cover bg-center p-6 sm:min-h-[320px] sm:p-8 lg:min-h-[360px]"
        style={{ backgroundImage: `url(${heroShirts})`, backgroundPosition: 'center top' }}
      >
        <div className="absolute inset-0 bg-white/55" />
        <div className="relative max-w-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            New Collection
          </p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-primary sm:text-3xl lg:text-4xl">
            Premium tees that fit every day.
          </h2>
          <p className="mt-3 text-sm text-muted sm:text-base">
            Curated drops, bold graphics, and everyday comfort from HenryME.
          </p>
          <div className="mt-5">
            <Button full size="lg" className="sm:w-auto">
              Shop Now
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Browse Categories</h3>
          <div className="flex items-center gap-2 text-muted">
            <SearchIcon size={18} />
            <GridIcon size={18} />
          </div>
        </div>
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => handleFilterChange(filter)}
              className={`whitespace-nowrap rounded-lg border px-4 py-2 text-xs font-semibold transition focus-ring ${
                activeFilter === filter
                  ? 'bg-black text-white border-black'
                  : 'border-border text-primary hover:border-black'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10 scroll-mt-24 sm:scroll-mt-28 lg:scroll-mt-32" id="featured-products">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold">Featured Products</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-44">
              <SearchIcon
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="product-search"
                type="text"
                placeholder="Search tees"
                aria-label="Search products"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-xs text-primary focus-ring"
              />
            </div>
            <select className="h-10 w-full rounded-lg border border-border bg-white px-3 text-xs text-primary focus-ring sm:w-auto">
              <option>Sort: Featured</option>
              <option>Sort: New Arrivals</option>
              <option>Sort: Price (Low to High)</option>
            </select>
            <button
              type="button"
              aria-label="Toggle layout"
              className="rounded-lg border border-border p-2 text-muted focus-ring"
            >
              <GridIcon size={16} />
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
