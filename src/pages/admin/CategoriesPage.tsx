import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, FolderTree, AlertCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import type { Category } from '../../types/category.types';
import { 
  buildCategoryTree, 
  flattenCategoryTree, 
  filterCategories, 
  sortCategories, 
  countSubcategories,
  canDeleteCategory 
} from '../../utils/category.utils';

// Tipos para filtros y estado
interface Filters {
  search: string;
  viewType: 'tree' | 'list';
  sortBy: 'name_asc' | 'name_desc' | 'newest' | 'oldest' | 'default';
  showOnlyActive: boolean;
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

// Componente para estado vacío
const EmptyState = ({ hasFilters, onCreateClick, onClearFilters }: {
  hasFilters: boolean;
  onCreateClick: () => void;
  onClearFilters: () => void;
}) => (
  <div className="text-center py-16">
    <FolderTree className="mx-auto h-16 w-16 text-gray-400 mb-4" />
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      {hasFilters ? 'No se encontraron categorías' : 'No hay categorías'}
    </h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">
      {hasFilters 
        ? 'No encontramos categorías que coincidan con los filtros aplicados. Intenta ajustar los criterios de búsqueda.'
        : 'Comienza organizando tu contenido creando tu primera categoría. Las categorías te ayudan a estructurar y encontrar información fácilmente.'
      }
    </p>
    {hasFilters ? (
      <button 
        onClick={onClearFilters}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
      >
        Limpiar filtros
      </button>
    ) : (
      <button 
        onClick={onCreateClick}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
      >
        <Plus size={20} />
        Crear Categoría
      </button>
    )}
  </div>
);

// Componente de notificación/toast
const ToastNotification = ({ toast, onClose }: { toast: Toast; onClose: (id: number) => void }) => (
  <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl max-w-md animate-in slide-in-from-top-2 ${
    toast.type === 'success' 
      ? 'bg-green-50 border border-green-200' 
      : toast.type === 'error'
      ? 'bg-red-50 border border-red-200'
      : 'bg-blue-50 border border-blue-200'
  }`}>
    <div className="flex items-center gap-3">
      {toast.type === 'success' ? (
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">✓</span>
        </div>
      ) : toast.type === 'error' ? (
        <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
      ) : (
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">i</span>
        </div>
      )}
      <p className={`text-sm flex-1 ${
        toast.type === 'success' 
          ? 'text-green-700' 
          : toast.type === 'error'
          ? 'text-red-700'
          : 'text-blue-700'
      }`}>
        {toast.message}
      </p>
      <button 
        onClick={() => onClose(toast.id)}
        className={`ml-2 text-xl leading-none hover:opacity-70 transition-opacity ${
          toast.type === 'success' 
            ? 'text-green-500' 
            : toast.type === 'error'
            ? 'text-red-500'
            : 'text-blue-500'
        }`}
      >
        ×
      </button>
    </div>
  </div>
);

const CategoriesPage = () => {
  // Estado local
  const navigate = useNavigate();

  const [filters, setFilters] = useState<Filters>({
    search: '',
    viewType: 'tree',
    sortBy: 'default',
    showOnlyActive: false,
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Hook para categorías
  const { 
    categories, 
    loading, 
    error, 
    refreshCategories, 
    activateCategory, 
    deactivateCategory, 
    deleteCategory,
    clearError 
  } = useCategories();

  // Funciones para toasts
  const addToast = (message: string, type: Toast['type']) => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Función para manejar la búsqueda
  const handleSearch = async () => {
    if (!filters.search.trim()) {
      addToast('Ingresa un término de búsqueda', 'info');
      return;
    }

    setIsSearching(true);
    try {
      // Simular una búsqueda más elaborada si es necesario
      // Por ahora, el filtro se aplica automáticamente en processedCategories
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay de búsqueda
      
      const resultsCount = processedCategories.length;
      if (resultsCount === 0) {
        addToast('No se encontraron categorías con ese término', 'info');
      } else {
        addToast(`Se encontraron ${resultsCount} categoría${resultsCount !== 1 ? 's' : ''}`, 'success');
      }
    } catch (err) {
      addToast('Error al realizar la búsqueda', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // Manejar acciones de categorías
  const handleActivateCategory = async (id: number, name: string) => {
    try {
      await activateCategory(id);
      addToast(`Categoría "${name}" activada correctamente`, 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al activar la categoría', 'error');
    }
  };

  const handleDeactivateCategory = async (id: number, name: string) => {
    try {
      await deactivateCategory(id);
      addToast(`Categoría "${name}" desactivada correctamente`, 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al desactivar la categoría', 'error');
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente la categoría "${name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await deleteCategory(id);
      addToast(`Categoría "${name}" eliminada permanentemente`, 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al eliminar la categoría', 'error');
    }
  };

  // Filtrar y procesar categorías
  const processedCategories = useMemo(() => {
    let filtered = [...categories];

    // Filtrar por estado activo/inactivo
    if (filters.showOnlyActive) {
      filtered = filtered.filter(cat => cat.is_active && !cat.deleted_at);
    } else {
      filtered = filtered.filter(cat => !cat.deleted_at);
    }

    // Filtrar por búsqueda
    if (filters.search.trim()) {
      filtered = filterCategories(filtered, filters.search);
    }

    // Ordenar
    if (filters.sortBy !== 'default') {
      const [field, order] = filters.sortBy.includes('name') 
        ? ['name', filters.sortBy.split('_')[1] as 'asc' | 'desc']
        : filters.sortBy === 'newest' 
          ? ['created_at', 'desc' as const]
          : ['created_at', 'asc' as const];
      
      filtered = sortCategories(filtered, field as 'name' | 'created_at', order);
    }

    // Organizar según el tipo de vista
    if (filters.viewType === 'tree') {
      const tree = buildCategoryTree(filtered);
      return flattenCategoryTree(tree);
    }

    return filtered;
  }, [categories, filters]);

  // Obtener nombres de categorías padre
  const getParentName = (parentId: number | null): string => {
    if (!parentId) return '-';
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.name : 'Categoría eliminada';
  };

  // Obtener estado de categoría
  const getCategoryStatus = (category: Category) => {
    if (category.is_active && !category.deleted_at) {
      return {
        status: 'active' as const,
        statusText: 'Activa',
        className: 'bg-green-100 text-green-800'
      };
    } else {
      return {
        status: 'inactive' as const,
        statusText: 'Inactiva',
        className: 'bg-red-100 text-red-800'
      };
    }
  };

  // Formatear fecha
  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      viewType: 'tree',
      sortBy: 'default',
      showOnlyActive: false,
    });
  };

  // Verificar si hay filtros aplicados
  const hasFilters = filters.search.trim() !== '' || 
                    filters.sortBy !== 'default' || 
                    filters.showOnlyActive;

  // Auto-cerrar error después de 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Toasts */}
      {toasts.map(toast => (
        <ToastNotification key={toast.id} toast={toast} onClose={removeToast} />
      ))}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Categorías</h1>
            <p className="text-gray-600 mt-1">Organiza y estructura tu contenido</p>
          </div>
          <button 
            onClick={refreshCategories}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full disabled:opacity-50"
            title="Recargar categorías"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        
        <button 
          onClick={() => navigate("/admin/categories/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <Plus size={20} />
          Crear Categoría
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <p className="text-red-700 flex-1">{error}</p>
          <button 
            onClick={clearError}
            className="text-red-500 hover:text-red-700 text-xl leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar categorías
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre o slug..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vista
            </label>
            <select 
              value={filters.viewType}
              onChange={(e) => setFilters(prev => ({ ...prev, viewType: e.target.value as 'tree' | 'list' }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tree">Vista de Árbol</option>
              <option value="list">Vista de Lista</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <select 
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as Filters['sortBy'] }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">Por defecto</option>
              <option value="name_asc">Nombre A-Z</option>
              <option value="name_desc">Nombre Z-A</option>
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <button 
              onClick={() => setFilters(prev => ({ ...prev, showOnlyActive: !prev.showOnlyActive }))}
              className={`w-full px-4 py-2 border rounded-md transition-colors flex items-center justify-center gap-2 ${
                filters.showOnlyActive 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {filters.showOnlyActive ? <Eye size={16} /> : <EyeOff size={16} />}
              {filters.showOnlyActive ? 'Solo activas' : 'Todas'}
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <Search size={16} />
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
            <button 
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 border border-blue-100">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-semibold">{processedCategories.length}</span> de <span className="font-semibold">{categories.length}</span> categorías
              {hasFilters && <span className="text-blue-600 ml-2">(filtradas)</span>}
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando categorías...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && processedCategories.length === 0 && (
        <EmptyState 
          hasFilters={hasFilters}
          onCreateClick={() => navigate("/admin/categories/create")}
          onClearFilters={clearFilters}
        />
      )}

      {/* Categories Table */}
      {!loading && processedCategories.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría Padre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subcategorías
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedCategories.map((category) => {
                  const categoryStatus = getCategoryStatus(category);
                  const level = (category as any).level || 0;
                  const subcategoriesCount = countSubcategories(categories, category.id);
                  const canDelete = canDeleteCategory(categories, category.id);
                  
                  return (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FolderTree className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                          <div>
                            <div
                              className="text-sm font-medium text-gray-900"
                              style={{
                                paddingLeft: `${level * 20}px`
                              }}
                            >
                              {level > 0 && (
                                <span className="text-gray-400 mr-2">
                                  {'—'.repeat(level)} 
                                </span>
                              )}
                              {category.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {category.id} • Nivel: {level}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-800">
                          {category.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${categoryStatus.className}`}>
                          {categoryStatus.statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getParentName(category.parent_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {subcategoriesCount} subcategorías
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateShort(category.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {categoryStatus.status === 'active' && (
                            <button
                              onClick={() => handleDeactivateCategory(category.id, category.name)}
                              className="text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 transition-colors p-1 rounded"
                              title="Desactivar categoría"
                            >
                              <EyeOff size={16} />
                            </button>
                          )}
                          
                          {categoryStatus.status === 'inactive' && (
                            <button
                              onClick={() => handleActivateCategory(category.id, category.name)}
                              className="text-green-600 hover:text-green-900 hover:bg-green-50 p-1 rounded transition-colors"
                              title="Activar categoría"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            disabled={!canDelete}
                            className={`transition-colors p-1 rounded ${
                              canDelete 
                                ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            title={canDelete ? "Eliminar permanentemente" : "No se puede eliminar: tiene subcategorías"}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
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

export default CategoriesPage;