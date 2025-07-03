import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Product, ProductVariant } from '../types/product.types';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  product: Product;
  variant?: ProductVariant;
  variantId?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'cart_items_v2';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number = 1, variant?: ProductVariant) => {
    setItems(prev => {
      // Crear un ID único que incluya la variante si existe
      const itemId = variant ? `${product.id}-${variant.id}` : product.id;
      
      const existing = prev.find(item => item.id === itemId);
      if (existing) {
        return prev.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      // Determinar el precio y la imagen
      const price = variant ? variant.price : (product.base_price || 0);
      
      // Obtener la imagen principal del producto o variante (URL original)
      let image = '';
      if (variant?.images && variant.images.length > 0) {
        image = variant.images[0].url;
      } else if (product.images && product.images.length > 0) {
        // Buscar la imagen principal o usar la primera
        const primaryImage = product.images.find(img => img.is_primary);
        image = primaryImage ? primaryImage.url : product.images[0].url;
      }
      
      return [
        ...prev,
        {
          id: itemId,
          name: product.name,
          price,
          image,
          quantity,
          product,
          variant,
          variantId: variant?.id,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      total,
      itemCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}; 