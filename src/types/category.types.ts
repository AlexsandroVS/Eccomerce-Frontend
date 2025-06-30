// types/category.types.ts

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  attributes_normalized?: Record<string, any> | null;
  // Relaciones opcionales
  parent?: Category;
  children?: Category[];
}

export interface CategoryCreateData {
  name: string;
  slug: string;
  parent_id?: number | null;
  attributes_normalized?: Record<string, any>;
}

export interface CategoryUpdateData extends Partial<CategoryCreateData> {}

export interface CategoryQueryParams {
  parent_id?: number | "root";
}

export interface CategoryResponse {
  data: Category[];
  total?: number;
}

export interface CategoryApiResponse {
  category?: Category;
  message?: string;
  error?: string;
}

export interface SlugCheckResponse {
  available: boolean;
}