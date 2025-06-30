import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Trash2, Package, AlertCircle, Eye, EyeOff, RefreshCw, 
  Image, Tag, Edit, Settings, Filter, X, DollarSign, ChevronDown, ChevronRight
} from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import type { Product, ProductType, ProductVariant } from '../../types/product.types';
import { productUtils } from '../../utils/product.utils';
import { productService } from '../../services/product.service';
import { getImageUrl } from '../../utils/image.utils';

// Tipos simplificados
interface Filters {
  search: string;
  type: ProductType | 'ALL';
  sortBy: 'name_asc' | 'name_desc' | 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'default';
  status: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'DELETED';
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

// Tipo unión para manejar tanto productos como variantes
type DisplayItem = any; // Simplificar para evitar errores de TypeScript

// Componente para mostrar variantes en subtabla
const VariantsSubTable = ({ variants, productName }: { variants: any[], productName: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  if (!variants || variants.length === 0) {
    return (
      <div className="px-4 py-2 text-sm text-gray-500">
        No hay variantes para este producto
      </div>
    );
  }

  const handleToggleVariantStatus = async (variantId: string, variantName: string, isActive: boolean) => {
    try {
      // Aquí deberías implementar la lógica para activar/desactivar variantes
      console.log(`Toggle variant ${variantId} to ${isActive ? 'active' : 'inactive'}`);
    } catch (error) {
      console.error('Error toggling variant status:', error);
    }
  };

  const handleDeleteVariant = async (variantId: string, variantName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la variante "${variantName}"?`)) {
      try {
        // Aquí deberías implementar la lógica para eliminar variantes
        console.log(`Delete variant ${variantId}`);
      } catch (error) {
        console.error('Error deleting variant:', error);
      }
    }
  };

  return (
    <div className="border-t border-gray-100">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between"
      >
        <span>{variants.length} variante{variants.length !== 1 ? 's' : ''}</span>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      
      {isExpanded && (
        <div className="bg-gray-50 px-4 py-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="pb-2">Imagen</th>
                <th className="pb-2">Variante</th>
                <th className="pb-2">SKU</th>
                <th className="pb-2">Precio</th>
                <th className="pb-2">Stock</th>
                <th className="pb-2">Estado</th>
                <th className="pb-2">Creado</th>
                <th className="pb-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {variants.map(variant => {
                const primaryImage = variant.images && variant.images.length > 0 ? variant.images[0] : null;
                const isActive = variant.is_active;
                
                return (
                  <tr key={variant.id} className="text-gray-700 hover:bg-gray-100">
                    <td className="py-2">
                      <div className="h-12 w-12 flex-shrink-0">
                        {primaryImage ? (
                          <img 
                            src={primaryImage} 
                            alt={variant.name} 
                            className="h-12 w-12 object-cover rounded-lg" 
                            title={variant.name}
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Image className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate" title={variant.name}>
                          {variant.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {productUtils.formatPrice(variant.price)}
                        </div>
                      </div>
                    </td>
                    <td className="py-2">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {variant.sku_suffix}
                      </span>
                    </td>
                    <td className="py-2">
                      {productUtils.formatPrice(variant.price)}
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        variant.stock > 10 ? 'bg-green-100 text-green-800' :
                        variant.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {variant.stock}
                      </span>
                    </td>
                    <td className="py-2">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-2 text-gray-500">
                      {new Date(variant.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit'
                      })}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => navigate(`/admin/products/variants/edit/${variant.id}`)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          title="Editar variante"
                        >
                          <Edit size={12} />
                        </button>
                        
                        <button
                          onClick={() => handleToggleVariantStatus(variant.id, variant.name, !isActive)}
                          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                          title={isActive ? 'Desactivar' : 'Activar'}
                        >
                          {isActive ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteVariant(variant.id, variant.name)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Eliminar variante"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Componente de notificación optimizado
const ToastNotification = ({ toast, onClose }: { toast: Toast; onClose: (id: number) => void }) => (
  <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl max-w-md animate-in slide-in-from-top-2 ${
    toast.type === 'success' ? 'bg-green-50 border border-green-200' :
    toast.type === 'error' ? 'bg-red-50 border border-red-200' :
    'bg-blue-50 border border-blue-200'
  }`}>
    <div className="flex items-center gap-3">
      {toast.type === 'success' ? (
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">✓</span>
        </div>
      ) : toast.type === 'error' ? (
        <AlertCircle className="text-red-500" size={20} />
      ) : (
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">i</span>
        </div>
      )}
      <p className={`text-sm flex-1 ${
        toast.type === 'success' ? 'text-green-700' :
        toast.type === 'error' ? 'text-red-700' : 'text-blue-700'
      }`}>
        {toast.message}
      </p>
      <button onClick={() => onClose(toast.id)} className="text-xl leading-none hover:opacity-70">
        ×
      </button>
    </div>
  </div>
);

const ProductsPage = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    type: 'ALL',
    sortBy: 'default',
    status: 'ALL',
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { products, loading, refreshProducts, activateProduct, deactivateProduct, deleteProduct } = useProducts();

  // Funciones optimizadas
  const addToast = (message: string, type: Toast['type']) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  const handleToggleStatus = async (id: string, name: string, isActive: boolean) => {
    try {
      if (isActive) {
        await activateProduct(id);
        addToast(`Producto "${name}" activado`, 'success');
      } else {
        await deactivateProduct(id);
        addToast(`Producto "${name}" desactivado`, 'success');
      }
      refreshProducts();
    } catch (error) {
      addToast(`Error al cambiar estado de "${name}"`, 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${name}"?`)) {
      try {
        await deleteProduct(id);
        addToast(`Producto "${name}" eliminado`, 'success');
        refreshProducts();
      } catch (error) {
        addToast(`Error al eliminar "${name}"`, 'error');
      }
    }
  };

  // Filtrado y ordenamiento optimizado
  const processedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      if (filters.status === 'ACTIVE') return product.is_active && !product.deleted_at;
      if (filters.status === 'INACTIVE') return !product.is_active && !product.deleted_at;
      if (filters.status === 'DELETED') return !!product.deleted_at;
      return !product.deleted_at; // ALL por defecto
    });

