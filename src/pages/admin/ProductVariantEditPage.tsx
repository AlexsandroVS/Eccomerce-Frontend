import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VariantEditModal from '../../components/admin/VariantEditModal';
import { productService } from '../../services/product.service';

const ProductVariantEditPage: React.FC = () => {
  const { productId, variantId } = useParams<{ productId: string; variantId: string }>();
  const navigate = useNavigate();
  
  const [variant, setVariant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId && variantId) {
      loadVariant();
    }
  }, [productId, variantId]);

  const loadVariant = async () => {
    if (!productId || !variantId) return;
    
    setLoading(true);
    try {
      const product = await productService.getById(productId);
      const variantData = product.variants?.find((v: any) => v.id === variantId);
      
      if (!variantData) {
        throw new Error('Variante no encontrada');
      }
      
      setVariant(variantData);
    } catch (error) {
      console.error('Error al cargar variante:', error);
      alert('Error al cargar la variante');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVariant = async (variantId: string, data: any) => {
    try {
      // Aquí implementarías la lógica para actualizar la variante
      // Por ahora, solo navegamos de vuelta
      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating variant:', error);
      alert('Error al actualizar la variante');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      // Aquí implementarías la lógica para eliminar la variante
      navigate('/admin/products');
    } catch (error) {
      console.error('Error deleting variant:', error);
      alert('Error al eliminar la variante');
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando variante...</p>
        </div>
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Variante no encontrada</h2>
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Editar Variante</h1>
          <p className="text-gray-600">Modifica los detalles de la variante del producto</p>
        </div>
        
        <VariantEditModal
          variant={variant}
          isOpen={true}
          onClose={() => navigate('/admin/products')}
          onSave={handleSaveVariant}
          onDelete={handleDeleteVariant}
        />
      </div>
    </div>
  );
};

export default ProductVariantEditPage; 