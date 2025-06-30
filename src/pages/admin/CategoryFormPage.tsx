import { useState, useMemo, useEffect, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  EyeOff, 
  Folder, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Lightbulb,
  Info
} from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import type { Category } from '../../types/category.types';

// Tipos para el formulario
interface CategoryFormData {
  name: string;
  slug: string;
  parent_id: number | null;
  is_active: boolean;
}

interface FormErrors {
  name?: string;
  slug?: string;
  parent_id?: string;
  general?: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

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

// Componente principal
const CategoryFormPage = () => {
  const navigate = useNavigate();

  // Hook para categorías
  const { 
    categories, 
    error, 
    createCategory,
    clearError 
  } = useCategories();

  // Estado del formulario
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    parent_id: null,
    is_active: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  // Categorías disponibles para ser padre
  const availableParentCategories = useMemo(() => {
    return categories.filter(cat => cat.is_active && !cat.deleted_at);
  }, [categories]);

  // Funciones para toasts
  const addToast = (message: string, type: Toast['type']) => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Función para generar slug
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Verificar disponibilidad del slug
  const checkSlugAvailability = async (slug: string) => {
    if (!slug.trim()) {
      setSlugAvailable(null);
      return;
    }

    setCheckingSlug(true);
    
    // Simular verificación de disponibilidad
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const slugExists = categories.some(cat => cat.slug === slug);
    
    setSlugAvailable(!slugExists);
    setCheckingSlug(false);
  };

  // Manejadores de eventos
  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
    
    // Auto-generar slug si no se ha modificado manualmente
    if (!formData.slug || formData.slug === generateSlug(formData.name)) {
      const newSlug = generateSlug(value);
      setFormData(prev => ({ ...prev, slug: newSlug }));
      checkSlugAvailability(newSlug);
    }
    
    // Limpiar error del nombre
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handleSlugChange = (value: string) => {
    setFormData(prev => ({ ...prev, slug: value }));
    checkSlugAvailability(value);
    
    // Limpiar error del slug
    if (errors.slug) {
      setErrors(prev => ({ ...prev, slug: undefined }));
    }
  };

  const handleParentChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      parent_id: value ? parseInt(value) : null 
    }));
    
    // Limpiar error del padre
    if (errors.parent_id) {
      setErrors(prev => ({ ...prev, parent_id: undefined }));
    }
  };

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'El slug es requerido';
    } else if (slugAvailable === false) {
      newErrors.slug = 'Este slug ya está en uso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createCategory(formData);
      addToast(`Categoría "${formData.name}" creada correctamente`, 'success');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/admin/categories');
      }, 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la categoría';
      addToast(errorMessage, 'error');
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cancelación con confirmación
  const handleCancel = () => {
    const hasChanges = formData.name || formData.slug || formData.parent_id;
    
    if (hasChanges) {
      if (window.confirm('¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.')) {
        navigate('/admin/categories');
      }
    } else {
      navigate('/admin/categories');
    }
  };

  // Obtener nombre de categoría padre para vista previa
  const getParentName = (parentId: number | null): string => {
    if (!parentId) return '';
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.name : '';
  };

  // Construir jerarquía para mostrar en el select
  const buildCategoryOptions = (categories: Category[], _level = 0): JSX.Element[] => {
    const options: JSX.Element[] = [];
    const rootCategories = categories.filter(cat => cat.parent_id === null);
    
    const addCategoryAndChildren = (category: Category, currentLevel: number) => {
      const indent = '— '.repeat(currentLevel);
      options.push(
        <option key={category.id} value={category.id}>
          {indent}{category.name}
        </option>
      );
      
      const children = categories.filter(cat => cat.parent_id === category.id);
      children.forEach(child => addCategoryAndChildren(child, currentLevel + 1));
    };

    rootCategories.forEach(category => addCategoryAndChildren(category, 0));
    return options;
  };

  // Formatear fecha
  const formatDate = () => {
    return new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

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
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver a categorías</span>
        </button>
        <div className="h-6 border-l border-gray-300"></div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Crear Nueva Categoría
          </h1>
          <p className="text-gray-600 mt-1">
            Complete los datos para crear una nueva categoría
          </p>
        </div>
      </div>

      {/* Error general */}
      {(error || errors.general) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <p className="text-red-700 flex-1">{error || errors.general}</p>
          <button 
            onClick={() => {
              clearError();
              setErrors(prev => ({ ...prev, general: undefined }));
            }}
            className="text-red-500 hover:text-red-700 text-xl leading-none"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario principal */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre de la categoría */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre de la categoría
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ej: Tecnología, Deportes, Noticias..."
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                />
                <p className="text-sm text-gray-500">
                  El nombre será visible para los usuarios y se usará para generar automáticamente el slug.
                </p>
                
                {errors.name && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle size={16} />
                    <span>{errors.name}</span>
                  </div>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  Slug (URL amigable)
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    id="slug"
                    type="text"
                    placeholder="ej: tecnologia, deportes, noticias"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white pr-12"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {checkingSlug ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                    ) : slugAvailable === true ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : slugAvailable === false ? (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    ) : null}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Se usa en las URLs. Solo letras minúsculas, números y guiones. Se genera automáticamente desde el nombre.
                </p>
                
                {slugAvailable === true && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle size={16} />
                    <span>Slug disponible</span>
                  </div>
                )}
                
                {errors.slug && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle size={16} />
                    <span>{errors.slug}</span>
                  </div>
                )}
              </div>

              {/* Categoría padre */}
              <div className="space-y-2">
                <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700">
                  Categoría padre
                </label>
                <select
                  id="parent_id"
                  value={formData.parent_id || ''}
                  onChange={(e) => handleParentChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="">Selecciona una categoría padre (opcional)</option>
                  {buildCategoryOptions(availableParentCategories)}
                </select>
                <p className="text-sm text-gray-500">
                  Opcional. Selecciona una categoría padre para crear una jerarquía.
                </p>
                
                {errors.parent_id && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle size={16} />
                    <span>{errors.parent_id}</span>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting || checkingSlug || slugAvailable === false}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Crear Categoría
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Vista previa */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Vista Previa</h3>
              <button 
                onClick={() => setPreviewVisible(!previewVisible)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {previewVisible ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            
            {previewVisible && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Folder className="text-blue-600 w-5 h-5" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {formData.name || 'Nombre de la categoría'}
                    </p>
                    <p className="text-sm text-gray-500">
                      /{formData.slug || 'slug-de-la-categoria'}
                    </p>
                  </div>
                </div>
                
                {formData.parent_id && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Categoría padre:</span>
                    <br />
                    <span>{getParentName(formData.parent_id)}</span>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Estado:</span>
                  <br />
                  <span className="text-green-600">Activa</span>
                </div>
              </div>
            )}
          </div>

          {/* Consejos */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Lightbulb size={20} />
              Consejos
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Usa nombres descriptivos y claros</li>
              <li>• El slug se genera automáticamente, pero puedes editarlo</li>
              <li>• Las categorías pueden tener subcategorías (jerarquía)</li>
              <li>• Evita crear demasiados niveles de profundidad</li>
              <li>• Usa categorías para organizar tu contenido lógicamente</li>
            </ul>
          </div>

          {/* Información */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Info size={20} />
              Información
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">Estado:</span> Nuevo
              </div>
              <div>
                <span className="font-medium">Fecha:</span> {formatDate()}
              </div>
              <div>
                <span className="font-medium">Usuario:</span> Administrador
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryFormPage;