import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { products } from '../../data/products';
import type { Product } from '../../types/product.types';

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Implementar fetch real de wishlist
    const fetchWishlist = async () => {
      try {
        // Simulación de fetch - usando algunos productos como ejemplo
        const mockWishlist = products.slice(0, 3);
        setWishlistItems(mockWishlist);
      } catch (error) {
        console.error('Error al cargar la lista de deseos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = (productId: string) => {
    // TODO: Implementar lógica real de eliminación
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleAddToCart = (product: Product) => {
    // TODO: Implementar lógica real del carrito
    console.log('Añadir al carrito:', product);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mi Lista de Deseos</h1>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <Heart size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Tu lista de deseos está vacía
          </h2>
          <p className="text-gray-500 mb-6">
            Guarda tus productos favoritos para comprarlos más tarde
          </p>
          <button
            onClick={() => navigate('/productos')}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-accent hover:bg-accent/90"
          >
            Explorar Productos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              {/* Imagen */}
              <div className="relative aspect-square">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* Contenido */}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </h2>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Precio */}
                <div className="flex items-baseline space-x-2 mb-4">
                  <span className="text-xl font-bold text-accent">
                    ${product.discount_price?.toFixed(2) ?? product.price.toFixed(2)}
                  </span>
                  {product.discount_price && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Botones */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate(`/productos/${product.id}`)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Ver Detalles
                  </button>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent/90"
                  >
                    <ShoppingCart size={16} />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage; 