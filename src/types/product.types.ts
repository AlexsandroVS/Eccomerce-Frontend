// types/product.types.ts

export type ProductType = 'SIMPLE' | 'VARIABLE';

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
  product_id: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  product_id: string;
}

// Tipos para variantes según el backend
export interface ProductVariant {
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

export interface ProductVariantCreateData {
  product_id: string;
  sku_suffix: string;
  stock: number;
  price: number;
  min_stock?: number;
  attributes?: Record<string, any>;
}

export interface ProductVariantUpdateData {
  sku_suffix?: string;
  stock?: number;
  price?: number;
  min_stock?: number;
  attributes?: Record<string, any>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  slug: string;
  base_price: number;
  stock: number;
  type: ProductType;
  attributes?: Record<string, any>;
  categories: Category[];
  images: ProductImage[];
  variants?: ProductVariant[];
  is_active: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  sales_count: number;
  stock_alert: boolean;
  
  // Relaciones
  attributes: ProductAttribute[];
  images: ProductImage[];
  variants: ProductVariant[];
  categories: Category[];
}

export interface ProductCreateData {
  name: string;
  description: string;
  sku: string;
  slug: string;
  base_price: number;
  stock: number;
  type: ProductType;
  attributes?: Record<string, any>;
  categories: number[];
}

export interface ProductUpdateData {
  name?: string;
  slug?: string;
  sku?: string;
  description?: string;
  type?: ProductType;
  base_price?: number;
  compare_at_price?: number;
  is_featured?: boolean;
  attributes?: Record<string, string>;
  categories?: number[];
}

export interface ProductImageUpload {
  product_id: string;
  file: File;
  alt_text?: string;
  is_primary?: boolean;
}

export interface ProductFilters {
  includeInactive?: boolean;
  includeDeleted?: boolean;
  category?: string;
  type?: ProductType;
  search?: string;
}

export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  deleted: number;
}