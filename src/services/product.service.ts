// services/product.service.ts
import api from '../services/api.service';
import type {
    Product,
    ProductCreateData,
    ProductUpdateData,
    ProductImageUpload,
    ProductFilters,
    ProductStats,
    ProductVariantCreateData,
    ProductVariantUpdateData,
    ProductVariant
} from '../types/product.types';
import { toast } from 'sonner';

class ProductService {
  private baseURL = '/products';

  // MÉTODOS PARA ADMINISTRADORES (requieren autenticación)
  async getAll(filters?: ProductFilters): Promise<Product[]> {
    try {
      const params: Record<string, string> = {};
      
      if (filters?.includeInactive) {
        params.includeInactive = 'true';
      }
      
      if (filters?.includeDeleted) {
        params.includeDeleted = 'true';
      }
      
      if (filters?.category) {
        params.category = filters.category;
      }
      
      if (filters?.type) {
        params.type = filters.type;
      }
      
      if (filters?.search) {
        params.search = filters.search;
      }
      
      const response = await api.get(this.baseURL, { params });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al obtener productos';
      throw new Error(message);
    }
  }

  // Usar el endpoint principal y filtrar productos activos y no eliminados
  async getPublicProducts(): Promise<Product[]> {
    try {
      const response = await api.get(this.baseURL);
      // Filtrar solo productos activos y no eliminados
      return response.data.filter((product: Product) => 
        product.is_active && !product.deleted_at
      );
    } catch (error: any) {
      console.error('Error fetching products:', error);
      throw new Error('Error al obtener el catálogo de productos');
    }
  }

  // MÉTODO PARA CLIENTES AUTENTICADOS (cualquier rol)
  async getAuthenticatedCatalog(): Promise<{ products: Product[], user: any }> {
    try {
      const response = await api.get(`${this.baseURL}/auth-catalog`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al obtener el catálogo de productos';
      throw new Error(message);
    }
  }

  async getById(id: string): Promise<Product> {
    try {
      const response = await api.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Producto no encontrado';
      throw new Error(message);
    }
  }

  async search(query: string): Promise<Product[]> {
    try {
      const response = await api.get(`${this.baseURL}/search`, {
        params: { q: query }
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error en la búsqueda';
      throw new Error(message);
    }
  }

  // MÉTODO PÚBLICO PARA OBTENER PRODUCTO POR SLUG (para clientes)
  async getBySlug(slug: string): Promise<Product> {
    try {
      const response = await api.get(`${this.baseURL}/slug/${slug}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Producto no encontrado';
      throw new Error(message);
    }
  }

  // MÉTODOS DE ADMINISTRACIÓN (requieren autenticación y permisos de admin)
  async create(data: ProductCreateData): Promise<Product> {
    try {
      const response = await api.post(this.baseURL, data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al crear producto';
      throw new Error(message);
    }
  }

  async update(id: string, data: ProductUpdateData): Promise<Product> {
    try {
      const response = await api.patch(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al actualizar producto';
      throw new Error(message);
    }
  }

  async activate(id: string): Promise<Product> {
    try {
      const response = await api.patch(`${this.baseURL}/${id}/activate`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al activar producto';
      throw new Error(message);
    }
  }

  async deactivate(id: string): Promise<Product> {
    try {
      const response = await api.patch(`${this.baseURL}/${id}/deactivate`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al desactivar producto';
      throw new Error(message);
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseURL}/${id}`);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al eliminar producto';
      throw new Error(message);
    }
  }

  async restore(id: string): Promise<Product> {
    try {
      const response = await api.patch(`${this.baseURL}/${id}/restore`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al restaurar producto';
      throw new Error(message);
    }
  }

  async permanentDelete(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseURL}/${id}/permanent`);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al eliminar producto permanentemente';
      throw new Error(message);
    }
  }

  async getDeleted(): Promise<Product[]> {
    try {
      const response = await api.get(`${this.baseURL}/deleted`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al obtener productos eliminados';
      throw new Error(message);
    }
  }

  async getStats(): Promise<ProductStats> {
    try {
      const [active, inactive, deleted] = await Promise.all([
        this.getCount(),
        this.getCount(false, false),
        this.getCount(true, false),
        this.getCount(true, true),
      ]);

      return {
        total: active,
        active,
        inactive: inactive - active,
        deleted: deleted - inactive,
      };
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al obtener estadísticas';
      throw new Error(message);
    }
  }

  async getCount(includeInactive = false, includeDeleted = false): Promise<number> {
    try {
      const response = await api.get(this.baseURL);
      let products = response.data;
      
      // Filtrar según los parámetros
      if (!includeInactive) {
        products = products.filter((p: Product) => p.is_active);
      }
      if (!includeDeleted) {
        products = products.filter((p: Product) => !p.deleted_at);
      }
      
      return products.length;
    } catch (error: any) {
      console.error('Error getting product count:', error);
      throw new Error('Error al obtener el conteo de productos');
    }
  }

  async uploadImage(data: ProductImageUpload): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('image', data.file);
      
      if (data.alt_text) {
        formData.append('alt_text', data.alt_text);
      }
      
      if (data.is_primary !== undefined) {
        formData.append('is_primary', data.is_primary.toString());
      }

      const response = await api.post(`${this.baseURL}/${data.product_id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al subir imagen';
      throw new Error(message);
    }
  }

  async deleteImage(productId: string, imageId: string): Promise<void> {
    try {
      await api.delete(`${this.baseURL}/${productId}/images/${imageId}`);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al eliminar imagen';
      throw new Error(message);
    }
  }

  // Métodos para variantes - usando la estructura correcta del backend
  async getVariants(productId: string): Promise<ProductVariant[]> {
    try {
      const response = await api.get(`/product-variants/product/${productId}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al obtener variantes';
      throw new Error(message);
    }
  }

  async createVariant(data: ProductVariantCreateData): Promise<ProductVariant> {
    try {
      const response = await api.post(`/product-variants`, data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al crear variante';
      throw new Error(message);
    }
  }

  async updateVariant(variantId: string, data: ProductVariantUpdateData): Promise<ProductVariant> {
    try {
      const response = await api.patch(`/product-variants/${variantId}`, data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al actualizar variante';
      throw new Error(message);
    }
  }

  async deleteVariant(variantId: string): Promise<void> {
    try {
      await api.delete(`/product-variants/${variantId}`);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al eliminar variante';
      throw new Error(message);
    }
  }

  async uploadVariantImage(variantId: string, data: { file: File; is_primary?: boolean }): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('image', data.file);
      
      if (data.is_primary !== undefined) {
        formData.append('is_primary', data.is_primary.toString());
      }

      const response = await api.post(`/product-variants/${variantId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al subir imagen de variante';
      throw new Error(message);
    }
  }
}

export const productService = new ProductService();