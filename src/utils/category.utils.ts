// utils/category.utils.ts
import type { Category } from '../types/category.types';

/**
 * Genera un slug a partir de un nombre
 */
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[áäàâã]/g, 'a')
    .replace(/[éëèê]/g, 'e')
    .replace(/[íïìî]/g, 'i')
    .replace(/[óöòôõ]/g, 'o')
    .replace(/[úüùû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Remover guiones múltiples
    .replace(/^-|-$/g, ''); // Remover guiones al inicio y final
};

/**
 * Valida si un slug es válido
 */
export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 2 && slug.length <= 100;
};

/**
 * Organiza las categorías en una estructura jerárquica
 */
export const buildCategoryTree = (categories: Category[]): Category[] => {
  const categoryMap = new Map<number, Category>();
  const rootCategories: Category[] = [];

  // Crear un mapa de todas las categorías
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Construir la jerarquía
  categories.forEach(category => {
    const categoryWithChildren = categoryMap.get(category.id)!;
    
    if (category.parent_id === null) {
      rootCategories.push(categoryWithChildren);
    } else {
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(categoryWithChildren);
      }
    }
  });

  return rootCategories;
};

/**
 * Aplana una estructura jerárquica de categorías
 */
export const flattenCategoryTree = (categories: Category[]): Category[] => {
  const result: Category[] = [];
  
  const flatten = (cats: Category[], level = 0) => {
    cats.forEach(category => {
      result.push({ ...category, level } as Category & { level: number });
      if (category.children && category.children.length > 0) {
        flatten(category.children, level + 1);
      }
    });
  };
  
  flatten(categories);
  return result;
};

/**
 * Encuentra todas las categorías hijo de una categoría padre
 */
export const findCategoryChildren = (categories: Category[], parentId: number): Category[] => {
  const children: Category[] = [];
  
  const findChildren = (cats: Category[]) => {
    cats.forEach(category => {
      if (category.parent_id === parentId) {
        children.push(category);
        // Buscar recursivamente en los hijos
        findChildren(categories);
      }
    });
  };
  
  findChildren(categories);
  return children;
};

/**
 * Obtiene el path completo de una categoría (breadcrumb)
 */
export const getCategoryPath = (categories: Category[], categoryId: number): Category[] => {
  const path: Category[] = [];
  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
  
  let currentCategory = categoryMap.get(categoryId);
  
  while (currentCategory) {
    path.unshift(currentCategory);
    currentCategory = currentCategory.parent_id ? categoryMap.get(currentCategory.parent_id) : undefined;
  }
  
  return path;
};

/**
 * Filtra categorías por texto de búsqueda
 */
export const filterCategories = (categories: Category[], searchTerm: string): Category[] => {
  if (!searchTerm.trim()) return categories;
  
  const term = searchTerm.toLowerCase();
  return categories.filter(category => 
    category.name.toLowerCase().includes(term) ||
    category.slug.toLowerCase().includes(term)
  );
};

/**
 * Ordena categorías por diferentes criterios
 */
export const sortCategories = (
  categories: Category[], 
  sortBy: 'name' | 'created_at' | 'updated_at' = 'name', 
  order: 'asc' | 'desc' = 'asc'
): Category[] => {
  return [...categories].sort((a, b) => {
    let valueA: string | number;
    let valueB: string | number;
    
    switch (sortBy) {
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'created_at':
      case 'updated_at':
        valueA = new Date(a[sortBy]).getTime();
        valueB = new Date(b[sortBy]).getTime();
        break;
      default:
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
    }
    
    if (valueA < valueB) return order === 'asc' ? -1 : 1;
    if (valueA > valueB) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Formatea la fecha de creación/actualización
 */
export const formatCategoryDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Obtiene el nivel de anidamiento de una categoría
 */
export const getCategoryLevel = (categories: Category[], categoryId: number): number => {
  const path = getCategoryPath(categories, categoryId);
  return path.length - 1;
};

/**
 * Verifica si una categoría puede ser eliminada (no tiene hijos activos)
 */
export const canDeleteCategory = (categories: Category[], categoryId: number): boolean => {
  return !categories.some(cat => 
    cat.parent_id === categoryId && 
    cat.is_active && 
    !cat.deleted_at
  );
};

/**
 * Cuenta el número de subcategorías de una categoría
 */
export const countSubcategories = (categories: Category[], parentId: number): number => {
  return categories.filter(cat => 
    cat.parent_id === parentId && 
    cat.is_active && 
    !cat.deleted_at
  ).length;
};

