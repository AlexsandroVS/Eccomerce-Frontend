// utils/product.utils.ts

import type { Product, ProductType } from '../types/product.types';
import { getImageUrl } from './image.utils';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:3000';

export const productUtils = {
  /**
   * Construye la URL completa de una imagen
   */
  buildImageUrl(imageUrl: string): string {
    return getImageUrl(imageUrl);
  },

  /**
   * Formatea el precio del producto
   */
  formatPrice(price?: number): string {
    if (price === undefined || price === null) return 'Sin precio';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  },

  /**
   * Obtiene la imagen principal del producto
   */
  getPrimaryImage(product: Product): string | null {
    if (!product?.images || product.images.length === 0) {
      return null;
    }
    
    const primaryImage = product.images.find(img => img.is_primary);
    if (primaryImage) {
      return getImageUrl(primaryImage.url);
    }
    
    const firstImage = product.images[0];
    if (firstImage) {
      return getImageUrl(firstImage.url);
    }
    
    return null;
  },

  /**
   * Obtiene todas las imágenes del producto ordenadas (principal primero)
   */
  getOrderedImages(product: Product) {
    if (!product?.images || product.images.length === 0) {
      return [];
    }

    return [...product.images].sort((a, b) => {
      if (a.is_primary) return -1;
      if (b.is_primary) return 1;
      return 0;
    }).map(image => getImageUrl(image.url));
  },

  /**
   * Genera el slug a partir del nombre
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  },

  /**
   * Valida el SKU
   */
  validateSKU(sku: string): boolean {
    const skuRegex = /^[A-Z0-9-]+$/;
    return skuRegex.test(sku) && sku.length >= 3 && sku.length <= 50;
  },

  /**
   * Genera un SKU automático basado en el nombre
   */
  generateSKU(name: string): string {
    const cleanName = name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
    
    const timestamp = Date.now().toString().slice(-6);
    return `${cleanName}-${timestamp}`;
  },

  /**
   * Obtiene el estado del producto como texto
   */
  getStatusText(product: Product): string {
    if (product.deleted_at) return 'Eliminado';
    if (!product.is_active) return 'Inactivo';
    return 'Activo';
  },

  /**
   * Obtiene el color del estado
   */
  getStatusColor(product: Product): 'green' | 'red' | 'gray' {
    if (product.deleted_at) return 'gray';
    if (!product.is_active) return 'red';
    return 'green';
  },

  /**
   * Obtiene el tipo de producto como texto
   */
  getTypeText(type: ProductType): string {
    const typeMap = {
      SIMPLE: 'Simple',
      VARIABLE: 'Variable',
    };
    return typeMap[type] || type;
  },

  /**
   * Formatea los atributos del producto
   */
  formatAttributes(product: Product): Record<string, string> {
    return product.attributes.reduce((acc, attr) => {
      acc[attr.name] = attr.value;
      return acc;
    }, {} as Record<string, string>);
  },

  /**
   * Convierte atributos de objeto a array
   */
  attributesToArray(attributes: Record<string, string>) {
    return Object.entries(attributes).map(([name, value]) => ({ name, value }));
  },

  /**
   * Filtra productos por texto de búsqueda
   */
  filterBySearch(products: Product[], search: string): Product[] {
    if (!search.trim()) return products;
    
    const searchLower = search.toLowerCase();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower) ||
      product.categories.some(cat => 
        cat.name.toLowerCase().includes(searchLower)
      ) ||
      product.attributes.some(attr => 
        attr.name.toLowerCase().includes(searchLower) ||
        attr.value.toLowerCase().includes(searchLower)
      )
    );
  },

  /**
   * Ordena productos por diferentes criterios
   */
  sortProducts(
    products: Product[], 
    sortBy: 'name' | 'created_at' | 'updated_at' | 'price' | 'sku',
    order: 'asc' | 'desc' = 'desc'
  ): Product[] {
    return [...products].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'sku':
          valueA = a.sku.toLowerCase();
          valueB = b.sku.toLowerCase();
          break;
        case 'price':
          valueA = a.base_price || 0;
          valueB = b.base_price || 0;
          break;
        case 'created_at':
          valueA = new Date(a.created_at);
          valueB = new Date(b.created_at);
          break;
        case 'updated_at':
          valueA = new Date(a.updated_at);
          valueB = new Date(b.updated_at);
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return order === 'asc' ? -1 : 1;
      if (valueA > valueB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },

  /**
   * Valida los datos del producto antes de crear/actualizar
   */
  validateProductData(data: {
    name?: string;
    sku?: string;
    base_price?: number;
    categories?: number[];
  }) {
    const errors: string[] = [];

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        errors.push('El nombre es requerido');
      } else if (data.name.length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
      } else if (data.name.length > 255) {
        errors.push('El nombre no puede exceder 255 caracteres');
      }
    }

    if (data.sku !== undefined) {
      if (!data.sku.trim()) {
        errors.push('El SKU es requerido');
      } else if (!this.validateSKU(data.sku)) {
        errors.push('El SKU debe contener solo letras mayúsculas, números y guiones');
      }
    }

    if (data.base_price !== undefined && data.base_price !== null) {
      if (data.base_price < 0) {
        errors.push('El precio no puede ser negativo');
      } else if (data.base_price > 999999.99) {
        errors.push('El precio no puede exceder S/ 999,999.99');
      }
    }

    if (data.categories !== undefined) {
      if (!Array.isArray(data.categories) || data.categories.length === 0) {
        errors.push('Debe seleccionar al menos una categoría');
      }
    }

    return errors;
  },

  /**
   * Formatea la fecha de creación/actualización
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  },

  /**
   * Calcula estadísticas de un array de productos
   */
  calculateStats(products: Product[]) {
    const total = products.length;
    const active = products.filter(p => p.is_active && !p.deleted_at).length;
    const inactive = products.filter(p => !p.is_active && !p.deleted_at).length;
    const deleted = products.filter(p => p.deleted_at).length;
    const withImages = products.filter(p => p.images.length > 0).length;
    const withoutStock = products.filter(p => p.variants.length === 0 && p.type === 'VARIABLE').length;

    return {
      total,
      active,
      inactive,
      deleted,
      withImages,
      withoutStock,
      averagePrice: this.calculateAveragePrice(products),
    };
  },

  /**
   * Calcula el precio promedio
   */
  calculateAveragePrice(products: Product[]): number {
    const productsWithPrice = products.filter(p => p.base_price && p.base_price > 0);
    if (productsWithPrice.length === 0) return 0;
    
    const total = productsWithPrice.reduce((sum, p) => sum + (p.base_price || 0), 0);
    return total / productsWithPrice.length;
  },
};