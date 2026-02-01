// Configuración base de la API
// SOLUCIÓN: Detectar si estamos en desarrollo local o producción
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001/api'  // Desarrollo local - conecta directo al backend
  : '/.netlify/functions';        // Producción en Netlify

// Interfaces comunes
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
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
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  console.log(`🌐 Fetching: ${url}`, isDevelopment ? '(Desarrollo local)' : '(Netlify)');

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // Si la respuesta no es JSON, mostrar error detallado
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Respuesta no es JSON:', text.substring(0, 200));
      throw new Error(`El servidor respondió con HTML/texto en lugar de JSON. URL: ${url}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('❌ Error en fetchApi:', error);
    console.error('📡 URL intentada:', url);
    
    // Mejor mensaje de error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      if (isDevelopment) {
        throw new Error(`No se puede conectar al backend en ${API_BASE_URL}. Verifica que:
        1. El backend esté corriendo en localhost:3001
        2. El backend tenga CORS habilitado
        3. No haya errores en la consola del backend`);
      } else {
        throw new Error('Error de conexión con el servidor. Verifica tu conexión a internet.');
      }
    }
    
    throw error;
  }
}

// Función de ayuda para debug
export function debugApiConfig() {
  console.log('🔧 Configuración de API:');
  console.log('  - Hostname:', window.location.hostname);
  console.log('  - Es desarrollo?', isDevelopment);
  console.log('  - API_BASE_URL:', API_BASE_URL);
  console.log('  - URL completa ejemplo:', `${API_BASE_URL}/clientes`);
}