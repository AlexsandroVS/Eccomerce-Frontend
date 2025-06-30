// hooks/useCatalog.ts
// Hook específico para el catálogo público de productos

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Product } from '../types/product.types';
import { productService } from '../services/product.service';
import { toast } from 'sonner';

interface CatalogFilters {
  category?: string;
  search?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  sortBy?: 'name' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

interface UseCatalogReturn {
  // Data
  products: Product[];
  filteredProducts: Product[];
  featuredProducts: Product[];
  categories: Array<{ id: string; name: string; count: number }>;
  
  // Loading
  loading: boolean;
  
  // Actions
  fetchProducts: () => Promise<void>;
  getProductBySlug: (slug: string) => Promise<Product | null>;
  searchProducts: (query: string) => void;
  filterProducts: (filters: CatalogFilters) => void;
  clearFilters: () => void;
  
  // Utils
  refreshCatalog: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  
  // Filters state
  currentFilters: CatalogFilters;
  hasFilters: boolean;
}

export const useCatalog = (): UseCatalogReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; count: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<CatalogFilters>({});
  
  // Usar refs para evitar bucles infinitos
  const productsRef = useRef<Product[]>([]);
  const currentFiltersRef = useRef<CatalogFilters>({});

  // Cargar productos del catálogo público
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching public products...');
      const data = await productService.getPublicProducts();
      console.log('✅ Received products:', data);
      
      // Filter out deleted products
      const activeProducts = data.filter(product => !product.deleted_at);
      
      setProducts(activeProducts);
      productsRef.current = activeProducts;
      setFilteredProducts(activeProducts);
      
      // Productos destacados (primeros 8 por fecha de creación)
      const featured = activeProducts
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8);
      setFeaturedProducts(featured);
      
      // Extraer categorías únicas con conteos
      const categoryMap = new Map<string, { id: string; name: string; count: number }>();
      
      activeProducts.forEach(product => {
        product.categories.forEach(cat => {
          const key = cat.id.toString();
          if (categoryMap.has(key)) {
            const existing = categoryMap.get(key)!;
            categoryMap.set(key, { ...existing, count: existing.count + 1 });
          } else {
            categoryMap.set(key, { id: key, name: cat.name, count: 1 });
          }
        });
      });
      
      setCategories(Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
      
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      toast.error('Error al cargar el catálogo de productos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener producto por slug (para páginas de detalle)
  const getProductBySlug = useCallback(async (slug: string) => {
    try {
      return await productService.getBySlug(slug);
    } catch (error: any) {
      console.error('Error fetching product by slug:', error);
      toast.error(error.message || 'Producto no encontrado');
      return null;
    }
  }, []);

  // Aplicar filtros
  const applyFilters = useCallback((filters: CatalogFilters) => {
    const currentProducts = productsRef.current;
    let filtered = [...currentProducts].filter(product => !product.deleted_at);

    // Búsqueda por texto
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.categories.some(cat => 
          cat.name.toLowerCase().includes(searchLower)
        ) ||
        product.attributes.some(attr => 
          attr.name.toLowerCase().includes(searchLower) ||
          attr.value.toLowerCase().includes(searchLower)
        )
      );
    }

    // Filtro por categoría
    if (filters.category && filters.category.trim()) {
      filtered = filtered.filter(product =>
        product.categories.some(cat => 
          cat.id.toString() === filters.category || 
          (filters.category && cat.name.toLowerCase() === filters.category.toLowerCase())
        )
      );
    }

    // Filtro por rango de precio (usando base_price del producto)
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      filtered = filtered.filter(product => {
        const productPrice = product.base_price || 0;
        
        if (min !== undefined && max !== undefined) {
          return productPrice >= min && productPrice <= max;
        } else if (min !== undefined) {
          return productPrice >= min;
        } else if (max !== undefined) {
          return productPrice <= max;
        }
        
        return true;
      });
    }

    // Ordenamiento
    if (filters.sortBy && filters.sortOrder) {
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (filters.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'created_at':
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            break;
          default:
            comparison = 0;
        }
        
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    setFilteredProducts(filtered);
  }, []);

  // Buscar productos
  const searchProducts = useCallback((query: string) => {
    const filters = { ...currentFiltersRef.current, search: query };
    setCurrentFilters(filters);
    currentFiltersRef.current = filters;
    applyFilters(filters);
  }, [applyFilters]);

  // Aplicar filtros
  const filterProducts = useCallback((filters: CatalogFilters) => {
    setCurrentFilters(filters);
    currentFiltersRef.current = filters;
    applyFilters(filters);
  }, [applyFilters]);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setCurrentFilters({});
    currentFiltersRef.current = {};
    setFilteredProducts(productsRef.current);
  }, []);

  // Refrescar catálogo
  const refreshCatalog = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  // Obtener producto por ID
  const getProductById = useCallback((id: string) => {
    return productsRef.current.find(product => product.id === id);
  }, []);

  // Verificar si hay filtros activos
  const hasFilters = Object.keys(currentFilters).some(key => {
    const value = currentFilters[key as keyof CatalogFilters];
    if (key === 'search') {
      return value && (value as string).trim() !== '';
    }
    if (key === 'category') {
      return value && (value as string).trim() !== '';
    }
    if (key === 'priceRange') {
      const range = value as CatalogFilters['priceRange'];
      return range && (range.min !== undefined || range.max !== undefined);
    }
    return value !== undefined;
  });

  // Cargar productos al montar el componente (solo una vez)
  useEffect(() => {
    fetchProducts();
  }, []); // Sin dependencias para evitar bucles

  // Reaplicar filtros cuando cambien los productos (usando refs)
  useEffect(() => {
    if (Object.keys(currentFiltersRef.current).length > 0) {
      applyFilters(currentFiltersRef.current);
    }
  }, [products, applyFilters]); // Solo cuando cambien los productos

  return {
    // Data
    products,
    filteredProducts,
    featuredProducts,
    categories,
    
    // Loading
    loading,
    
    // Actions
    fetchProducts,
    getProductBySlug,
    searchProducts,
    filterProducts,
    clearFilters,
    
    // Utils
    refreshCatalog,
    getProductById,
    
    // Filters state
    currentFilters,
    hasFilters,
  };
};