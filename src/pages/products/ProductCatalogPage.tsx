// pages/ProductCatalogPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ShoppingCart,
  Heart,
  TrendingUp,
  Package,
  Tag,
  Eye
} from 'lucide-react';
import { useCatalog } from '../../hooks/useCatalog';
import { productUtils } from '../../utils/product.utils';
import type { Product } from '../../types/product.types';
import { useCart } from '../../contexts/CartContext';

const ProductCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const {
    products,
    filteredProducts,
    featuredProducts,
    categories,
    loading,
    searchProducts,
    filterProducts,
    clearFilters,
    currentFilters,
    hasFilters,
    getProductById
  } = useCatalog();

  // Estados locales - inicializar con URL params
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');

  // Manejar búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(searchInput);
      // Actualizar URL params
      const newSearchParams = new URLSearchParams(searchParams);
      if (searchInput.trim()) {
        newSearchParams.set('search', searchInput.trim());
      } else {
        newSearchParams.delete('search');
      }
      setSearchParams(newSearchParams, { replace: true });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, searchProducts, setSearchParams]);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    const filters: any = {};
    
    if (selectedCategory !== 'all') {
      filters.category = selectedCategory;
    }
    
    if (searchInput.trim()) {
      filters.search = searchInput.trim();
    }

    // Mapear sortBy a formato del hook
    switch (sortBy) {
      case 'price-asc':
        filters.sortBy = 'price';
        filters.sortOrder = 'asc';
        break;
      case 'price-desc':
        filters.sortBy = 'price';
        filters.sortOrder = 'desc';
        break;
      case 'newest':
        filters.sortBy = 'created_at';
        filters.sortOrder = 'desc';
        break;
      case 'name':
        filters.sortBy = 'name';
        filters.sortOrder = 'asc';
        break;
      default:
        filters.sortBy = 'created_at';
        filters.sortOrder = 'desc';
    }

    filterProducts(filters);
    
    // Actualizar URL params
    const newSearchParams = new URLSearchParams();
    if (selectedCategory !== 'all') {
      newSearchParams.set('category', selectedCategory);
    }
    if (searchInput.trim()) {
      newSearchParams.set('search', searchInput.trim());
    }
    if (sortBy !== 'featured') {
      newSearchParams.set('sort', sortBy);
    }
    setSearchParams(newSearchParams, { replace: true });
  }, [selectedCategory, sortBy, filterProducts, setSearchParams, searchInput]);

  // Funciones auxiliares
  const getProductDisplayPrice = useCallback((product: Product): number => {
    if (product.variants && product.variants.length > 0) {
      const activeVariants = product.variants.filter(v => v.is_active);
      if (activeVariants.length > 0) {
        return Math.min(...activeVariants.map(v => v.price));
      }
    }
    return product.base_price || 0;
  }, []);

  const getProductPrimaryImage = useCallback((product: Product): string => {
    const primaryImage = productUtils.getPrimaryImage(product);
    return primaryImage || '/placeholder-product.jpg';
  }, []);

  const getStockStatus = useCallback((product: Product) => {
    let totalStock = 0;
    if (product.type === 'VARIABLE' && product.variants && product.variants.length > 0) {
      totalStock = product.variants.reduce((total, variant) => {
        return total + (variant.is_active ? (typeof variant.stock === 'number' ? variant.stock : parseInt(variant.stock as any) || 0) : 0);
      }, 0);
    } else {
      totalStock = typeof product.stock === 'number' ? product.stock : parseInt(product.stock as any) || 0;
    }

    if (totalStock > 10) return { status: 'in-stock', text: 'En stock', color: 'text-green-600' };
    if (totalStock > 0) return { status: 'low-stock', text: `Solo ${totalStock} disponibles`, color: 'text-orange-600' };
    return { status: 'out-of-stock', text: 'Agotado', color: 'text-red-600' };
  }, []);

  const formatPrice = useCallback((price: number) => {
    return productUtils.formatPrice(price);
  }, []);

  const handleAddToCart = useCallback((product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  }, [addToCart]);

  const handleAddToWishlist = useCallback((product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implementar lógica real de wishlist
    console.log('Añadir a wishlist:', product);
  }, []);

  const handleProductClick = useCallback((productId: string) => {
    navigate(`/products/${productId}`);
  }, [navigate]);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setSelectedCategory('all');
    setSortBy('featured');
    clearFilters();
    setSearchParams({}, { replace: true });
  }, [clearFilters, setSearchParams]);

  if (loading && !filteredProducts.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Barra de búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* Filtros y Ordenamiento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0"
        >
          {/* Filtros de categoría */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            {loading ? (
              <div className="px-4 py-2 bg-gray-100 rounded-full animate-pulse">
                <div className="h-4 w-16 bg-gray-300 rounded"></div>
              </div>
            ) : (
              categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))
            )}
          </div>

          {/* Ordenamiento */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-500" />
              <span className="text-sm text-gray-600">Ordenar por:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="featured">Más vendidos</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="newest">Más Recientes</option>
              <option value="name">Nombre A-Z</option>
            </select>
          </div>
        </motion.div>

        {/* Contador de resultados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-gray-600">
            {loading ? (
              'Buscando productos...'
            ) : (
              `${filteredProducts.length} producto${filteredProducts.length !== 1 ? 's' : ''} encontrado${filteredProducts.length !== 1 ? 's' : ''}`
            )}
          </p>
        </motion.div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => {
            const stockInfo = getStockStatus(product);
            const primaryImage = getProductPrimaryImage(product);
            const displayPrice = getProductDisplayPrice(product);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index % 8) }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleProductClick(product.id)}
              >
                {/* Imagen */}
                <div className="relative aspect-square">
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-product.jpg';
                    }}
                  />
                  
                  {/* Overlay con botones */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={stockInfo.status === 'out-of-stock'}
                      className="p-3 bg-white rounded-full text-blue-500 hover:bg-blue-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Añadir al carrito"
                    >
                      <ShoppingCart size={20} />
                    </button>
                    <button
                      onClick={(e) => handleAddToWishlist(product, e)}
                      className="p-3 bg-white rounded-full text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                      title="Añadir a favoritos"
                    >
                      <Heart size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product.id);
                      }}
                      className="p-3 bg-white rounded-full text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                      title="Ver detalles"
                    >
                      <Eye size={20} />
                    </button>
                  </div>

                  {/* Badges de estado */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {stockInfo.status === 'out-of-stock' && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                        Agotado
                      </span>
                    )}
                    {stockInfo.status === 'low-stock' && (
                      <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                        Últimas unidades
                      </span>
                    )}
                  </div>
                  
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {product.sales_count > 50 && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                        Bestseller
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-500 transition-colors">
                    {product.name}
                  </h2>
                  
                  {/* SKU */}
                  <p className="text-xs text-gray-500 mb-2">
                    SKU: {product.sku}
                  </p>

                  {/* Categorías */}
                  {product.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.categories.slice(0, 2).map((category) => (
                        <span
                          key={category.id}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Descripción */}
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Precio */}
                  <div className="mb-2">
                    <p className="text-xl font-bold text-blue-600">
                      {displayPrice ? formatPrice(displayPrice) : 'Precio no disponible'}
                    </p>
                    {product.variants && product.variants.length > 0 && (
                      <p className="text-xs text-gray-500">desde</p>
                    )}
                  </div>

                  {/* Stock */}
                  <p className={`text-sm ${stockInfo.color} font-medium`}>
                    {stockInfo.text}
                  </p>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product.id);
                    }}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    Ver Detalles
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mensaje si no hay productos */}
        {!loading && filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No se encontraron productos
            </h2>
            <p className="text-gray-600 mb-6">
              Intenta ajustar tus filtros o buscar con otra palabra clave.
            </p>
            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalogPage;