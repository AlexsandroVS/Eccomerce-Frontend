import React, { useState, useEffect } from 'react';
import { X, Plus, Image as ImageIcon, ArrowLeft, RefreshCw, AlertTriangle, CheckCircle, Tag } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { useAttributes } from '../../hooks/useAttributes';

interface ProductVariantData {
  name: string;
  price: number;
  stock: number;
  sku: string;
  images: Array<{ id: string; url: string; file: File; is_primary: boolean }>;
  attributes: Record<string, string>;
}

interface ProductVariantFormProps {
  parentProductId?: string;
  parentProductName?: string;
  onSubmit: (data: ProductVariantData) => void;
  onCancel: () => void;
}

interface ParentProduct {
  id: string;
  name: string;
  sku: string;
  base_price: number;
}

const ProductVariantForm: React.FC<ProductVariantFormProps> = ({
  parentProductId,
  parentProductName,
  onSubmit,
  onCancel
}) => {
  const navigate = useNavigate();
  const [selectedParentProduct, setSelectedParentProduct] = useState<string>(parentProductId || '');
  const [parentProduct, setParentProduct] = useState<ParentProduct | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<ParentProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showAttributes, setShowAttributes] = useState(false);
  
  // Hook de atributos
  const {
    predefinedAttributes,
    selectedAttributes,
    customAttributes,
    allAttributes,
    getAttributesByCategory,
    getCategories,
    addPredefinedAttribute,
    addCustomAttribute,
    removeAttribute,
    clearAttributes,
    getAttributesForBackend
  } = useAttributes();
  
  const [variantData, setVariantData] = useState<ProductVariantData>({
    name: '',
    price: 0,
    stock: 0,
    sku: '',
    images: [],
    attributes: {}
  });

  // Estados para atributos personalizados
  const [customAttributeName, setCustomAttributeName] = useState('');
  const [customAttributeValue, setCustomAttributeValue] = useState('');
  const [selectedAttributeId, setSelectedAttributeId] = useState('');
  const [selectedAttributeValue, setSelectedAttributeValue] = useState('');

  // Cargar productos disponibles si no hay un producto padre específico
  useEffect(() => {
    if (!parentProductId) {
      loadAvailableProducts();
    }
  }, [parentProductId]);

  // Cargar información del producto padre cuando se selecciona
  useEffect(() => {
    if (selectedParentProduct) {
      loadParentProduct(selectedParentProduct);
    } else {
      setParentProduct(null);
    }
  }, [selectedParentProduct]);

  // Establecer precio por defecto cuando se carga el producto padre
  useEffect(() => {
    if (parentProduct) {
      setVariantData(prev => ({
        ...prev,
        price: parentProduct.base_price
      }));
    }
  }, [parentProduct]);

  // Generar SKU automáticamente cuando cambia el nombre o se selecciona un producto padre
  useEffect(() => {
    if (parentProduct && variantData.name) {
      generateSKU();
    }
  }, [parentProduct, variantData.name]);

  // Actualizar atributos en variantData cuando cambian
  useEffect(() => {
    setVariantData(prev => ({
      ...prev,
      attributes: getAttributesForBackend()
    }));
  }, [allAttributes, getAttributesForBackend]);

  const loadAvailableProducts = async () => {
    setLoadingProducts(true);
    try {
      const products = await productService.getAll();
      setAvailableProducts(products);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadParentProduct = async (productId: string) => {
    setLoadingProduct(true);
    try {
      const product = await productService.getById(productId);
      setParentProduct({
        id: product.id,
        name: product.name,
        sku: product.sku,
        base_price: product.base_price
      });
    } catch (error) {
      console.error('Error al cargar producto padre:', error);
    } finally {
      setLoadingProduct(false);
    }
  };

  const generateSKU = () => {
    if (!parentProduct || !variantData.name) return;

    // Crear un sufijo basado en el nombre de la variante
    const nameSuffix = variantData.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6);
    
    // Agregar timestamp para hacerlo único
    const timestamp = Date.now().toString().slice(-4);
    
    const newSKU = `${parentProduct.sku}-${nameSuffix}-${timestamp}`;
    setVariantData(prev => ({ ...prev, sku: newSKU }));
  };

  const { getRootProps: getVariantImageRootProps, getInputProps: getVariantImageInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 5,
    onDrop: (acceptedFiles: File[]) => {
      const newImages = acceptedFiles.map(file => ({
        id: Math.random().toString(),
        url: URL.createObjectURL(file),
        file,
        is_primary: variantData.images.length === 0 // La primera imagen será primaria por defecto
      }));
      setVariantData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  });

  const handleSetPrimaryImage = (imageId: string) => {
    setVariantData(prev => ({
      ...prev,
      images: prev.images.map(img => ({
        ...img,
        is_primary: img.id === imageId
      }))
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!selectedParentProduct) {
      alert('Debes seleccionar un producto padre para crear una variante');
      return;
    }
    
    if (!variantData.name || !variantData.sku) {
      alert('Debes completar el nombre y SKU de la variante');
      return;
    }
    
    onSubmit(variantData);
  };

  const handleRemoveImage = (imageId: string) => {
    const imageToRemove = variantData.images.find(img => img.id === imageId);
    if (imageToRemove?.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    
    const newImages = variantData.images.filter(img => img.id !== imageId);
    
    // Si se eliminó la imagen primaria y quedan otras imágenes, hacer la primera primaria
    if (imageToRemove?.is_primary && newImages.length > 0) {
      newImages[0].is_primary = true;
    }
    
    setVariantData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  // Calcular el estado del precio
  const getPriceStatus = () => {
    if (!parentProduct) return { type: 'neutral', message: '' };
    
    const difference = variantData.price - parentProduct.base_price;
    
    if (difference < 0) {
      return {
        type: 'warning',
        message: `Precio ${Math.abs(difference).toFixed(2)} menor al producto original`
      };
    } else if (difference === 0) {
      return {
        type: 'neutral',
        message: 'Mismo precio que el producto original'
      };
    } else {
      return {
        type: 'success',
        message: `Precio ${difference.toFixed(2)} mayor al producto original`
      };
    }
  };

  const priceStatus = getPriceStatus();

  // Obtener atributos de muebles por defecto
  const furnitureAttributes = getAttributesByCategory('muebles');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Volver a productos
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Crear Variante de Producto</h1>
        <p className="text-gray-600 mt-2">
          {parentProductName 
            ? `Agregando variante al producto: ${parentProductName}`
            : 'Selecciona un producto y completa la información de la variante'
          }
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
              {loadingProducts ? (
                <div className="flex items-center justify-center py-4">
                  <RefreshCw size={20} className="animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Cargando productos...</span>
                </div>
              ) : (
                <select
                  value={selectedParentProduct}
                  onChange={(e) => setSelectedParentProduct(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                  required
                >
                  <option value="">Seleccionar producto...</option>
                  {availableProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku}) - S/ {product.base_price}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}

        {/* Información del producto seleccionado */}
        {parentProduct && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Producto seleccionado:</h3>
            {loadingProduct ? (
              <div className="flex items-center">
                <RefreshCw size={16} className="animate-spin text-blue-400" />
                <span className="ml-2 text-blue-800">Cargando información...</span>
              </div>
            ) : (
              <div className="text-sm text-blue-800">
                <p><strong>Nombre:</strong> {parentProduct.name}</p>
                <p><strong>SKU:</strong> {parentProduct.sku}</p>
                <p><strong>Precio base:</strong> S/ {parentProduct.base_price}</p>
              </div>
            )}
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
                value={variantData.name}
                onChange={(e) => setVariantData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="Ej: Mesa de madera blanca, Talla M, Color Rojo"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Puedes usar cualquier nombre que describa la variante
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU de la variante
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={variantData.sku}
                  onChange={(e) => setVariantData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="Se genera automáticamente"
                  required
                />
                <button
                  type="button"
                  onClick={generateSKU}
                  disabled={!parentProduct || !variantData.name}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Regenerar SKU automático"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Se genera automáticamente basado en el nombre de la variante
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio de la variante
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                <input
                  type="number"
                  value={variantData.price}
                  onChange={(e) => setVariantData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                />
              </div>
              {priceStatus.message && (
                <div className={`flex items-center gap-1 mt-1 text-xs ${
                  priceStatus.type === 'warning' ? 'text-orange-600' :
                  priceStatus.type === 'success' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {priceStatus.type === 'warning' && <AlertTriangle size={12} />}
                  {priceStatus.type === 'success' && <CheckCircle size={12} />}
                  {priceStatus.message}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                value={variantData.stock}
                onChange={(e) => setVariantData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                min="0"
                required
              />
            </div>
          </div>

          {/* Sección de Atributos */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-medium text-gray-900">Atributos de la Variante</h3>
              <button
                type="button"
                onClick={() => setShowAttributes(!showAttributes)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Tag size={16} />
                {showAttributes ? 'Ocultar' : 'Mostrar'} atributos
              </button>
            </div>

            {showAttributes && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                {/* Atributos predefinidos */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Atributos Predefinidos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de atributo</label>
                      <select
                        value={selectedAttributeId}
                        onChange={(e) => setSelectedAttributeId(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar atributo...</option>
                        {furnitureAttributes.map(attr => (
                          <option key={attr.id} value={attr.id}>{attr.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Valor</label>
                      <div className="flex gap-2">
                        <select
                          value={selectedAttributeValue}
                          onChange={(e) => setSelectedAttributeValue(e.target.value)}
                          disabled={!selectedAttributeId}
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                          <option value="">Seleccionar valor...</option>
                          {selectedAttributeId && furnitureAttributes
                            .find(attr => attr.id === selectedAttributeId)
                            ?.values.map(value => (
                              <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedAttributeId && selectedAttributeValue) {
                              addPredefinedAttribute(selectedAttributeId, selectedAttributeValue);
                              setSelectedAttributeId('');
                              setSelectedAttributeValue('');
                            }
                          }}
                          disabled={!selectedAttributeId || !selectedAttributeValue}
                          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Atributos personalizados */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Atributos Personalizados</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={customAttributeName}
                        onChange={(e) => setCustomAttributeName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Talla, Material"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Valor</label>
                      <input
                        type="text"
                        value={customAttributeValue}
                        onChange={(e) => setCustomAttributeValue(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: M, Algodón"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (customAttributeName && customAttributeValue) {
                            addCustomAttribute(customAttributeName, customAttributeValue);
                            setCustomAttributeName('');
                            setCustomAttributeValue('');
                          }
                        }}
                        disabled={!customAttributeName || !customAttributeValue}
                        className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={14} className="mr-1" />
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de atributos agregados */}
                {allAttributes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Atributos Agregados</h4>
                    <div className="flex flex-wrap gap-2">
                      {allAttributes.map((attr, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        >
                          <span>{attr.name}: {attr.value}</span>
                          <button
                            type="button"
                            onClick={() => removeAttribute(attr.name, attr.value)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Imágenes de la variante */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imágenes de la variante
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {variantData.images.map((image: any) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt="Variant"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  {image.is_primary && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Principal
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                  {!image.is_primary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(image.id)}
                      className="absolute bottom-2 left-2 p-1 bg-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      title="Hacer imagen principal"
                    >
                      Principal
                    </button>
                  )}
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
              <p className="text-xs text-gray-500 mt-1">
                La primera imagen será la principal por defecto
              </p>
            </div>
          </div>
        </div>

        {/* Resumen de la variante */}
        {parentProduct && variantData.name && (
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900 mb-2">Resumen de la variante:</h3>
            <div className="text-sm text-green-800">
              <p><strong>Producto:</strong> {parentProduct.name}</p>
              <p><strong>Variante:</strong> {variantData.name}</p>
              <p><strong>SKU:</strong> {variantData.sku}</p>
              <p><strong>Precio:</strong> S/ {variantData.price.toFixed(2)}</p>
              <p><strong>Stock:</strong> {variantData.stock} unidades</p>
              <p><strong>Imágenes:</strong> {variantData.images.length} ({variantData.images.filter(img => img.is_primary).length} principal)</p>
              {allAttributes.length > 0 && (
                <p><strong>Atributos:</strong> {allAttributes.length} definidos</p>
              )}
            </div>
          </div>
        )}

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
            disabled={!selectedParentProduct || !variantData.name || !variantData.sku}
          >
            Crear Variante
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductVariantForm; 