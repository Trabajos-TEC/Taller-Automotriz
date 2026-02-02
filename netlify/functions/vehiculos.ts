import { Handler } from '@netlify/functions';
import { getConnection, corsHeaders, successResponse, errorResponse } from './utils/db';
import { requireAuth } from './utils/requireAuth';
/**
 * Función Netlify para obtener vehículos (alias de vehiculos-clientes para compatibilidad)
 * Endpoint: /.netlify/functions/vehiculos
 */
export const handler: Handler = async (event) => {
  const user = requireAuth(event);
  const TALLER_ID = user.taller_id;

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const sql = getConnection();
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
          c.taller_id = ${TALLER_ID}
          AND (
            vc.placa ILIKE ${'%' + search + '%'} OR 
            c.cedula ILIKE ${'%' + search + '%'} OR 
            c.nombre ILIKE ${'%' + search + '%'} OR 
            vb.marca ILIKE ${'%' + search + '%'} OR 
            vb.modelo ILIKE ${'%' + search + '%'} OR
            vc.vin ILIKE ${'%' + search + '%'}
          )
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
        WHERE c.taller_id = ${TALLER_ID}
        ORDER BY vc.placa
      `;

    }

    return successResponse(vehiculos);

  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    return errorResponse(error instanceof Error ? error : 'Error al obtener vehículos');
  }
};
