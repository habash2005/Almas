import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext();

const FREE_SHIPPING_THRESHOLD = 100;

function loadCart() {
  try {
    const stored = localStorage.getItem('almas_cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadCart);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('almas_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product, size = '50ml', quantity = 1, isSubscription = false) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.id === product.id && item.size === size && item.isSubscription === isSubscription
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      const price = product.prices[size];
      const subscriptionPrice = isSubscription ? Math.round(price * 0.85) : price;
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          inspiredBy: product.inspiredBy,
          image: product.image,
          size,
          price: subscriptionPrice,
          originalPrice: price,
          quantity,
          isSubscription,
          interval: isSubscription ? '3months' : null,
        },
      ];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((id, size, isSubscription = false) => {
    setCartItems(prev =>
      prev.filter(item => !(item.id === id && item.size === size && item.isSubscription === isSubscription))
    );
  }, []);

  const updateQuantity = useCallback((id, size, quantity, isSubscription = false) => {
    if (quantity < 1) return;
    setCartItems(prev =>
      prev.map(item =>
        item.id === id && item.size === size && item.isSubscription === isSubscription
          ? { ...item, quantity }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const getCartCount = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();
  const freeShippingThreshold = FREE_SHIPPING_THRESHOLD;
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
  const hasFreeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD;

  const subscriptionItems = cartItems.filter(item => item.isSubscription);
  const regularItems = cartItems.filter(item => !item.isSubscription);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        regularItems,
        subscriptionItems,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        freeShippingThreshold,
        freeShippingRemaining,
        hasFreeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
