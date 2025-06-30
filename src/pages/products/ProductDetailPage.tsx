// pages/ProductDetailPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart,
  Heart,
  Share2,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Package,
  Tag,
  AlertCircle,
  CheckCircle,
  Truck,
  Star,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { useCatalog } from '../../hooks/useCatalog';
import { useProductActions } from '../../hooks/useProductActions';
import { productService } from '../../services/product.service';
import { productUtils } from '../../utils/product.utils';
import { toast } from 'sonner';
import type { Product, ProductVariant } from '../../types/product.types';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById, loading, categories } = useCatalog();
  const { 
    navigateToProducts, 
    navigateToCategory, 
    addToCart, 
    toggleWishlist, 
    shareProduct 
  } = useProductActions();
  
  // Estados locales
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [productNotFound, setProductNotFound] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  // Cargar producto
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        navigateToProducts();
        return;
      }

      setLoadingProduct(true);
      try {
        // Primero intentar obtener del catálogo en memoria
        let foundProduct = getProductById(id);
        
        // Si no está en memoria, cargar desde la API
        if (!foundProduct) {
          foundProduct = await productService.getById(id);
        }

        if (foundProduct) {
          setProduct(foundProduct);
          setProductNotFound(false);
          
          // Si es un producto variable, seleccionar la primera variante activa
          if (foundProduct.type === 'VARIABLE' && foundProduct.variants.length > 0) {
            const activeVariants = foundProduct.variants.filter(v => v.is_active);
            if (activeVariants.length > 0) {
              setSelectedVariant(activeVariants[0]);
            }
          }
        } else {
          setProductNotFound(true);
          toast.error('Producto no encontrado');
          setTimeout(() => {
            navigateToProducts();
          }, 2000);
        }
      } catch (error: any) {
        console.error('Error loading product:', error);
        setProductNotFound(true);
        toast.error(error.message || 'Error al cargar el producto');
        setTimeout(() => {
          navigateToProducts();
        }, 2000);
      } finally {
        setLoadingProduct(false);
      }
    };

    loadProduct();
  }, [id, getProductById, navigateToProducts]);

  // Memoized calculations
  const availableImages = useMemo(() => {
    if (!product) return [];
    
    // Obtener imágenes ordenadas del producto
    const productImages = productUtils.getOrderedImages(product);
    
    // Si hay una variante seleccionada y tiene imágenes, combinarlas
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      const variantImages = selectedVariant.images.map(img => ({
        ...img,
        product_id: product.id
      }));
      return [...variantImages, ...productImages];
    }
    
    return productImages;
  }, [product, selectedVariant]);

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    
    if (product.type === 'VARIABLE' && selectedVariant) {
      return selectedVariant.price;
    }
    
    return product.base_price || 0;
  }, [product, selectedVariant]);

  const currentStock = useMemo(() => {
    if (!product) return 0;
    
    if (product.type === 'VARIABLE' && selectedVariant) {
      return selectedVariant.stock;
    }
    
    // Para productos simples, usar el stock del producto
    return product.stock || 0;
  }, [product, selectedVariant]);

  const stockStatus = useMemo(() => {
    if (currentStock > 10) {
      return { 
        status: 'in-stock', 
        text: 'En stock', 
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      };
    }
    if (currentStock > 0) {
      return { 
        status: 'low-stock', 
        text: `Solo ${currentStock} disponibles`, 
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      };
    }
    return { 
      status: 'out-of-stock', 
      text: 'Agotado', 
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    };
  }, [currentStock]);

  // Callbacks
  const formatPrice = useCallback((price: number) => {
    return productUtils.formatPrice(price);
  }, []);

  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= currentStock) {
      setQuantity(newQuantity);
    }
  }, [currentStock]);

  const handleVariantSelect = useCallback((variant: ProductVariant) => {
    setSelectedVariant(variant);
    setQuantity(1); // Reset quantity when changing variant
    setSelectedImageIndex(0); // Reset image index when changing variant
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    
    addToCart(product, quantity, selectedVariant);
  }, [product, quantity, selectedVariant, addToCart]);

  const handleToggleWishlist = useCallback(() => {
    if (!product) return;
    
    toggleWishlist(product, isWishlisted);
    setIsWishlisted(!isWishlisted);
  }, [product, isWishlisted, toggleWishlist]);

  const handleShare = useCallback(() => {
    if (!product) return;
    
    shareProduct(product);
  }, [product, shareProduct]);

  const handleNavigateToCategory = useCallback((categoryId: string) => {
    navigateToCategory(categoryId);
  }, [navigateToCategory]);

  const handleImageNavigation = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedImageIndex(Math.max(0, selectedImageIndex - 1));
    } else {
      setSelectedImageIndex(Math.min(availableImages.length - 1, selectedImageIndex + 1));
    }
  }, [selectedImageIndex, availableImages.length]);

  const handleImageSelect = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Mostrar loading
  if (loading || loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si el producto no se encuentra
  if (productNotFound || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Package className="h-16 w-16 text-gray-400" />
          <h2 className="text-2xl font-semibold text-gray-900">Producto no encontrado</h2>
          <p className="text-gray-600">El producto que buscas no existe o ha sido eliminado.</p>
          <button
            onClick={navigateToProducts}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Volver a productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header con botón de regreso */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 mb-8"
        >
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>
        </motion.div>

        {/* Breadcrumbs */}
        <motion.nav
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-sm text-gray-500 mb-8"
        >
          <button 
            onClick={navigateToProducts}
            className="hover:text-blue-500 transition-colors"
          >
            Productos
          </button>
          <ChevronRight size={16} />
          {product.categories.length > 0 && (
            <>
              <button 
                onClick={() => handleNavigateToCategory(String(product.categories[0].id))}
                className="hover:text-blue-500 transition-colors"
              >
                {product.categories[0].name}
              </button>
              <ChevronRight size={16} />
            </>
          )}
          <span className="text-gray-900 font-medium">{product.name}</span>
        </motion.nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Galería de imágenes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Imagen principal */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-white shadow-sm border">
              {availableImages.length > 0 ? (
                <img
                  src={availableImages[selectedImageIndex]?.url}
                  alt={availableImages[selectedImageIndex]?.alt_text || product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-product.jpg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
              )}
              
              {/* Navegación de imágenes */}
              {availableImages.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageNavigation('prev')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors"
                    disabled={selectedImageIndex === 0}
                  >
                    <ChevronLeft size={20} className={selectedImageIndex === 0 ? 'text-gray-400' : 'text-gray-800'} />
                  </button>
                  <button
                    onClick={() => handleImageNavigation('next')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors"
                    disabled={selectedImageIndex === availableImages.length - 1}
                  >
                    <ChevronRight size={20} className={selectedImageIndex === availableImages.length - 1 ? 'text-gray-400' : 'text-gray-800'} />
                  </button>
                </>
              )}

              {/* Indicador de imagen actual */}
              {availableImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex space-x-2">
                    {availableImages.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {availableImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {availableImages.map((image, index) => (
                  <button
                    key={`${image.product_id}-${index}`}
                    onClick={() => handleImageSelect(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? 'border-blue-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt_text || `${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-product.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Información del producto */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
            </div>

            {/* Precio */}
            <div>
              <p className="text-3xl font-bold text-blue-600 mb-1">
                {formatPrice(currentPrice)}
              </p>
              {product.type === 'VARIABLE' && (
                <p className="text-sm text-gray-500">Precio según variante seleccionada</p>
              )}
            </div>

            {/* Stock Status */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color} ${stockStatus.bgColor}`}>
              {stockStatus.status === 'in-stock' ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : stockStatus.status === 'low-stock' ? (
                <AlertCircle className="w-4 h-4 mr-2" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-2" />
              )}
              {stockStatus.text}
            </div>

            {/* Descripción */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Variantes */}
            {product.type === 'VARIABLE' && product.variants.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Variantes disponibles</h3>
                <div className="grid grid-cols-1 gap-2">
                  {product.variants.filter(v => v.is_active).map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantSelect(variant)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">SKU: {product.sku}-{variant.sku_suffix}</p>
                          {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(variant.attributes).map(([key, value]) => (
                                <span key={key} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">{formatPrice(variant.price)}</p>
                          <p className="text-xs text-gray-500">Stock: {variant.stock}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Categorías */}
            {product.categories.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Categorías</h3>
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleNavigateToCategory(String(category.id))}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Atributos */}
            {product.attributes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Características</h3>
                <div className="grid grid-cols-1 gap-2">
                  {product.attributes.map((attr, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-gray-600">{attr.name}</span>
                      <span className="font-medium text-gray-900">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cantidad y acciones */}
            <div className="space-y-4">
              {/* Selector de cantidad */}
              {stockStatus.status !== 'out-of-stock' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= currentStock}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={stockStatus.status === 'out-of-stock'}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  {stockStatus.status === 'out-of-stock' ? 'Agotado' : 'Añadir al carrito'}
                </button>
                
                <button
                  onClick={handleToggleWishlist}
                  className={`p-3 border rounded-lg transition-colors ${
                    isWishlisted
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
                
                <button
                  onClick={handleShare}
                  className="p-3 border border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Información de envío */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Truck className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-gray-900">Información de envío</span>
              </div>
              <p className="text-sm text-gray-600">
                Envío gratis en pedidos superiores a S/ 100. Entrega estimada en 2-5 días hábiles.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Productos relacionados o recomendados */}
        {/* Aquí podrías agregar una sección de productos relacionados */}
      </div>
    </div>
  );
};

export default ProductDetailPage;