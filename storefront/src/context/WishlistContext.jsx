import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const WishlistContext = createContext();

function loadWishlist() {
  try {
    const stored = localStorage.getItem('almas_wishlist');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(loadWishlist);

  useEffect(() => {
    localStorage.setItem('almas_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = useCallback((product) => {
    setWishlistItems(prev => {
      if (prev.find(item => item.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  const toggleWishlist = useCallback((product) => {
    setWishlistItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev.filter(item => item.id !== product.id);
      return [...prev, product];
    });
  }, []);

  const isInWishlist = useCallback(
    (productId) => wishlistItems.some(item => item.id === productId),
    [wishlistItems]
  );

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

export default WishlistContext;
