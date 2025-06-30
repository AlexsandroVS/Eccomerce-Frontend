import React, { useState, useEffect } from 'react';
import { X, Plus, Image as ImageIcon, Trash2, Package, Settings, Star, StarOff } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category_id: string;
  status: 'draft' | 'published' | 'archived';
  images: Array<{ id: string; url: string; file: File; isPrimary?: boolean }>;
  variants: Array<{
    id: string;
    name: string;
    price_adjustment: number;
    stock: number;
    sku: string;
    images: Array<{ id: string; url: string; file: File }>;
  }>;
  stock: number;
  sku: string;
  brand: string;
  tags: string[];
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  mode?: 'create' | 'edit' | 'variant';
  parentProductId?: string;
  parentProductName?: string;
}

interface NewVariant {
  id?: string;
  name: string;
  price_adjustment: number;
  stock: number;
  sku: string;
  images: Array<{ id: string; url: string; file: File }>;
}

// Mock de productos existentes para el selector
const existingProducts = [
  { id: '1', name: 'Camiseta Básica', sku: 'CAM-001' },
  { id: '2', name: 'Pantalón Vaquero', sku: 'PAN-001' },
  { id: '3', name: 'Zapatillas Deportivas', sku: 'ZAP-001' },
];

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  mode = 'create',
  parentProductId,
  parentProductName
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    category_id: initialData?.category_id || '',
    status: initialData?.status || 'draft',
    images: initialData?.images || [],
    variants: initialData?.variants || [],
    stock: initialData?.stock || 0,
    sku: initialData?.sku || '',
    brand: initialData?.brand || '',
    tags: initialData?.tags || []
  });

  const [newVariant, setNewVariant] = useState<NewVariant>({
    name: '',
    price_adjustment: 0,
    stock: 0,
    sku: '',
    images: []
  });

  const [newTag, setNewTag] = useState('');
  const [selectedParentProduct, setSelectedParentProduct] = useState<string>(parentProductId || '');
  const [showVariantForm, setShowVariantForm] = useState(false);

  // TODO: Implementar fetch real de categorías
  const categories = [
    { id: '1', name: 'Ropa' },
    { id: '2', name: 'Accesorios' },
    { id: '3', name: 'Calzado' }
  ];

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 5,
    onDrop: (acceptedFiles: File[]) => {
      const newImages = acceptedFiles.map(file => ({
        id: Math.random().toString(),
        url: URL.createObjectURL(file),
        file,
        isPrimary: formData.images.length === 0 // La primera imagen será primaria por defecto
      }));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  });

  const { getRootProps: getVariantImageRootProps, getInputProps: getVariantImageInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 3,
    onDrop: (acceptedFiles: File[]) => {
      const newImages = acceptedFiles.map(file => ({
        id: Math.random().toString(),
        url: URL.createObjectURL(file),
        file
      }));
      setNewVariant(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  });

  // Limpiar URLs de objetos cuando se desmonte el componente
  useEffect(() => {
    return () => {
      formData.images.forEach(image => {
        if (image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
      formData.variants.forEach(variant => {
        variant.images.forEach(image => {
          if (image.url.startsWith('blob:')) {
            URL.revokeObjectURL(image.url);
          }
        });
      });
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (mode === 'variant' && !selectedParentProduct) {
      alert('Debes seleccionar un producto padre para crear una variante');
      return;
    }
    
    onSubmit(formData);
  };

  const handleAddVariant = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (newVariant.name && newVariant.sku) {
      const variantWithId: ProductFormData['variants'][0] = {
        ...newVariant,
        id: Math.random().toString()
      };
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, variantWithId]
      }));
      setNewVariant({
        name: '',
        price_adjustment: 0,
        stock: 0,
        sku: '',
        images: []
      });
      setShowVariantForm(false);
    }
  };

  const handleRemoveVariant = (e: React.MouseEvent, variantId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.id !== variantId)
    }));
  };

  const handleAddTag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleRemoveImage = (e: React.MouseEvent, imageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const imageToRemove = formData.images.find(img => img.id === imageId);
    if (imageToRemove?.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const handleSetPrimaryImage = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map(img => ({
        ...img,
        isPrimary: img.id === imageId
      }))
    }));
  };

  const getFormTitle = () => {
    switch (mode) {
      case 'variant':
        return 'Crear Variante de Producto';
      case 'edit':
        return 'Editar Producto';
      default:
        return 'Crear Nuevo Producto';
    }
  };

  const getSubmitButtonText = () => {
    switch (mode) {
      case 'variant':
        return 'Crear Variante';
      case 'edit':
        return 'Actualizar Producto';
      default:
        return 'Crear Producto';
    }
  };

  // Si estamos en modo variante, mostrar solo el formulario de variante
  if (mode === 'variant') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{getFormTitle()}</h1>
          <p className="text-gray-600 mt-2">
            {parentProductName && `Agregando variante al producto: ${parentProductName}`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selector de producto padre */}
          {!parentProductId && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Producto Padre</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar producto al que agregar la variante
                </label>
                <select
                  value={selectedParentProduct}
                  onChange={(e) => setSelectedParentProduct(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                  required
                >
                  <option value="">Seleccionar producto...</option>
                  {existingProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Formulario de variante */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de la Variante</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la variante
                </label>
                <input
                  type="text"
                  value={newVariant.name}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="Ej: Color Rojo, Talla M"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU de la variante
                </label>
                <input
                  type="text"
                  value={newVariant.sku}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ajuste de precio
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={newVariant.price_adjustment}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, price_adjustment: parseFloat(e.target.value) }))}
                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  value={newVariant.stock}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Imágenes de la variante */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imágenes de la variante
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {newVariant.images.map((image: any) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt="Variant"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setNewVariant(prev => ({
                          ...prev,
                          images: prev.images.filter(img => img.id !== image.id)
                        }));
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div
                {...getVariantImageRootProps()}
                className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-accent transition-colors"
              >
                <input {...getVariantImageInputProps()} />
                <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-1 text-sm text-gray-600">
                  Arrastra imágenes aquí o haz clic para seleccionar
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              {getSubmitButtonText()}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{getFormTitle()}</h1>
        <p className="text-gray-600 mt-2">
          {mode === 'edit' ? 'Modifica la información del producto' : 'Completa la información para crear un nuevo producto'}
        </p>
      </div>

    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información básica</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del producto
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
              required
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marca
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
              required
            />
          </div>
        </div>
      </div>

      {/* Precios y stock */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Precios y stock</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio base
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock base
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
              required
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'archived' }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Imágenes del producto */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Imágenes del producto</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {formData.images.map((image: any) => (
            <div key={image.id} className="relative group">
              <img
                src={image.url}
                alt="Product"
                className="w-full h-32 object-cover rounded-lg"
              />
              {/* Botón de imagen primaria */}
              <button
                type="button"
                onClick={() => handleSetPrimaryImage(image.id)}
                className={`absolute top-2 left-2 p-1 rounded-full transition-colors ${
                  image.isPrimary 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-white/80 text-gray-600 hover:bg-yellow-500 hover:text-white'
                }`}
                title={image.isPrimary ? 'Imagen primaria' : 'Marcar como primaria'}
              >
                {image.isPrimary ? <Star size={14} /> : <StarOff size={14} />}
              </button>
              {/* Botón de eliminar */}
              <button
                type="button"
                onClick={(e) => handleRemoveImage(e, image.id)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Eliminar imagen"
              >
                <X size={14} />
              </button>
              {/* Badge de imagen primaria */}
              {image.isPrimary && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                  Primaria
                </div>
              )}
            </div>
          ))}
        </div>
        <div
          {...getImageRootProps()}
          className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors"
        >
          <input {...getImageInputProps()} />
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Arrastra imágenes aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, WEBP hasta 5MB. La primera imagen será marcada como primaria automáticamente.
          </p>
        </div>
      </div>

      {/* Variantes */}
      <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Variantes</h2>
            <button
              type="button"
              onClick={() => setShowVariantForm(!showVariantForm)}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              <Plus size={20} />
              {showVariantForm ? 'Ocultar formulario' : 'Agregar variante'}
            </button>
          </div>
        
        {/* Lista de variantes existentes */}
        {formData.variants.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Variantes existentes</h3>
            <div className="space-y-4">
              {formData.variants.map((variant: any) => (
                <div key={variant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{variant.name}</p>
                    <p className="text-sm text-gray-500">
                      SKU: {variant.sku} | Stock: {variant.stock} | Ajuste: ${variant.price_adjustment}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveVariant(e, variant.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulario de nueva variante */}
          {showVariantForm && (
        <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Nueva variante</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la variante
              </label>
              <input
                type="text"
                value={newVariant.name}
                onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="Ej: Color Rojo, Talla M"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU de la variante
              </label>
              <input
                type="text"
                value={newVariant.sku}
                onChange={(e) => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ajuste de precio
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={newVariant.price_adjustment}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, price_adjustment: parseFloat(e.target.value) }))}
                  className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                value={newVariant.stock}
                onChange={(e) => setNewVariant(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                min="0"
              />
            </div>
          </div>

          {/* Imágenes de la variante */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imágenes de la variante
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {newVariant.images.map((image: any) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt="Variant"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setNewVariant(prev => ({
                        ...prev,
                        images: prev.images.filter(img => img.id !== image.id)
                      }));
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div
              {...getVariantImageRootProps()}
              className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-accent transition-colors"
            >
              <input {...getVariantImageInputProps()} />
              <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-1 text-sm text-gray-600">
                Arrastra imágenes aquí o haz clic para seleccionar
              </p>
            </div>
          </div>

              <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleAddVariant}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center"
          >
            <Plus size={20} className="mr-2" />
            Agregar variante
          </button>
                <button
                  type="button"
                  onClick={() => setShowVariantForm(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
        </div>
          )}
      </div>

      {/* Etiquetas */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Etiquetas</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {formData.tags.map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent"
            >
              {tag}
              <button
                type="button"
                onClick={(e) => handleRemoveTag(e, tag)}
                className="ml-2 text-accent hover:text-accent/80"
              >
                <X size={16} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Agregar etiqueta"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
            {getSubmitButtonText()}
        </button>
      </div>
    </form>
    </div>
  );
};

export default ProductForm; 