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
    const response = await api.get(`${this.baseURL}/${id}`);
    return response.data;
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
    const response = await api.get(`${this.baseURL}/slug/${slug}`);
    return response.data;
  }

  // MÉTODOS DE ADMINISTRACIÓN (requieren autenticación y permisos de admin)
  async create(data: ProductCreateData): Promise<Product> {
    const response = await api.post(this.baseURL, data);
    return response.data;
  }

  async update(id: string, data: ProductUpdateData): Promise<Product> {
    const response = await api.patch(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  async activate(id: string): Promise<Product> {
    const response = await api.patch(`${this.baseURL}/${id}/activate`);
    return response.data;
  }

  async deactivate(id: string): Promise<Product> {
    const response = await api.patch(`${this.baseURL}/${id}/deactivate`);
    return response.data;
  }

  async softDelete(id: string): Promise<void> {
    await api.delete(`${this.baseURL}/${id}`);
  }

  async restore(id: string): Promise<Product> {
    const response = await api.patch(`${this.baseURL}/${id}/restore`);
    return response.data;
  }

  async permanentDelete(id: string): Promise<void> {
    await api.delete(`${this.baseURL}/${id}/permanent`);
  }

  async getDeleted(): Promise<Product[]> {
    const response = await api.get(`${this.baseURL}/deleted`);
    return response.data;
  }

  async getStats(): Promise<ProductStats> {
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
  }

  async deleteImage(productId: string, imageId: string): Promise<void> {
    await api.delete(`${this.baseURL}/${productId}/images/${imageId}`);
  }

  // Métodos para variantes - usando la estructura correcta del backend
  async getVariants(productId: string): Promise<ProductVariant[]> {
    const response = await api.get(`/product-variants/product/${productId}`);
    return response.data;
  }

  async createVariant(data: ProductVariantCreateData): Promise<ProductVariant> {
    const response = await api.post(`/product-variants`, data);
    return response.data;
  }

  async updateVariant(variantId: string, data: ProductVariantUpdateData): Promise<ProductVariant> {
    const response = await api.patch(`/product-variants/${variantId}`, data);
    return response.data;
  }

  async deleteVariant(variantId: string): Promise<void> {
    await api.delete(`/product-variants/${variantId}`);
  }

  async uploadVariantImage(variantId: string, data: { file: File; is_primary?: boolean }): Promise<any> {
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
  }
}

export const productService = new ProductService();