import React from 'react';
import { Package, Plus, Settings } from 'lucide-react';
import type { ProductVariant } from '../../types/product.types';

interface ProductVariantSummaryProps {
  variants: ProductVariant[];
  productName: string;
  productId: string;
  onCreateVariant: (productId: string, productName: string) => void;
  onManageVariants?: (productId: string) => void;
}

const ProductVariantSummary: React.FC<ProductVariantSummaryProps> = ({
  variants,
  productName,
  productId,
  onCreateVariant,
  onManageVariants
}) => {
  if (variants.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Sin variantes</span>
        <button
          onClick={() => onCreateVariant(productId, productName)}
          className="text-green-600 hover:text-green-800 text-xs flex items-center gap-1 hover:bg-green-50 px-2 py-1 rounded transition-colors"
          title="Crear primera variante"
        >
          <Plus size={12} />
          Agregar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">
          {variants.length} variante{variants.length !== 1 ? 's' : ''}
        </span>
        <div className="flex gap-1">
          {onManageVariants && (
            <button
              onClick={() => onManageVariants(productId)}
              className="text-purple-600 hover:text-purple-800 text-xs flex items-center gap-1 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
              title="Gestionar variantes"
            >
              <Settings size={12} />
              Gestionar
            </button>
          )}
          <button
            onClick={() => onCreateVariant(productId, productName)}
            className="text-green-600 hover:text-green-800 text-xs flex items-center gap-1 hover:bg-green-50 px-2 py-1 rounded transition-colors"
            title="Agregar variante"
          >
            <Plus size={12} />
            Agregar
          </button>
        </div>
      </div>
      
      <div className="space-y-1">
        {variants.slice(0, 2).map((variant) => (
          <div key={variant.id} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
            <div className="flex justify-between items-center">
              <span className="truncate">{variant.sku_suffix}</span>
              <span className="text-gray-500 ml-2">S/ {variant.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-500">
              <span>SKU: {variant.sku_suffix}</span>
              <span>{variant.stock} u.</span>
            </div>
            {variant.attributes && Object.keys(variant.attributes).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(variant.attributes).slice(0, 2).map(([key, value]) => (
                  <span key={key} className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                    {key}: {value}
                  </span>
                ))}
                {Object.keys(variant.attributes).length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{Object.keys(variant.attributes).length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
        
        {variants.length > 2 && (
          <div className="text-xs text-gray-500 text-center">
            +{variants.length - 2} más
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductVariantSummary; 