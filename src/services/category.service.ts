// services/category.service.ts
import type {
  Category,
  CategoryCreateData,
  CategoryQueryParams,
  CategoryApiResponse,
  SlugCheckResponse
} from '../types/category.types';
import api from '../services/api.service';

class CategoryService {
  // La baseURL no debe incluir /api ya que eso está en la URL base
  private baseURL = '/categories';

  // Obtener token del localStorage o donde lo tengas almacenado
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  // Configuración con token de autenticación
  private getAuthConfig() {
    const token = this.getAuthToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  // Obtener todas las categorías (PÚBLICO)
  async findAll(params?: CategoryQueryParams): Promise<Category[]> {
    try {
      const queryParams: any = {};
      
      if (params?.parent_id !== undefined) {
        queryParams.parent_id = params.parent_id;
      }

      const response = await api.get(this.baseURL, { params: queryParams });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al obtener las categorías';
      throw new Error(message);
    }
  }

  // Obtener una categoría por ID
  async findById(id: number): Promise<Category> {
    try {
      const response = await api.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al obtener la categoría';
      throw new Error(message);
    }
  }

  // Crear nueva categoría (ADMIN)
  async create(data: CategoryCreateData): Promise<CategoryApiResponse> {
    try {
      const response = await api.post(this.baseURL, data, this.getAuthConfig());
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al crear la categoría';
      throw new Error(message);
    }
  }

  // Actualizar categoría (ADMIN)
  async update(id: number, data: CategoryCreateData): Promise<CategoryApiResponse> {
    try {
      const response = await api.put(`${this.baseURL}/${id}`, data, this.getAuthConfig());
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al actualizar la categoría';
      throw new Error(message);
    }
  }

  // Activar categoría (ADMIN)
  async activate(id: number): Promise<CategoryApiResponse> {
    try {
      const response = await api.patch(`${this.baseURL}/${id}/activate`, {}, this.getAuthConfig());
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al activar la categoría';
      throw new Error(message);
    }
  }

  // Eliminar categoría permanentemente (ADMIN)
  async delete(id: number): Promise<CategoryApiResponse> {
    try {
      const response = await api.delete(`${this.baseURL}/${id}`, this.getAuthConfig());
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al eliminar la categoría';
      throw new Error(message);
    }
  }

  // Desactivar categoría (ADMIN)
  async deactivate(id: number): Promise<CategoryApiResponse> {
    try {
      const response = await api.patch(`${this.baseURL}/${id}/deactivate`, {}, this.getAuthConfig());
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al desactivar la categoría';
      throw new Error(message);
    }
  }

  // Verificar disponibilidad de slug (PÚBLICO)
  async checkSlug(slug: string): Promise<boolean> {
    try {
      const response = await api.get(`${this.baseURL}/check-slug`, {
        params: { slug }
      });
      const result: SlugCheckResponse = response.data;
      return result.available;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Error al verificar el slug';
      throw new Error(message);
    }
  }

  // Obtener categorías raíz (sin parent_id)
  async findRootCategories(): Promise<Category[]> {
    return this.findAll({ parent_id: "root" });
  }

  // Obtener subcategorías de una categoría padre
  async findChildren(parentId: number): Promise<Category[]> {
    return this.findAll({ parent_id: parentId });
  }
}

export const categoryService = new CategoryService();