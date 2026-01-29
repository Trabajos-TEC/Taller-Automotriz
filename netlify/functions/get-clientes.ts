import { Handler } from '@netlify/functions';
import { neon } from '@netlify/neon';

/**
 * Función Netlify de ejemplo para obtener clientes
 * Endpoint: /.netlify/functions/get-clientes
 */
export const handler: Handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Manejar OPTIONS para CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Inicializar conexión con Neon
    const sql = neon(); // Usa automáticamente NETLIFY_DATABASE_URL

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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: clientes,
        count: clientes.length,
      }),
    };

  } catch (error) {
    console.error('Error al obtener clientes:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener clientes',
        message: error instanceof Error ? error.message : 'Error desconocido',
      }),
    };
  }
};
