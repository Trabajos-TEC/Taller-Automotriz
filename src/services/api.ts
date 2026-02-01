// Configuración base de la API
const API_BASE_URL = '/.netlify/functions';

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
    throw error;
  }
}

