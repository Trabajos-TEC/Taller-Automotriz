// Configuración base de la API - SIMPLE Y FUNCIONAL
// Usar variable de entorno si existe, si no detectar automáticamente
const getApiBaseUrl = () => {
  // 1. Primero verificar si hay variable de entorno (la más confiable)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. Si no, detectar automáticamente si estamos en desarrollo
  const isLocalDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  return isLocalDev 
    ? 'http://localhost:3001/api'  // Desarrollo local
    : '/.netlify/functions';        // Producción Netlify
};

const API_BASE_URL = getApiBaseUrl();

console.log(`🌐 API Base URL: ${API_BASE_URL}`);
console.log(`📍 Host: ${window.location.hostname}`);

// Interfaces comunes
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  meta?: {
    total: number;
    showing: number;
  };
  errors?: string[];
}

// Función genérica para hacer requests
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  // 👉 obtener token del login
  const token = localStorage.getItem('token');

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Error en la solicitud');
    }

    return data;
  } catch (error) {
    console.error('Error en fetchApi:', error);
    console.error('URL que falló:', url);
    throw error;
  }
}