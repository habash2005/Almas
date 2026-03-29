import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import products from '../data/products';

export default function SearchDropdown({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const filteredProducts = query.trim().length > 0
    ? products
        .filter(
          p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.inspiredBy.toLowerCase().includes(query.toLowerCase()) ||
            p.scentFamily.toLowerCase().includes(query.toLowerCase()) ||
            (p.category === 'men' ? 'for him' : p.category === 'women' ? 'for her' : 'unisex').includes(query.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleResultClick = (productId) => {
    navigate(`/product/${productId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-[90]"
        onClick={onClose}
      />

      {/* Dropdown */}
      <div
        className="absolute top-full left-0 right-0 bg-white z-[95] border-b border-black/[0.06] shadow-lg"
        style={{ animation: 'slideDown 0.3s ease forwards' }}
      >
        <div className="max-w-2xl mx-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="relative">
            <Search
              size={16}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fragrances..."
              className="w-full pl-11 pr-10 py-3.5 bg-light-gray font-sans text-[13px] text-black outline-none placeholder:text-warm-gray"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray hover:text-black transition-colors"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            )}
          </form>

          {/* Results */}
          {filteredProducts.length > 0 && (
            <div className="mt-4 border-t border-black/[0.06]">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleResultClick(product.id)}
                  className="w-full flex items-center gap-4 py-3.5 px-2 hover:bg-light-gray transition-colors text-left border-b border-black/[0.04] last:border-0"
                >
                  <div className="w-12 h-14 bg-light-gray flex items-center justify-center flex-shrink-0">
                    <span className="font-serif text-[10px] text-stone-dark">ALMAS</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-[15px] text-black truncate">{product.name}</p>
                    <p className="font-sans text-[11px] text-warm-gray italic truncate">
                      Inspired by {product.inspiredBy}
                    </p>
                  </div>
                  <span className="font-sans text-[13px] text-black flex-shrink-0">
                    ${product.prices['50ml']}
                  </span>
                </button>
              ))}
            </div>
          )}

          {query.trim().length > 0 && filteredProducts.length === 0 && (
            <p className="mt-4 text-center text-warm-gray text-[13px] font-sans py-6">
              No fragrances found for "{query}"
            </p>
          )}
        </div>
      </div>
    </>
  );
}
