// Usar la URL base sin /api para archivos estáticos
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Convierte una URL relativa de imagen en una URL absoluta
 * @param relativeUrl - URL relativa (ej: /uploads/products/123/image.jpg)
 * @returns URL absoluta completa
 */
export const getImageUrl = (relativeUrl: string): string => {
  if (!relativeUrl) return '';
  
  // Si ya es una URL absoluta, la devolvemos tal como está
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  
  // Asegurarnos de que la URL relativa empiece con /
  const normalizedPath = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
  
  // Combinar con la URL base del backend
  return `${API_BASE_URL}${normalizedPath}`;
};

/**
 * Convierte múltiples URLs relativas en URLs absolutas
 * @param images - Array de objetos con URLs de imágenes
 * @returns Array con URLs absolutas
 */
export const getImageUrls = (images: Array<{ url: string; [key: string]: any }>) => {
  return images.map(image => ({
    ...image,
    url: getImageUrl(image.url)
  }));
};

/**
 * Verifica si una imagen existe
 * @param url - URL de la imagen
 * @returns Promise<boolean>
 */
export const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}; 