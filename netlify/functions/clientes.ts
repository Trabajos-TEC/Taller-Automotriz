import { Handler } from '@netlify/functions';
import { getConnection, corsHeaders, successResponse, errorResponse } from './utils/db';

/**
 * Función Netlify de ejemplo para obtener clientes
 * Endpoint: /.netlify/functions/clientes
 */
export const handler: Handler = async (event, context) => {
  // Manejar OPTIONS para CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    // Inicializar conexión con Neon
    const sql = getConnection();

    // Obtener parámetros de búsqueda
    const search = event.queryStringParameters?.search || '';

    // Query con búsqueda opcional
    let clientes;
    if (search) {
      clientes = await sql`
        SELECT * FROM clientes 
        WHERE nombre ILIKE ${'%' + search + '%'} 
           OR cedula ILIKE ${'%' + search + '%'}
           OR correo ILIKE ${'%' + search + '%'}
        ORDER BY nombre
      `;
    } else {
      clientes = await sql`
        SELECT * FROM clientes 
        ORDER BY nombre
      `;
    }

    return successResponse(clientes);

  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return errorResponse(error instanceof Error ? error : 'Error al obtener clientes');
  }
};
