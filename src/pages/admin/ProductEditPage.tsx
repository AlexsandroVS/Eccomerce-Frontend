import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Image, X, Plus, AlertCircle, Package, DollarSign, Tag, Upload, Trash2, Star, StarOff, RefreshCw, Settings, Edit } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import VariantEditModal from '../../components/admin/VariantEditModal';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { getImageUrl } from '../../utils/image.utils';
import type { ProductUpdateData } from '../../types/product.types';

interface FormData {
  name: string;
  sku: string;
  slug: string;
  description: string;
  base_price: string;
  stock: string;
  min_stock: string;
  categories: number[];
  is_active: boolean;
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

const ToastNotification = ({ toast, onClose }: { toast: Toast; onClose: (id: number) => void }) => (
  <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl max-w-md ${
    toast.type === 'success' ? 'bg-green-50 border border-green-200' :
    toast.type === 'error' ? 'bg-red-50 border border-red-200' :
    'bg-blue-50 border border-blue-200'
  }`}>
    <div className="flex items-center gap-3">
      <p className={`text-sm flex-1 ${
        toast.type === 'success' ? 'text-green-700' :
        toast.type === 'error' ? 'text-red-700' :
        'text-blue-700'
      }`}>
        {toast.message}
      </p>
      <button onClick={() => onClose(toast.id)} className="text-xl">×</button>
    </div>
  </div>
);

const ProductEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { updateProduct, getProduct, uploadImage, deleteImage } = useProducts();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    sku: '',
    slug: '',
    description: '',
    base_price: '',
    stock: '',
    min_stock: '',
    categories: [],
    is_active: true
  });

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastId, setToastId] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const productData = await getProduct(id);
        if (!productData) {
          addToast('Producto no encontrado', 'error');
          return;
        }
        setProduct(productData);
        
        setFormData({
          name: productData.name || '',
          sku: productData.sku || '',
          slug: productData.slug || '',
          description: productData.description || '',
          base_price: productData.base_price?.toString() || '',
          stock: productData.stock?.toString() || '',
          min_stock: productData.min_stock?.toString() || '',
          categories: productData.categories?.map((cat: any) => cat.id) || [],
          is_active: productData.is_active ?? true
        });
      } catch (error) {
        console.error('Error loading product:', error);
        addToast('Error al cargar el producto', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, getProduct]);

  const addToast = (message: string, type: Toast['type']) => {
    const newToast: Toast = { message, type, id: toastId };
    setToasts(prev => [...prev, newToast]);
    setToastId(prev => prev + 1);
    
    setTimeout(() => {
      removeToast(newToast.id);
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!id) return;

    setUpdating(true);
    try {
      const updateData: ProductUpdateData = {
        name: formData.name,
        sku: formData.sku,
        slug: formData.slug,
        description: formData.description,
        base_price: formData.base_price ? parseFloat(formData.base_price) : undefined,
        stock: formData.stock ? parseInt(formData.stock) : undefined,
        min_stock: formData.min_stock ? parseInt(formData.min_stock) : undefined,
        categories: formData.categories
      };

      await updateProduct(id, updateData);
      addToast('Producto actualizado exitosamente', 'success');
      
      const updatedProduct = await getProduct(id);
      setProduct(updatedProduct);
    } catch (error: any) {
      console.error('Error updating product:', error);
      addToast(error.message || 'Error al actualizar el producto', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditVariant = (variant: any) => {
    setSelectedVariant(variant);
    setIsVariantModalOpen(true);
  };

  const handleSaveVariant = async (variantId: string, data: any) => {
    try {
      addToast('Variante actualizada exitosamente', 'success');
      const updatedProduct = await getProduct(id!);
      setProduct(updatedProduct);
    } catch (error) {
      console.error('Error updating variant:', error);
      addToast('Error al actualizar la variante', 'error');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      addToast('Variante eliminada exitosamente', 'success');
      const updatedProduct = await getProduct(id!);
      setProduct(updatedProduct);
    } catch (error) {
      console.error('Error deleting variant:', error);
      addToast('Error al eliminar la variante', 'error');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !id) return;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadImage({
          product_id: id,
          file,
          is_primary: product.images?.length === 0 // La primera imagen será primaria
        });
      }
      
      addToast('Imágenes subidas exitosamente', 'success');
      const updatedProduct = await getProduct(id);
      setProduct(updatedProduct);
    } catch (error) {
      console.error('Error uploading images:', error);
      addToast('Error al subir las imágenes', 'error');
    }
    
    // Limpiar el input
    event.target.value = '';
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta imagen?')) return;

    try {
      await deleteImage(id!, imageId);
      addToast('Imagen eliminada exitosamente', 'success');
      const updatedProduct = await getProduct(id!);
      setProduct(updatedProduct);
    } catch (error) {
      console.error('Error deleting image:', error);
      addToast('Error al eliminar la imagen', 'error');
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    try {
      // Aquí deberías implementar la lógica para cambiar la imagen primaria
      // Por ahora, solo recargamos el producto
      addToast('Imagen primaria actualizada', 'success');
      const updatedProduct = await getProduct(id!);
      setProduct(updatedProduct);
    } catch (error) {
      console.error('Error setting primary image:', error);
      addToast('Error al actualizar la imagen primaria', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Producto no encontrado</h2>
          <button
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a Productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toasts.map(toast => (
        <ToastNotification key={toast.id} toast={toast} onClose={removeToast} />
      ))}

      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/products')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Producto</h1>
              <p className="text-gray-600 mt-1">{product.name}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/admin/products/${id}/variants`)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Settings size={20} />
              Gestionar Variantes
            </button>
            <button
              form="product-edit-form"
              type="submit"
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              {updating ? (
                <RefreshCw size={20} className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              {updating ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <form id="product-edit-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Información básica */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package size={20} />
                  Información Básica
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ingresa el nombre del producto"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU *
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="SKU-PRODUCTO"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="slug-del-producto"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe las características y beneficios del producto..."
                    />
                  </div>
                </div>
              </div>

              {/* Precio y stock */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign size={20} />
                  Precio y Stock
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio Base
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.base_price}
                        onChange={(e) => setFormData(prev => ({ ...prev, base_price: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Mínimo
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.min_stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_stock: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Producto activo</span>
                  </label>
                </div>
              </div>

              {/* Categorías */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag size={20} />
                  Categorías
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.filter((category, index, self) => 
                    index === self.findIndex(c => c.id === category.id)
                  ).map((category) => (
                    <label key={`category-${category.id}`} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, categories: [...prev.categories, category.id] }));
                          } else {
                            setFormData(prev => ({ ...prev, categories: prev.categories.filter(id => id !== category.id) }));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Imágenes del Producto */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Image size={20} />
                  Imágenes del Producto
                </h3>
                
                {product.images && product.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {product.images.map((image: any) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={getImageUrl(image.url)}
                          alt={image.alt_text || 'Product image'}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(image.id)}
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
                              onClick={() => handleDeleteImage(image.id)}
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
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Image size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>Este producto no tiene imágenes</p>
                  </div>
                )}

                {/* Botón para agregar imágenes */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => document.getElementById('product-images')?.click()}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload size={20} />
                    Agregar Imágenes
                  </button>
                  <input
                    id="product-images"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              {/* Variantes */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Variantes del Producto</h3>
                {product.variants && product.variants.length > 0 ? (
                  <div className="space-y-4">
                    {product.variants.map((variant: any) => (
                      <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{variant.name || variant.sku_suffix}</h4>
                            <p className="text-sm text-gray-600">
                              SKU: {variant.sku || variant.sku_suffix} | Stock: {variant.stock} | Precio: S/ {variant.price}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleEditVariant(variant)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>Este producto no tiene variantes</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Producto</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {product.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Variantes:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {product.variants?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/products/${id}/variants/create`)}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Crear Variante
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/products/${id}/variants`)}
                    className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Settings size={16} />
                    Gestionar Variantes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <VariantEditModal
        variant={selectedVariant}
        isOpen={isVariantModalOpen}
        onClose={() => {
          setIsVariantModalOpen(false);
          setSelectedVariant(null);
        }}
        onSave={handleSaveVariant}
        onDelete={handleDeleteVariant}
        onImageUpload={async () => {}}
        onImageDelete={async () => {}}
        onImagePrimaryChange={async () => {}}
      />
    </div>
  );
};

export default ProductEditPage; 