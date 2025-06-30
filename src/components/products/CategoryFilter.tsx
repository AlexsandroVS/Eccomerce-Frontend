import React, { memo } from 'react';
import { motion } from 'framer-motion';
import type { Category } from '../../types/product.types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const CategoryFilter = memo(({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryFilterProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-charcoal">Categorías</h3>
      <div className="space-y-2">
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
            selectedCategory === null
              ? 'bg-accent text-white'
              : 'hover:bg-gray-100 text-charcoal'
          }`}
        >
          Todas las categorías
        </motion.button>
        
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCategory(category.id)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
              selectedCategory === category.id
                ? 'bg-accent text-white'
                : 'hover:bg-gray-100 text-charcoal'
            }`}
          >
            {category.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
});

CategoryFilter.displayName = 'CategoryFilter';

export default CategoryFilter; 