import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { ProductFilter } from '../../types/product.types';

interface ProductFiltersProps {
  filters: ProductFilter;
  onFilterChange: (filters: Partial<ProductFilter>) => void;
  minPrice: number;
  maxPrice: number;
}

const sortOptions = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc', label: 'Nombre: A-Z' },
  { value: 'name_desc', label: 'Nombre: Z-A' },
] as const;

const ProductFilters = memo(({ 
  filters, 
  onFilterChange,
  minPrice,
  maxPrice
}: ProductFiltersProps) => {
  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value ? Number(value) : undefined });
  }, [onFilterChange]);

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ sort_by: e.target.value as ProductFilter['sort_by'] });
  }, [onFilterChange]);

  return (
    <div className="space-y-6">
      {/* Filtro de precio */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-charcoal">Rango de precio</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="min_price" className="block text-sm text-gray-600 mb-1">
                Precio mínimo
              </label>
              <input
                type="number"
                id="min_price"
                name="min_price"
                min={minPrice}
                max={maxPrice}
                value={filters.min_price || ''}
                onChange={handlePriceChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder={`$${minPrice}`}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="max_price" className="block text-sm text-gray-600 mb-1">
                Precio máximo
              </label>
              <input
                type="number"
                id="max_price"
                name="max_price"
                min={minPrice}
                max={maxPrice}
                value={filters.max_price || ''}
                onChange={handlePriceChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder={`$${maxPrice}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ordenamiento */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-charcoal">Ordenar por</h3>
        <select
          value={filters.sort_by || 'newest'}
          onChange={handleSortChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Botón de limpiar filtros */}
      {(filters.min_price || filters.max_price || filters.sort_by !== 'newest') && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onFilterChange({
            min_price: undefined,
            max_price: undefined,
            sort_by: 'newest'
          })}
          className="w-full px-4 py-2 bg-gray-100 text-charcoal rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          Limpiar filtros
        </motion.button>
      )}
    </div>
  );
});

ProductFilters.displayName = 'ProductFilters';

export default ProductFilters; 