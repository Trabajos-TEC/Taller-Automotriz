/**
 * Utilidad compartida para conexión a Neon Database
 * Todas las funciones de Netlify deben importar de aquí
 */
import { neon } from '@neondatabase/serverless';

/**
 * Obtiene una conexión SQL a Neon
 * @returns Cliente SQL de Neon
 */
export function getConnection() {
  if (!process.env.NETLIFY_DATABASE_URL) {
    throw new Error('NETLIFY_DATABASE_URL no está configurada');
  }

  return neon(process.env.NETLIFY_DATABASE_URL, {
    fetchOptions: {
      cache: 'no-store'
    }
  });
}

/**
 * Headers CORS comunes para todas las funciones
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

/**
 * Maneja la respuesta de éxito
 */
export function successResponse(data: any, statusCode = 200) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({
      success: true,
      data,
      count: Array.isArray(data) ? data.length : undefined,
    }),
  };
}

/**
 * Maneja la respuesta de error
 */
export function errorResponse(error: string | Error, statusCode = 500) {
  const message = error instanceof Error ? error.message : error;
  
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({
      success: false,
      error: message,
    }),
  };
}
