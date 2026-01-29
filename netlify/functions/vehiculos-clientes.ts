import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

/**
 * Función Netlify para gestionar vehículos de clientes
 * Endpoint: /.netlify/functions/vehiculos-clientes
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

    // GET - Obtener vehículos de clientes
    if (event.httpMethod === 'GET') {
      const search = event.queryStringParameters?.search || '';

      let vehiculos;
      if (search) {
        vehiculos = await sql`
          SELECT 
            vc.id,
            vc.placa,
            vc.color,
            vc.kilometraje,
            vc.vin,
            vc.notas,
            c.id as cliente_id,
            c.nombre as cliente_nombre,
            c.cedula as cliente_cedula,
            c.numero as cliente_telefono,
            c.correo as cliente_correo,
            vb.id as vehiculo_base_id,
            vb.marca as vehiculo_marca,
            vb.modelo as vehiculo_modelo,
            vb.anio as vehiculo_anio,
            vb.tipo as vehiculo_tipo
          FROM vehiculos_clientes vc
          INNER JOIN clientes c ON vc.cliente_id = c.id
          INNER JOIN vehiculos_base vb ON vc.vehiculo_base_id = vb.id
          WHERE vc.placa ILIKE ${'%' + search + '%'}
             OR c.nombre ILIKE ${'%' + search + '%'}
             OR vb.marca ILIKE ${'%' + search + '%'}
             OR vb.modelo ILIKE ${'%' + search + '%'}
          ORDER BY vc.placa
        `;
      } else {
        vehiculos = await sql`
          SELECT 
            vc.id,
            vc.placa,
            vc.color,
            vc.kilometraje,
            vc.vin,
            vc.notas,
            c.id as cliente_id,
            c.nombre as cliente_nombre,
            c.cedula as cliente_cedula,
            c.numero as cliente_telefono,
            c.correo as cliente_correo,
            vb.id as vehiculo_base_id,
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
    }

    // POST - Crear vehículo de cliente
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { placa, cliente_id, vehiculo_base_id, color, kilometraje, vin, notas } = body;

      if (!placa || !cliente_id || !vehiculo_base_id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Placa, cliente_id y vehiculo_base_id son requeridos'
          }),
        };
      }

      const result = await sql`
        INSERT INTO vehiculos_clientes 
          (placa, cliente_id, vehiculo_base_id, color, kilometraje, vin, notas)
        VALUES 
          (${placa}, ${cliente_id}, ${vehiculo_base_id}, ${color}, ${kilometraje}, ${vin}, ${notas})
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
    console.error('Error en vehiculos-clientes:', error);
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
