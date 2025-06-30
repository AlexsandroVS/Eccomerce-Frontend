import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Product } from '../../types/product.types';
import { Package } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { productUtils } from '../../utils/product.utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard = memo(({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const primaryImageUrl = productUtils.getPrimaryImage(product);
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.base_price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.compare_at_price! - product.base_price!) / product.compare_at_price!) * 100)
    : 0;

  // Determinar el estado del stock
  const getStockStatus = () => {
    // Asegurarse de que stock sea un número
    const stockNumber = typeof product.stock === 'number' ? product.stock : parseInt(product.stock as any) || 0;
    
    if (stockNumber > 10) {
      return { text: 'En stock', color: 'bg-green-100 text-green-800' };
    }
    if (stockNumber > 0) {
      return { text: `${stockNumber} disponibles`, color: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: 'Agotado', color: 'bg-red-100 text-red-800' };
  };

  const stockStatus = getStockStatus();
  const hasStock = typeof product.stock === 'number' ? product.stock > 0 : parseInt(product.stock as any) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          {primaryImageUrl ? (
            <img
              src={primaryImageUrl}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-product.jpg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Package className="h-24 w-24 text-gray-400" />
            </div>
          )}
          
          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
              -{discountPercentage}%
            </div>
          )}
          {product.is_featured && (
            <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-medium">
              Destacado
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
          
          <div className="mt-2 text-sm text-gray-600 line-clamp-2">
            {product.description}
          </div>

          <div className="mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
              <Package className="w-3 h-3 mr-1" />
              {stockStatus.text}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-blue-600">
                ${product.base_price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  ${product.compare_at_price?.toFixed(2)}
                </span>
              )}
            </div>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (hasStock) {
                  addToCart(product, 1);
                }
              }}
              disabled={!hasStock}
              className={`p-2 rounded-full ${
                hasStock 
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              } transition-colors`}
              aria-label={hasStock ? "Añadir al carrito" : "Producto agotado"}
            >
              <Package className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard; 