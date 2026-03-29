import { useState, useMemo } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import products from '../data/products'

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'For Him', value: 'men' },
  { label: 'For Her', value: 'women' },
  { label: 'Unisex', value: 'unisex' },
]

const SCENT_FAMILIES = [
  'All', 'Woody', 'Oriental', 'Floral', 'Fresh', 'Spicy',
  'Amber', 'Oud', 'Citrus', 'Aromatic', 'Gourmand',
]

const BADGES = ['All', 'Best Seller', 'New', 'Popular']

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'A-Z', value: 'az' },
  { label: 'Z-A', value: 'za' },
]

const categoryTitles = {
  men: 'For Him',
  women: 'For Her',
  unisex: 'Unisex',
}

export default function ShopPage() {
  const { category: urlCategory } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const [activeCategory, setActiveCategory] = useState(urlCategory || 'all')
  const [scentFamily, setScentFamily] = useState('All')
  const [badgeFilter, setBadgeFilter] = useState('All')
  const [sortBy, setSortBy] = useState('featured')

  // Sync URL category param on mount
  useState(() => {
    if (urlCategory && ['men', 'women', 'unisex'].includes(urlCategory)) {
      setActiveCategory(urlCategory)
    }
  })

  const filteredAndSorted = useMemo(() => {
    let result = [...products]

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory)
    }

    // Scent family filter
    if (scentFamily !== 'All') {
      result = result.filter(p => p.scentFamily === scentFamily)
    }

    // Badge filter
    if (badgeFilter !== 'All') {
      result = result.filter(p => p.badge === badgeFilter)
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.prices['50ml'] || 0) - (b.prices['50ml'] || 0))
        break
      case 'price-desc':
        result.sort((a, b) => (b.prices['50ml'] || 0) - (a.prices['50ml'] || 0))
        break
      case 'az':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'za':
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        // featured — keep original order
        break
    }

    return result
  }, [activeCategory, scentFamily, badgeFilter, sortBy])

  const pageTitle = activeCategory !== 'all'
    ? categoryTitles[activeCategory] || 'Our Collection'
    : 'Our Collection'

  const handleCategoryChange = (value) => {
    setActiveCategory(value)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <section className="px-6 md:px-12 pt-16 pb-8">
        <div className="max-w-7xl mx-auto">
          <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray mb-4 flex items-center gap-3">
            <span className="w-8 h-px bg-warm-gray" />
            Shop
          </p>
          <h1 className="font-serif text-[clamp(32px,4vw,52px)] font-light leading-tight">
            {pageTitle}
          </h1>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="px-6 md:px-12 pb-8 border-b border-stone-dark/30">
        <div className="max-w-7xl mx-auto">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`px-5 py-2 text-[11px] tracking-[0.12em] uppercase font-sans transition-all duration-300 ${
                    activeCategory === cat.value
                      ? 'bg-black text-white'
                      : 'bg-transparent text-black border border-stone-dark hover:border-black'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dropdowns Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Scent Family */}
            <div className="relative">
              <select
                value={scentFamily}
                onChange={(e) => setScentFamily(e.target.value)}
                className="appearance-none bg-transparent border border-stone-dark px-4 py-2.5 pr-8 text-[11px] tracking-[0.1em] uppercase font-sans text-black cursor-pointer hover:border-black transition-colors focus:outline-none focus:border-black"
              >
                {SCENT_FAMILIES.map(sf => (
                  <option key={sf} value={sf}>
                    {sf === 'All' ? 'All Scent Families' : sf}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {/* Badge */}
            <div className="relative">
              <select
                value={badgeFilter}
                onChange={(e) => setBadgeFilter(e.target.value)}
                className="appearance-none bg-transparent border border-stone-dark px-4 py-2.5 pr-8 text-[11px] tracking-[0.1em] uppercase font-sans text-black cursor-pointer hover:border-black transition-colors focus:outline-none focus:border-black"
              >
                {BADGES.map(b => (
                  <option key={b} value={b}>
                    {b === 'All' ? 'All Badges' : b}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {/* Sort */}
            <div className="relative ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-transparent border border-stone-dark px-4 py-2.5 pr-8 text-[11px] tracking-[0.1em] uppercase font-sans text-black cursor-pointer hover:border-black transition-colors focus:outline-none focus:border-black"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    Sort: {opt.label}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Results Count */}
      <section className="px-6 md:px-12 py-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-sans text-[12px] tracking-[0.08em] text-warm-gray">
            Showing {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'product' : 'products'}
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-7xl mx-auto">
          {filteredAndSorted.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredAndSorted.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="font-serif text-2xl font-light mb-3">No products found</p>
              <p className="text-warm-gray text-sm">
                Try adjusting your filters to discover more fragrances.
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all')
                  setScentFamily('All')
                  setBadgeFilter('All')
                  setSortBy('featured')
                }}
                className="mt-6 px-8 py-3 bg-black text-white text-[11px] tracking-[0.15em] uppercase font-sans hover:bg-black/80 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
