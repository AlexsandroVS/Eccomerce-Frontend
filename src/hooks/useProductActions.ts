import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Product, ProductVariant } from '../types/product.types';
import { useCart } from '../contexts/CartContext';

export const useProductActions = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const navigateToProduct = useCallback((productId: string) => {
    navigate(`/products/${productId}`);
  }, [navigate]);

  const navigateToProducts = useCallback(() => {
    navigate('/products');
  }, [navigate]);

  const navigateToCategory = useCallback((categoryId: string) => {
    navigate(`/products?category=${categoryId}`);
  }, [navigate]);

  const addToCartAction = useCallback((product: Product, quantity: number = 1, variant?: ProductVariant) => {
    try {
      addToCart(product, quantity, variant);
      
      const variantText = variant ? ` (${variant.sku_suffix})` : '';
      toast.success(`Producto añadido al carrito${variantText}`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error al añadir al carrito');
    }
  }, [addToCart]);

  const addToWishlist = useCallback((product: Product) => {
    // TODO: Implementar lógica real de wishlist
    console.log('Añadir a wishlist:', product);
    toast.success('Añadido a favoritos');
    
    // Aquí podrías integrar con un contexto de wishlist
    // dispatch({ type: 'ADD_TO_WISHLIST', payload: product });
  }, []);

  const removeFromWishlist = useCallback((product: Product) => {
    // TODO: Implementar lógica real de wishlist
    console.log('Eliminar de wishlist:', product);
    toast.success('Eliminado de favoritos');
    
    // Aquí podrías integrar con un contexto de wishlist
    // dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: product.id });
  }, []);

  const toggleWishlist = useCallback((product: Product, isWishlisted: boolean) => {
    if (isWishlisted) {
      removeFromWishlist(product);
    } else {
      addToWishlist(product);
    }
  }, [addToWishlist, removeFromWishlist]);

  const shareProduct = useCallback(async (product: Product) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: `${window.location.origin}/products/${product.id}`,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copiar URL al clipboard
      try {
        const url = `${window.location.origin}/products/${product.id}`;
        await navigator.clipboard.writeText(url);
        toast.success('URL copiada al portapapeles');
      } catch (error) {
        console.log('Error copying to clipboard:', error);
        toast.error('Error al copiar URL');
      }
    }
  }, []);

  return {
    navigateToProduct,
    navigateToProducts,
    navigateToCategory,
    addToCart: addToCartAction,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    shareProduct,
  };
}; 