import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ProductVariantForm from '../../components/admin/ProductVariantForm';
import { productService } from '../../services/product.service';

interface LocationState {
  parentProductName?: string;
}

interface ParentProduct {
  id: string;
  name: string;
  sku: string;
  base_price: number;
}

const ProductVariantCreatePage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  const [parentProduct, setParentProduct] = useState<ParentProduct | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar información del producto padre si se proporciona un ID
  useEffect(() => {
    if (productId) {
      loadParentProduct();
    }
  }, [productId]);

  const loadParentProduct = async () => {
    if (!productId) return;
    
    setLoading(true);
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
      alert('Error al cargar la información del producto padre');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (variantData: any) => {
    try {
      if (!productId) {
        throw new Error('ID de producto no encontrado');
      }

      // Preparar datos para el backend
      const variantCreateData = {
        product_id: productId,
        sku_suffix: variantData.sku,
        price: variantData.price,
        stock: variantData.stock,
        min_stock: 5,
        attributes: {
          name: variantData.name,
          ...variantData.attributes // Incluir todos los atributos adicionales
        }
      };

      // Crear la variante usando el servicio
      const createdVariant = await productService.createVariant(productId, variantCreateData);
      
      // Si hay imágenes, subirlas por separado
      if (variantData.images && variantData.images.length > 0) {
        for (const image of variantData.images) {
          if (image.file) {
            try {
              await productService.uploadVariantImage(createdVariant.id, {
                file: image.file,
                is_primary: image.is_primary
              });
            } catch (error) {
              console.error('Error al subir imagen de variante:', error);
            }
          }
        }
      }
      
      alert('Variante creada exitosamente');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error al crear la variante:', error);
      alert('Error al crear la variante: ' + (error as Error).message);
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ProductVariantForm
        parentProductId={productId}
        parentProductName={parentProduct?.name || state?.parentProductName}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default ProductVariantCreatePage; 