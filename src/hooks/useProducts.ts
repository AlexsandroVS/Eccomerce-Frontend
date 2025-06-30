// hooks/useProducts.ts

import { useState, useEffect, useCallback } from 'react';
import type {
    Product,
    ProductCreateData,
    ProductUpdateData,
    ProductImageUpload,
    ProductFilters,
    ProductStats,
    ProductVariantCreateData,
    ProductVariantUpdateData
} from '../types/product.types';
import { productService } from '../services/product.service';
import { toast } from 'sonner';

// Tipos para variantes según el backend
interface ProductVariant {
  id: string;
  product_id: string;
  sku_suffix: string;
  stock: number;
  price: number;
  min_stock: number;
  is_active: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  attributes?: Record<string, any>;
  images?: Array<{ id: string; url: string; alt_text?: string; is_primary: boolean }>;
}

interface UseProductsReturn {
  // Data
  products: Product[];
  publicProducts: Product[]; // Para el catálogo público
  deletedProducts: Product[];
  stats: ProductStats | null;
  variants: Record<string, ProductVariant[]>; // Variantes por productId
  
  // Loading states
  loading: boolean;
  publicLoading: boolean; // Loading específico para productos públicos
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  
  // Actions
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchPublicProducts: () => Promise<void>; // Nuevo método para catálogo público
  fetchDeletedProducts: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createProduct: (data: ProductCreateData) => Promise<Product | null>;
  updateProduct: (id: string, data: ProductUpdateData) => Promise<Product | null>;
  activateProduct: (id: string) => Promise<void>;
  deactivateProduct: (id: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  restoreProduct: (id: string) => Promise<void>;
  permanentDeleteProduct: (id: string) => Promise<void>;
  uploadImage: (data: ProductImageUpload) => Promise<any>;
  deleteImage: (productId: string, imageId: string) => Promise<void>;
  
  // Variant actions
  getProductVariants: (productId: string) => Promise<void>;
  createProductVariant: (productId: string, data: ProductVariantCreateData) => Promise<ProductVariant | null>;
  updateProductVariant: (variantId: string, data: ProductVariantUpdateData) => Promise<ProductVariant | null>;
  deleteProductVariant: (variantId: string) => Promise<void>;
  
  // Utils
  refreshProducts: () => Promise<void>;
  refreshPublicProducts: () => Promise<void>; // Nuevo método para refrescar catálogo
  getProductById: (id: string) => Product | undefined;
  getPublicProductById: (id: string) => Product | undefined; // Buscar en productos públicos
  getProduct: (id: string) => Promise<Product | null>;
  getProductBySlug: (slug: string) => Promise<Product | null>; // Nuevo método para slug
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [publicProducts, setPublicProducts] = useState<Product[]>([]);
  const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [variants, setVariants] = useState<Record<string, ProductVariant[]>>({});
  const [loading, setLoading] = useState(false);
  const [publicLoading, setPublicLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // MÉTODO PARA ADMINISTRADORES - Lista todos los productos
  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    setLoading(true);
    try {
      const data = await productService.getAll(filters);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  // MÉTODO PÚBLICO - Solo productos activos para clientes
  const fetchPublicProducts = useCallback(async () => {
    setPublicLoading(true);
    try {
      const data = await productService.getPublicProducts();
      setPublicProducts(data);
    } catch (error) {
      console.error('Error fetching public products:', error);
      toast.error('Error al cargar el catálogo de productos');
    } finally {
      setPublicLoading(false);
    }
  }, []);

  const fetchDeletedProducts = useCallback(async () => {
    try {
      const data = await productService.getDeleted();
      setDeletedProducts(data);
    } catch (error) {
      console.error('Error fetching deleted products:', error);
      toast.error('Error al cargar productos eliminados');
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await productService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const createProduct = useCallback(async (data: ProductCreateData) => {
    setCreating(true);
    try {
      const newProduct = await productService.create(data);
      setProducts(prev => [newProduct, ...prev]);
      
      // Si el producto está activo, también agregarlo a los productos públicos
      if (newProduct.is_active) {
        setPublicProducts(prev => [newProduct, ...prev]);
      }
      
      toast.success('Producto creado exitosamente');
      return newProduct;
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(error.message || 'Error al crear producto');
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: string, data: ProductUpdateData) => {
    setUpdating(true);
    try {
      const updatedProduct = await productService.update(id, data);
      
      // Actualizar en productos de admin
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? updatedProduct : product
        )
      );
      
      // Actualizar en productos públicos
      if (updatedProduct.is_active) {
        setPublicProducts(prev => {
          const existing = prev.find(p => p.id === id);
          if (existing) {
            return prev.map(product => 
              product.id === id ? updatedProduct : product
            );
          } else {
            return [updatedProduct, ...prev];
          }
        });
      } else {
        // Si se desactivó, remover de productos públicos
        setPublicProducts(prev => prev.filter(product => product.id !== id));
      }
      
      toast.success('Producto actualizado exitosamente');
      return updatedProduct;
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Error al actualizar producto');
      return null;
    } finally {
      setUpdating(false);
    }
  }, []);

  const activateProduct = useCallback(async (id: string) => {
    try {
      const activatedProduct = await productService.activate(id);
      
      // Actualizar en productos de admin
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? activatedProduct : product
        )
      );
      
      // Agregar a productos públicos
      setPublicProducts(prev => {
        const existing = prev.find(p => p.id === id);
        if (!existing) {
          return [activatedProduct, ...prev];
        }
        return prev.map(product => 
          product.id === id ? activatedProduct : product
        );
      });
      
      toast.success('Producto activado');
    } catch (error: any) {
      console.error('Error activating product:', error);
      toast.error(error.message || 'Error al activar producto');
    }
  }, []);

  const deactivateProduct = useCallback(async (id: string) => {
    try {
      const deactivatedProduct = await productService.deactivate(id);
      
      // Actualizar en productos de admin
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? deactivatedProduct : product
        )
      );
      
      // Remover de productos públicos
      setPublicProducts(prev => prev.filter(product => product.id !== id));
      
      toast.success('Producto desactivado');
    } catch (error: any) {
      console.error('Error deactivating product:', error);
      toast.error(error.message || 'Error al desactivar producto');
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setDeleting(true);
    try {
      await productService.softDelete(id);
      setProducts(prev => prev.filter(product => product.id !== id));
      setPublicProducts(prev => prev.filter(product => product.id !== id));
      toast.success('Producto eliminado');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Error al eliminar producto');
    } finally {
      setDeleting(false);
    }
  }, []);

  const restoreProduct = useCallback(async (id: string) => {
    try {
      const restoredProduct = await productService.restore(id);
      setDeletedProducts(prev => prev.filter(product => product.id !== id));
      setProducts(prev => [restoredProduct, ...prev]);
      
      // Si está activo, también agregarlo a productos públicos
      if (restoredProduct.is_active) {
        setPublicProducts(prev => [restoredProduct, ...prev]);
      }
      
      toast.success('Producto restaurado');
    } catch (error: any) {
      console.error('Error restoring product:', error);
      toast.error(error.message || 'Error al restaurar producto');
    }
  }, []);

  const permanentDeleteProduct = useCallback(async (id: string) => {
    setDeleting(true);
    try {
      await productService.permanentDelete(id);
      setDeletedProducts(prev => prev.filter(product => product.id !== id));
      toast.success('Producto eliminado permanentemente');
    } catch (error: any) {
      console.error('Error permanently deleting product:', error);
      toast.error(error.message || 'Error al eliminar producto permanentemente');
    } finally {
      setDeleting(false);
    }
  }, []);

  const uploadImage = useCallback(async (data: ProductImageUpload) => {
    try {
      const image = await productService.uploadImage(data);
      return image;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Error al subir imagen');
      throw error;
    }
  }, []);

  const deleteImage = useCallback(async (productId: string, imageId: string) => {
    try {
      await productService.deleteImage(productId, imageId);
      toast.success('Imagen eliminada');
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast.error(error.message || 'Error al eliminar imagen');
    }
  }, []);

  // Métodos para variantes
  const getProductVariants = useCallback(async (productId: string) => {
    try {
      const variantsData = await productService.getVariants(productId);
      setVariants(prev => ({
        ...prev,
        [productId]: variantsData
      }));
    } catch (error: any) {
      console.error('Error fetching variants:', error);
      toast.error(error.message || 'Error al cargar variantes');
      setVariants(prev => ({
        ...prev,
        [productId]: []
      }));
    }
  }, []);

  const createProductVariant = useCallback(async (productId: string, data: ProductVariantCreateData) => {
    try {
      const variant = await productService.createVariant(productId, data);
      setVariants(prev => ({
        ...prev,
        [productId]: [...(prev[productId] || []), variant]
      }));
      toast.success('Variante creada exitosamente');
      return variant;
    } catch (error: any) {
      console.error('Error creating variant:', error);
      toast.error(error.message || 'Error al crear variante');
      return null;
    }
  }, []);

  const updateProductVariant = useCallback(async (variantId: string, data: ProductVariantUpdateData) => {
    try {
      const updatedVariant = await productService.updateVariant(variantId, data);
      
      // Actualizar en el estado
      setVariants(prev => {
        const newVariants = { ...prev };
        Object.keys(newVariants).forEach(productId => {
          newVariants[productId] = newVariants[productId].map(variant =>
            variant.id === variantId ? updatedVariant : variant
          );
        });
        return newVariants;
      });
      
      toast.success('Variante actualizada exitosamente');
      return updatedVariant;
    } catch (error: any) {
      console.error('Error updating variant:', error);
      toast.error(error.message || 'Error al actualizar variante');
      return null;
    }
  }, []);

  const deleteProductVariant = useCallback(async (variantId: string) => {
    try {
      await productService.deleteVariant(variantId);
      
      // Remover del estado
      setVariants(prev => {
        const newVariants = { ...prev };
        Object.keys(newVariants).forEach(productId => {
          newVariants[productId] = newVariants[productId].filter(variant => variant.id !== variantId);
        });
        return newVariants;
      });
      
      toast.success('Variante eliminada exitosamente');
    } catch (error: any) {
      console.error('Error deleting variant:', error);
      toast.error(error.message || 'Error al eliminar variante');
    }
  }, []);

  // Utilidades
  const refreshProducts = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  const refreshPublicProducts = useCallback(async () => {
    await fetchPublicProducts();
  }, [fetchPublicProducts]);

  const getProductById = useCallback((id: string) => {
    return products.find(product => product.id === id);
  }, [products]);

  const getPublicProductById = useCallback((id: string) => {
    return publicProducts.find(product => product.id === id);
  }, [publicProducts]);

  const getProduct = useCallback(async (id: string) => {
    try {
      return await productService.getById(id);
    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast.error(error.message || 'Error al cargar producto');
      return null;
    }
  }, []);

  const getProductBySlug = useCallback(async (slug: string) => {
    try {
      return await productService.getBySlug(slug);
    } catch (error: any) {
      console.error('Error fetching product by slug:', error);
      toast.error(error.message || 'Producto no encontrado');
      return null;
    }
  }, []);

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProducts();
    fetchStats();
    // No cargamos automáticamente los productos públicos aquí
    // Se cargarán cuando se necesiten específicamente
  }, [fetchProducts, fetchStats]);

  return {
    // Data
    products,
    publicProducts,
    deletedProducts,
    stats,
    variants,
    
    // Loading states
    loading,
    publicLoading,
    creating,
    updating,
    deleting,
    
    // Actions
    fetchProducts,
    fetchPublicProducts,
    fetchDeletedProducts,
    fetchStats,
    createProduct,
    updateProduct,
    activateProduct,
    deactivateProduct,
    deleteProduct,
    restoreProduct,
    permanentDeleteProduct,
    uploadImage,
    deleteImage,
    
    // Variant actions
    getProductVariants,
    createProductVariant,
    updateProductVariant,
    deleteProductVariant,
    
    // Utils
    refreshProducts,
    refreshPublicProducts,
    getProductById,
    getPublicProductById,
    getProduct,
    getProductBySlug,
  };
};