    if (filters.type !== 'ALL') {
      if (filters.type === 'VARIABLE') {
        // Mostrar productos que tengan variantes (independientemente del tipo)
        filtered = filtered.filter(product => 
          product.variants && product.variants.length > 0
        );
      } else {
        // Para SIMPLE, mostrar productos sin variantes o tipo SIMPLE
        filtered = filtered.filter(product => 
          product.type === filters.type || 
          (product.variants && product.variants.length === 0)
        );
      }
    }

    if (filters.search.trim()) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        product.description?.toLowerCase().includes(search)
      );
    }

    // Ordenamiento
    switch (filters.sortBy) {
      case 'name_asc':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':
        return filtered.sort((a, b) => b.name.localeCompare(a.name));
      case 'price_asc':
        return filtered.sort((a, b) => (a.base_price || 0) - (b.base_price || 0));
      case 'price_desc':
        return filtered.sort((a, b) => (b.base_price || 0) - (a.base_price || 0));
      case 'newest':
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      default:
        return filtered;
    }
  }, [products, filters]);

  // Crear lista de elementos a mostrar (productos o variantes según el filtro)
  const displayItems = useMemo(() => {
    if (filters.type === 'VARIABLE') {
      // Cuando el filtro es VARIABLE, mostrar las variantes como elementos principales
      const variantItems = processedProducts.flatMap(product => 
        (product.variants || []).map(variant => ({
          ...variant,
          parentProduct: product,
          isVariant: true,
          // Agregar propiedades que faltan para compatibilidad
          displayName: `${product.name} - ${variant.sku_suffix}`,
          displaySku: variant.sku_suffix,
          displayPrice: variant.price,
          displayType: 'VARIABLE' as const,
          displayCategories: product.categories,
          displayDescription: product.description
        }))
      );

      // Aplicar búsqueda a las variantes también
      if (filters.search.trim()) {
        const search = filters.search.toLowerCase();
        return variantItems.filter(item =>
          item.displayName.toLowerCase().includes(search) ||
          item.sku_suffix.toLowerCase().includes(search)
        );
      }

      return variantItems;
    } else {
      // Para otros filtros, mostrar productos normales
      return processedProducts.map(product => ({
        ...product,
        isVariant: false
      }));
    }
  }, [processedProducts, filters]);

  const hasFilters = Object.values(filters).some(v => v !== '' && v !== 'ALL' && v !== 'default');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Toasts */}
      {toasts.map(toast => (
        <ToastNotification key={toast.id} toast={toast} onClose={removeToast} />
      ))}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Productos</h1>
            <p className="text-gray-600 mt-1">Administra tu catálogo de productos</p>
          </div>
          <button
            onClick={refreshProducts}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full disabled:opacity-50"
            title="Recargar"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} className="mr-2" />
            Filtros
          </button>

          <button
            onClick={() => navigate('/admin/products/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Crear Producto
          </button>
        </div>
      </div>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Nombre, SKU, descripción..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as ProductType | 'ALL' }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Todos los productos</option>
                <option value="SIMPLE">Productos simples</option>
                <option value="VARIABLE">Con variantes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as Filters['status'] }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Todos</option>
                <option value="ACTIVE">Activos</option>
                <option value="INACTIVE">Inactivos</option>
                <option value="DELETED">Eliminados</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as Filters['sortBy'] }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">Por defecto</option>
                <option value="name_asc">Nombre A-Z</option>
                <option value="name_desc">Nombre Z-A</option>
                <option value="price_asc">Precio menor</option>
                <option value="price_desc">Precio mayor</option>
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguos</option>
              </select>
            </div>
          </div>

          {hasFilters && (
            <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setFilters({ search: '', type: 'ALL', sortBy: 'default', status: 'ALL' })}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <X size={14} />
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Estadísticas */}
      {!loading && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 border border-blue-100">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-semibold">{displayItems.length}</span> de <span className="font-semibold">{products.length}</span> productos
              {hasFilters && <span className="text-blue-600 ml-2">(filtrados)</span>}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Package size={14} />
                Variables: {displayItems.filter(p => p.type === 'VARIABLE').length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && displayItems.length === 0 && (
        <div className="text-center py-16">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {hasFilters ? 'No se encontraron productos' : 'No hay productos'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {hasFilters
              ? 'No encontramos productos que coincidan con los filtros aplicados.'
              : 'Comienza construyendo tu catálogo creando tu primer producto.'
            }
          </p>
          {hasFilters ? (
            <button
              onClick={() => setFilters({ search: '', type: 'ALL', sortBy: 'default', status: 'ALL' })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Limpiar filtros
            </button>
          ) : (
            <button
              onClick={() => navigate('/admin/products/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Crear Producto
            </button>
          )}
        </div>
      )}

      {/* Lista de productos optimizada */}
      {!loading && displayItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="products-table">
              <thead className="bg-gray-50">
                <tr>
                  <th>Imagen</th>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Categorías</th>
                  <th>Estado</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayItems.map(item => {
                  const isVariant = item.isVariant;
                  const primaryImage = isVariant 
                    ? (item.images && item.images.length > 0 ? getImageUrl(item.images[0].url) : null)
                    : productUtils.getPrimaryImage(item);
                  const isActive = item.is_active && !item.deleted_at;
                  const hasVariants = !isVariant && item.variants && item.variants.length > 0;
                  
                  // Obtener propiedades según el tipo usando type guards
                  const itemName = isVariant ? item.displayName : item.name;
                  const itemSku = isVariant ? item.sku_suffix : item.sku;
                  const itemPrice = isVariant ? item.displayPrice : item.base_price;
                  const itemCategories = isVariant ? item.displayCategories : item.categories;
                  const itemType = isVariant ? 'VARIABLE' : item.type;
                  
                  return (
                    <>
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td>
                          <div className="h-16 w-16 flex-shrink-0">
                            {primaryImage ? (
                              <img 
                                src={primaryImage} 
                                alt={itemName} 
                                className="product-image" 
                                title={itemName}
                                style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '0.5rem' }}
                              />
                            ) : (
                              <div className="product-image-placeholder">
                                <Image className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="min-w-0 flex-1">
                            <div className="product-name" title={itemName}>
                              {itemName}
                              {isVariant && (
                                <span className="text-xs text-gray-500 ml-2">
                                  (Variante de {item.parentProduct?.name})
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                              <span className={`inline-flex px-1.5 py-0.5 text-xs rounded-full ${
                                isVariant ? 'bg-purple-100 text-purple-800' : 
                                itemType === 'SIMPLE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {isVariant ? 'Variante' : itemType === 'SIMPLE' ? 'Simple' : 'Variable'}
                              </span>
                              {itemPrice && (
                                <span className="font-medium text-gray-700">
                                  {productUtils.formatPrice(itemPrice)}
                                </span>
                              )}
                              {hasVariants && (
                                <span className="text-purple-600 font-medium">
                                  {item.variants.length} variante{item.variants.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="sku-badge">{itemSku}</span>
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-1 max-w-32">
                            {itemCategories.slice(0, 2).map(category => (
                              <span key={category.id} className="category-tag">
                                <Tag size={10} className="mr-1" />
                                {category.name}
                              </span>
                            ))}
                            {itemCategories.length > 2 && (
                              <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                                +{itemCategories.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                            {isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="text-sm text-gray-500">
                          {new Date(item.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit'
                          })}
                        </td>
                        <td>
                          <div className="flex gap-1">
                            {isVariant ? (
                              <>
                                <button
                                  onClick={() => navigate(`/admin/products/variants/edit/${item.id}`)}
                                  className="action-button edit"
                                  title="Editar variante"
                                >
                                  <Edit size={14} />
                                </button>
                                
                                <button
                                  onClick={() => handleToggleStatus(item.id, itemName, !isActive)}
                                  className="action-button toggle"
                                  title={isActive ? 'Desactivar' : 'Activar'}
                                >
                                  {isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                                
                                <button
                                  onClick={() => handleDelete(item.id, itemName)}
                                  className="action-button delete"
                                  title="Eliminar variante"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => navigate(`/admin/products/edit/${item.id}`)}
                                  className="action-button edit"
                                  title="Editar producto"
                                >
                                  <Edit size={14} />
                                </button>
                                
                                {hasVariants && (
                                  <button
                                    onClick={() => navigate(`/admin/products/${item.id}/variants`)}
                                    className="action-button variant"
                                    title="Gestionar variantes"
                                  >
                                    <Settings size={14} />
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => navigate(`/admin/products/${item.id}/variants/create`, { 
                                    state: { parentProductName: item.name } 
                                  })}
                                  className="action-button create"
                                  title="Crear variante"
                                >
                                  <Plus size={14} />
                                </button>
                                
                                <button
                                  onClick={() => handleToggleStatus(item.id, item.name, !isActive)}
                                  className="action-button toggle"
                                  title={isActive ? 'Desactivar' : 'Activar'}
                                >
                                  {isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                                
                                <button
                                  onClick={() => handleDelete(item.id, item.name)}
                                  className="action-button delete"
                                  title="Eliminar producto"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {/* Subt tabla para variantes solo si no es una variante y tiene variantes */}
                      {!isVariant && hasVariants && (
                        <tr>
                          <td colSpan={7} className="px-0">
                            <VariantsSubTable variants={item.variants} productName={item.name} />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;