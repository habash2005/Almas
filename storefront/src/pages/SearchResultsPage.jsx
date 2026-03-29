import { useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import products from '../data/products'
import ProductCard from '../components/ProductCard'

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const results = useMemo(() => {
    if (!query.trim()) return []

    const q = query.toLowerCase().trim()

    return products.filter(product => {
      // Search across name
      if (product.name?.toLowerCase().includes(q)) return true

      // Search across inspiredBy
      if (product.inspiredBy?.toLowerCase().includes(q)) return true

      // Search across scentFamily
      if (product.scentFamily?.toLowerCase().includes(q)) return true

      // Search across category
      if (product.category?.toLowerCase().includes(q)) return true

      // Search category labels
      const categoryLabels = { men: 'for him', women: 'for her', unisex: 'unisex' }
      if (categoryLabels[product.category]?.includes(q)) return true

      // Search across all notes
      const allNotes = [
        ...(product.notes?.top || []),
        ...(product.notes?.heart || []),
        ...(product.notes?.base || []),
      ]
      if (allNotes.some(note => note.toLowerCase().includes(q))) return true

      // Search across accords
      if (product.accords?.some(accord => accord.name?.toLowerCase().includes(q))) return true

      // Search description
      if (product.description?.toLowerCase().includes(q)) return true

      // Search badge
      if (product.badge?.toLowerCase().includes(q)) return true

      return false
    })
  }, [query])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="px-6 md:px-12 pt-16 pb-8 border-b border-stone-dark/20">
        <div className="max-w-7xl mx-auto">
          <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-warm-gray mb-4 flex items-center gap-3">
            <span className="w-8 h-px bg-warm-gray" />
            Search Results
          </p>
          {query.trim() ? (
            <>
              <h1 className="font-serif text-[clamp(28px,3.5vw,44px)] font-light mb-3">
                Results for &ldquo;{query}&rdquo;
              </h1>
              <p className="font-sans text-sm text-warm-gray">
                {results.length} {results.length === 1 ? 'product' : 'products'} found
              </p>
            </>
          ) : (
            <h1 className="font-serif text-[clamp(28px,3.5vw,44px)] font-light">
              Search Our Collection
            </h1>
          )}
        </div>
      </section>

      {/* Results Grid */}
      <section className="px-6 md:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {results.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              {query.trim() ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-6 border border-stone-dark rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9A948D" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  </div>
                  <h2 className="font-serif text-2xl font-light mb-3">
                    No results found
                  </h2>
                  <p className="font-sans text-sm text-warm-gray max-w-md mx-auto mb-8">
                    We could not find any fragrances matching &ldquo;{query}&rdquo;.
                    Try a different search term or browse our collection.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Link
                      to="/shop"
                      className="px-8 py-3 bg-black text-white text-[11px] tracking-[0.15em] uppercase font-sans hover:bg-black/85 transition-colors"
                    >
                      Browse All
                    </Link>
                    <Link
                      to="/scent-finder"
                      className="px-8 py-3 border border-black text-black text-[11px] tracking-[0.15em] uppercase font-sans hover:bg-black hover:text-white transition-colors"
                    >
                      Try Scent Finder
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-6 border border-stone-dark rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9A948D" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  </div>
                  <h2 className="font-serif text-2xl font-light mb-3">
                    Start your search
                  </h2>
                  <p className="font-sans text-sm text-warm-gray max-w-md mx-auto mb-8">
                    Search by fragrance name, designer inspiration, scent family, or individual notes.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                    {['Oud', 'Vanilla', 'Fresh', 'Creed', 'Rose', 'Woody'].map(term => (
                      <Link
                        key={term}
                        to={`/search?q=${encodeURIComponent(term)}`}
                        className="px-4 py-2 border border-stone-dark text-[11px] tracking-[0.1em] uppercase font-sans text-warm-gray hover:border-black hover:text-black transition-colors"
                      >
                        {term}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
