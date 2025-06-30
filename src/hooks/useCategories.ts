// hooks/useCategories.ts

import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/category.service';
import type {
    Category,
    CategoryCreateData,
    CategoryQueryParams
} from '../types/category.types';

export interface UseCategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export interface UseCategoriesActions {
  fetchCategories: (params?: CategoryQueryParams) => Promise<void>;
  createCategory: (data: CategoryCreateData) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
  activateCategory: (id: number) => Promise<void>;
  deactivateCategory: (id: number) => Promise<void>;
  refreshCategories: () => Promise<void>;
  clearError: () => void;
}

export interface UseCategoriesReturn extends UseCategoriesState, UseCategoriesActions {}

export const useCategories = (initialParams?: CategoryQueryParams): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchCategories = useCallback(async (params?: CategoryQueryParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await categoryService.findAll(params);
      setCategories(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: CategoryCreateData): Promise<Category> => {
    setError(null);
    
    try {
      const newCategory = await categoryService.create(data);
      await fetchCategories(initialParams);
      return newCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear categoría';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchCategories, initialParams]);

  const deleteCategory = useCallback(async (id: number): Promise<void> => {
    setError(null);
    
    try {
      await categoryService.delete(id);
      await fetchCategories(initialParams);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar categoría';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchCategories, initialParams]);

  const activateCategory = useCallback(async (id: number): Promise<void> => {
    setError(null);
    
    try {
      await categoryService.activate(id);
      await fetchCategories(initialParams);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al activar categoría';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchCategories, initialParams]);

  const deactivateCategory = useCallback(async (id: number): Promise<void> => {
    setError(null);
    
    try {
      await categoryService.deactivate(id);
      await fetchCategories(initialParams);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al desactivar categoría';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchCategories, initialParams]);

  const refreshCategories = useCallback(async (): Promise<void> => {
    await fetchCategories(initialParams);
  }, [fetchCategories, initialParams]);

  // Cargar categorías inicialmente
  useEffect(() => {
    fetchCategories(initialParams);
  }, [fetchCategories, initialParams]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    deleteCategory,
    activateCategory,
    deactivateCategory,
    refreshCategories,
    clearError,
  };
};

// Hook específico para una categoría individual
export const useCategory = (id: number) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await categoryService.findById(id);
      setCategory(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categoría');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  return {
    category,
    loading,
    error,
    refetch: fetchCategory,
  };
};

// Hook para verificar slug
export const useSlugCheck = () => {
  const [checking, setChecking] = useState<boolean>(false);

  const checkSlug = useCallback(async (slug: string): Promise<boolean> => {
    if (!slug.trim()) return false;
    
    setChecking(true);
    
    try {
      const available = await categoryService.checkSlug(slug);
      return available;
    } catch (err) {
      console.error('Error checking slug:', err);
      return false;
    } finally {
      setChecking(false);
    }
  }, []);

  return {
    checkSlug,
    checking,
  };
};