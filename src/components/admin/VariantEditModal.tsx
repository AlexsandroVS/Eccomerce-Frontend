import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Image, Upload, Star, StarOff, Plus, Package, Tag, AlertCircle, RefreshCw } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { getImageUrl } from '../../utils/image.utils';

interface VariantData {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  min_stock: number;
  is_active: boolean;
  attributes: Record<string, any>;
  images: Array<{
    id: string;
    url: string;
    alt_text?: string;
    is_primary: boolean;
  }>;
}

interface VariantEditModalProps {
  variant: VariantData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (variantId: string, data: Partial<VariantData>) => Promise<void>;
  onDelete: (variantId: string) => Promise<void>;
  onImageUpload: (variantId: string, file: File) => Promise<void>;
  onImageDelete: (imageId: string) => Promise<void>;
  onImagePrimaryChange: (imageId: string) => Promise<void>;
}

const VariantEditModal: React.FC<VariantEditModalProps> = ({
  variant,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onImageUpload,
  onImageDelete,
  onImagePrimaryChange
}) => {
  const [formData, setFormData] = useState<Partial<VariantData>>({
    name: '',
    sku: '',
    stock: 0,
    price: 0,
    min_stock: 5,
    is_active: true,
    attributes: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newImages, setNewImages] = useState<File[]>([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      setNewImages(prev => [...prev, ...acceptedFiles]);
    }
  });

  useEffect(() => {
    if (variant) {
      setFormData({
        name: variant.name || '',
        sku: variant.sku || '',
        stock: variant.stock || 0,
        price: variant.price || 0,
        min_stock: variant.min_stock || 5,
        is_active: variant.is_active ?? true,
        attributes: { ...(variant.attributes || {}) }
      });
    }
  }, [variant]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.sku?.trim()) {
      newErrors.sku = 'El SKU es requerido';
    }

    if (formData.stock === undefined || formData.stock < 0) {
      newErrors.stock = 'El stock debe ser mayor o igual a 0';
    }

    if (formData.price === undefined || formData.price < 0) {
      newErrors.price = 'El precio debe ser mayor o igual a 0';
    }

    if (formData.min_stock !== undefined && formData.min_stock < 0) {
      newErrors.min_stock = 'El stock mínimo debe ser mayor o igual a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variant || !validateForm()) return;

    setIsLoading(true);
    try {
      await onSave(variant.id, formData);
      
      // Subir nuevas imágenes
      for (const file of newImages) {
        await onImageUpload(variant.id, file);
      }
      
      setNewImages([]);
      onClose();
    } catch (error) {
      console.error('Error saving variant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!variant) return;
    
    if (window.confirm('¿Estás seguro de que quieres eliminar esta variante?')) {
      setIsLoading(true);
      try {
        await onDelete(variant.id);
        onClose();
      } catch (error) {
        console.error('Error deleting variant:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAttributeChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: value
      }
    }));
  };

  const removeAttribute = (key: string) => {
    setFormData(prev => {
      const newAttributes = { ...prev.attributes };
      delete newAttributes[key];
      return {
        ...prev,
        attributes: newAttributes
      };
    });
  };

  if (!isOpen || !variant) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Editar Variante: {variant.name || variant.sku || 'Sin nombre'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Modifica los detalles de la variante del producto
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Información básica */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Package size={20} className="text-blue-600" />
                  Información Básica
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Variante *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Ej: Mesa de madera blanca"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU *
                    </label>
                    <input
                      type="text"
                      value={formData.sku || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.sku ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="SKU-VARIANTE"
                    />
                    {errors.sku && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.sku}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stock || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          errors.stock ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      />
                      {errors.stock && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.stock}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Mínimo
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.min_stock || 5}
                        onChange={(e) => setFormData(prev => ({ ...prev, min_stock: parseInt(e.target.value) || 5 }))}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          errors.min_stock ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      />
                      {errors.min_stock && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.min_stock}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          errors.price ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      />
                    </div>
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Variante activa</span>
                        <p className="text-xs text-gray-500">Los productos inactivos no se muestran en la tienda</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Atributos */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Tag size={20} className="text-green-600" />
                  Atributos
                </h3>
                
                <div className="space-y-3">
                  {Object.entries(formData.attributes || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-gray-700 min-w-0 flex-1">
                        <span className="text-gray-500">{key}:</span> {value}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttribute(key)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Agregar Atributo</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nombre (ej: Color)"
                      id="attr-name"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Valor (ej: Rojo)"
                      id="attr-value"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nameInput = document.getElementById('attr-name') as HTMLInputElement;
                      const valueInput = document.getElementById('attr-value') as HTMLInputElement;
                      if (nameInput.value && valueInput.value) {
                        handleAttributeChange(nameInput.value, valueInput.value);
                        nameInput.value = '';
                        valueInput.value = '';
                      }
                    }}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Agregar
                  </button>
                </div>
              </div>
            </div>

            {/* Imágenes */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Image size={20} className="text-purple-600" />
                  Imágenes de la Variante
                </h3>

                {/* Imágenes existentes */}
                {variant.images && variant.images.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Imágenes Actuales</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {variant.images.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={getImageUrl(image.url)}
                            alt={image.alt_text || 'Variant image'}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              <button
                                type="button"
                                onClick={() => onImagePrimaryChange(image.id)}
                                className={`p-2 rounded-full transition-colors ${
                                  image.is_primary 
                                    ? 'bg-yellow-500 text-white' 
                                    : 'bg-white/90 text-gray-600 hover:bg-yellow-500 hover:text-white'
                                }`}
                                title={image.is_primary ? 'Imagen primaria' : 'Marcar como primaria'}
                              >
                                {image.is_primary ? <Star size={16} /> : <StarOff size={16} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => onImageDelete(image.id)}
                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                title="Eliminar imagen"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                          {image.is_primary && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full font-medium">
                              Primaria
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subir nuevas imágenes */}
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <input {...getInputProps()} />
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Arrastra imágenes aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, WEBP hasta 5MB
                  </p>
                </div>

                {newImages.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Nuevas Imágenes</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {newImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg border-2 border-blue-300"
                          />
                          <button
                            type="button"
                            onClick={() => setNewImages(prev => prev.filter((_, i) => i !== index))}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 size={16} />
              Eliminar Variante
            </button>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VariantEditModal; 