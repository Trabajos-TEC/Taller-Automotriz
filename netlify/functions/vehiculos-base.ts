import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

/**
 * Función Netlify para gestionar vehículos base (catálogo)
 * Endpoint: /.netlify/functions/vehiculos-base
 */
export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL!, {
      fetchOptions: { cache: 'no-store' }
    });

    // GET - Obtener vehículos base
    if (event.httpMethod === 'GET') {
      const search = event.queryStringParameters?.search || '';

      let vehiculos;
      if (search) {
        vehiculos = await sql`
          SELECT * FROM vehiculos_base
          WHERE marca ILIKE ${'%' + search + '%'}
             OR modelo ILIKE ${'%' + search + '%'}
             OR tipo ILIKE ${'%' + search + '%'}
          ORDER BY marca, modelo, anio
        `;
      } else {
        vehiculos = await sql`
          SELECT * FROM vehiculos_base
          ORDER BY marca, modelo, anio
        `;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: vehiculos,
          count: vehiculos.length,
        }),
      };
    }

    // POST - Crear vehículo base
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { marca, modelo, anio, tipo } = body;

      if (!marca || !modelo || !anio || !tipo) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Marca, modelo, año y tipo son requeridos'
          }),
        };
      }

      const result = await sql`
        INSERT INTO vehiculos_base (marca, modelo, anio, tipo)
        VALUES (${marca}, ${modelo}, ${anio}, ${tipo})
        RETURNING *
      `;

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          data: result[0],
        }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };

  } catch (error) {
    console.error('Error en vehiculos-base:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido',
      }),
    };
  }
};
