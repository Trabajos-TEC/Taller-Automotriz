import { Handler } from '@netlify/functions';
import { getConnection, corsHeaders, successResponse, errorResponse } from './utils/db';

/**
 * Función Netlify para gestionar vehículos base (catálogo)
 * Endpoint: /.netlify/functions/vehiculos-base
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const sql = getConnection();

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

      return successResponse(vehiculos);
    }

    // POST - Crear vehículo base
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { marca, modelo, anio, tipo } = body;

      if (!marca || !modelo || !anio || !tipo) {
        return errorResponse('Marca, modelo, año y tipo son requeridos', 400);
      }

      const result = await sql`
        INSERT INTO vehiculos_base (marca, modelo, anio, tipo)
        VALUES (${marca}, ${modelo}, ${anio}, ${tipo})
        RETURNING *
      `;

      return successResponse(result[0], 201);
    }

    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };

  } catch (error) {
    console.error('Error en vehiculos-base:', error);
    return errorResponse(error instanceof Error ? error : 'Error interno del servidor');
  }
};
