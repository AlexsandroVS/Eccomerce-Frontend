// config/api.config.ts

export const API_CONFIG = {
  // URL base del backend
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  
  // Endpoints específicos
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      PROFILE: '/api/auth/profile',
    },
    PRODUCTS: {
      CATALOG: '/api/products/catalog',
      BY_ID: (id: string) => `/api/products/${id}`,
      BY_SLUG: (slug: string) => `/api/products/slug/${slug}`,
      CREATE: '/api/products',
      UPDATE: (id: string) => `/api/products/${id}`,
      DELETE: (id: string) => `/api/products/${id}`,
      UPLOAD_IMAGE: (id: string) => `/api/products/${id}/images`,
      DELETE_IMAGE: (id: string, imageId: string) => `/api/products/${id}/images/${imageId}`,
    },
    CATEGORIES: {
      ALL: '/api/categories',
      BY_ID: (id: string) => `/api/categories/${id}`,
      CREATE: '/api/categories',
      UPDATE: (id: string) => `/api/categories/${id}`,
      DELETE: (id: string) => `/api/categories/${id}`,
    },
    PRODUCT_VARIANTS: {
      BY_PRODUCT: (productId: string) => `/api/product-variants/product/${productId}`,
      CREATE: '/api/product-variants',
      UPDATE: (id: string) => `/api/product-variants/${id}`,
      DELETE: (id: string) => `/api/product-variants/${id}`,
      UPLOAD_IMAGE: (id: string) => `/api/product-variants/${id}/images`,
    },
    ORDERS: {
      ALL: '/orders',
      BY_ID: (id: string) => `/orders/${id}`,
      CREATE: '/orders',
      UPDATE: (id: string) => `/orders/${id}`,
    },
    WISHLIST: {
      ALL: '/api/wishlist',
      ADD: '/api/wishlist',
      REMOVE: (productId: string) => `/api/wishlist/${productId}`,
    },
  },
  
  // Configuración de imágenes
  IMAGES: {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    UPLOADS_PATH: '/uploads',
    PRODUCTS_PATH: '/uploads/products',
    VARIANTS_PATH: '/uploads/variants',
  },
  
  // Configuración de paginación
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 12,
    MAX_PAGE_SIZE: 100,
  },
  
  // Configuración de caché
  CACHE: {
    TTL: 5 * 60 * 1000, // 5 minutos
    PRODUCTS_TTL: 10 * 60 * 1000, // 10 minutos
    CATEGORIES_TTL: 30 * 60 * 1000, // 30 minutos
  },
  
  // Configuración de debounce
  DEBOUNCE: {
    SEARCH: 300, // 300ms
    FILTERS: 500, // 500ms
  },
};

// Función para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Función para construir URLs de imágenes
export const buildImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // Si ya es una URL completa, la devuelve tal como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si es una ruta relativa, la combina con la URL base
  if (imagePath.startsWith('/')) {
    return `${API_CONFIG.IMAGES.BASE_URL}${imagePath}`;
  }
  
  // Si no tiene slash inicial, agregarlo
  return `${API_CONFIG.IMAGES.BASE_URL}/${imagePath}`;
}; 