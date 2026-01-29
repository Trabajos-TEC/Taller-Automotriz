import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

/**
 * Función Netlify para obtener inventario
 * Endpoint: /.netlify/functions/get-inventario
 */
export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL!);
    const search = event.queryStringParameters?.search || '';

    // Query con vehículos asociados
    let inventario;
    if (search) {
      inventario = await sql`
        SELECT 
          i.*,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', vb.id,
                'marca', vb.marca,
                'modelo', vb.modelo,
                'anio', vb.anio,
                'tipo', vb.tipo
              )
            ) FILTER (WHERE vb.id IS NOT NULL),
            '[]'
          ) as vehiculos_asociados
        FROM inventario i
        LEFT JOIN inventario_vehiculos iv ON i.id = iv.inventario_id
        LEFT JOIN vehiculos_base vb ON iv.vehiculo_base_id = vb.id
        WHERE 
          i.codigo ILIKE ${'%' + search + '%'} OR 
          i.nombre ILIKE ${'%' + search + '%'} OR 
          i.descripcion ILIKE ${'%' + search + '%'}
        GROUP BY i.id 
        ORDER BY i.codigo
      `;
    } else {
      inventario = await sql`
        SELECT 
          i.*,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', vb.id,
                'marca', vb.marca,
                'modelo', vb.modelo,
                'anio', vb.anio,
                'tipo', vb.tipo
              )
            ) FILTER (WHERE vb.id IS NOT NULL),
            '[]'
          ) as vehiculos_asociados
        FROM inventario i
        LEFT JOIN inventario_vehiculos iv ON i.id = iv.inventario_id
        LEFT JOIN vehiculos_base vb ON iv.vehiculo_base_id = vb.id
        GROUP BY i.id 
        ORDER BY i.codigo
      `;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: inventario,
        count: inventario.length,
      }),
    };

  } catch (error) {
    console.error('Error al obtener inventario:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener inventario',
        message: error instanceof Error ? error.message : 'Error desconocido',
      }),
    };
  }
};
