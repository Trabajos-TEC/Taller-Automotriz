import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

/**
 * Función Netlify para obtener vehículos de clientes
 * Endpoint: /.netlify/functions/get-vehiculos
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

    let vehiculos;
    if (search) {
      vehiculos = await sql`
        SELECT 
          vc.*,
          c.cedula as cliente_cedula,
          c.nombre as cliente_nombre,
          c.numero as cliente_telefono,
          c.correo as cliente_correo,
          vb.marca as vehiculo_marca,
          vb.modelo as vehiculo_modelo,
          vb.anio as vehiculo_anio,
          vb.tipo as vehiculo_tipo
        FROM vehiculos_clientes vc
        INNER JOIN clientes c ON vc.cliente_id = c.id
        INNER JOIN vehiculos_base vb ON vc.vehiculo_base_id = vb.id
        WHERE 
          vc.placa ILIKE ${'%' + search + '%'} OR 
          c.cedula ILIKE ${'%' + search + '%'} OR 
          c.nombre ILIKE ${'%' + search + '%'} OR 
          vb.marca ILIKE ${'%' + search + '%'} OR 
          vb.modelo ILIKE ${'%' + search + '%'} OR
          vc.vin ILIKE ${'%' + search + '%'}
        ORDER BY vc.placa
      `;
    } else {
      vehiculos = await sql`
        SELECT 
          vc.*,
          c.cedula as cliente_cedula,
          c.nombre as cliente_nombre,
          c.numero as cliente_telefono,
          c.correo as cliente_correo,
          vb.marca as vehiculo_marca,
          vb.modelo as vehiculo_modelo,
          vb.anio as vehiculo_anio,
          vb.tipo as vehiculo_tipo
        FROM vehiculos_clientes vc
        INNER JOIN clientes c ON vc.cliente_id = c.id
        INNER JOIN vehiculos_base vb ON vc.vehiculo_base_id = vb.id
        ORDER BY vc.placa
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

  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error al obtener vehículos',
        message: error instanceof Error ? error.message : 'Error desconocido',
      }),
    };
  }
};
