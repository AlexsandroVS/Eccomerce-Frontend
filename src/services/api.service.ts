import axios from 'axios';

// Usar directamente la URL de la API que ya incluye /api
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Remover cualquier doble /api/api/ en la URL
    if (config.url) {
      config.url = config.url.replace(/\/api\/api\//, '/api/');
    }
    
    console.log('🔍 Request:', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    console.error('❌ Response error:', {
      error,
      response: error.response,
      message: error.message,
      stack: error.stack,
    });
    return Promise.reject(error);
  }
);

export default api;
