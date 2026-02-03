// netlify/functions/orden-detalles.ts
import { Handler } from '@netlify/functions';
import { getConnection, corsHeaders, successResponse, errorResponse } from './utils/db';
import { requireAuth } from './utils/requireAuth';

/**
 * Función Netlify para gestionar detalles de órdenes de trabajo
 * Endpoint: /.netlify/functions/orden-detalles
 * Métodos: GET, POST, DELETE
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const user = requireAuth(event);
    const TALLER_ID = user.taller_id;
    const sql = getConnection();

    const method = event.httpMethod;
    const path = event.path;
    const pathParts = path.split('/').filter(Boolean);
    
    // Extraer ordenId y tipo (repuestos o servicios)
    const ordenId = pathParts[pathParts.indexOf('orden-detalles') + 1];
    const tipo = pathParts[pathParts.indexOf('orden-detalles') + 2]; // 'repuestos' o 'servicios'

    if (!ordenId || !tipo) {
      return errorResponse('Se requiere ordenId y tipo (repuestos o servicios)', 400);
    }

    // Verificar que la orden pertenece al taller
    const ordenValida = await sql`
      SELECT ot.id 
      FROM ordenes_trabajo ot
      INNER JOIN vehiculos_clientes vc ON ot.vehiculo_cliente_id = vc.id
      INNER JOIN clientes c ON vc.cliente_id = c.id
      WHERE ot.id = ${ordenId}
        AND c.taller_id = ${TALLER_ID}
    `;

    if (ordenValida.length === 0) {
      return errorResponse('Orden de trabajo no encontrada', 404);
    }

    switch (method) {
      case 'GET': {
        if (tipo === 'repuestos') {
          const repuestos = await sql`
            SELECT * FROM orden_repuestos 
            WHERE orden_trabajo_id = ${ordenId}
            ORDER BY created_at ASC
          `;
          return successResponse(repuestos);
        } else if (tipo === 'servicios') {
          const servicios = await sql`
            SELECT * FROM orden_servicios 
            WHERE orden_trabajo_id = ${ordenId}
            ORDER BY created_at ASC
          `;
          return successResponse(servicios);
        }
        return errorResponse('Tipo inválido. Use: repuestos o servicios', 400);
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}');

        if (tipo === 'repuestos') {
          const { producto_codigo, producto_nombre, cantidad, precio_unitario, subtotal } = body;

          if (!producto_codigo || !producto_nombre || !cantidad || precio_unitario === undefined || subtotal === undefined) {
            return errorResponse('Datos incompletos del repuesto', 400);
          }

          const nuevoRepuesto = await sql`
            INSERT INTO orden_repuestos (
              orden_trabajo_id, 
              producto_codigo, 
              producto_nombre, 
              cantidad, 
              precio_unitario, 
              subtotal
            )
            VALUES (
              ${ordenId},
              ${producto_codigo},
              ${producto_nombre},
              ${cantidad},
              ${precio_unitario},
              ${subtotal}
            )
            RETURNING *
          `;

          return successResponse(nuevoRepuesto[0], 201);

        } else if (tipo === 'servicios') {
          const { servicio_codigo, servicio_nombre, descripcion, precio } = body;

          if (!servicio_codigo || !servicio_nombre || precio === undefined) {
            return errorResponse('Datos incompletos del servicio', 400);
          }

          const nuevoServicio = await sql`
            INSERT INTO orden_servicios (
              orden_trabajo_id,
              servicio_codigo,
              servicio_nombre,
              descripcion,
              precio
            )
            VALUES (
              ${ordenId},
              ${servicio_codigo},
              ${servicio_nombre},
              ${descripcion || ''},
              ${precio}
            )
            RETURNING *
          `;

          return successResponse(nuevoServicio[0], 201);
        }

        return errorResponse('Tipo inválido. Use: repuestos o servicios', 400);
      }

      case 'DELETE': {
        const detalleId = pathParts[pathParts.indexOf('orden-detalles') + 3];
        
        if (!detalleId) {
          return errorResponse('Se requiere el ID del detalle', 400);
        }

        if (tipo === 'repuestos') {
          await sql`
            DELETE FROM orden_repuestos 
            WHERE id = ${detalleId} 
              AND orden_trabajo_id = ${ordenId}
          `;
          return successResponse({ message: 'Repuesto eliminado' });

        } else if (tipo === 'servicios') {
          await sql`
            DELETE FROM orden_servicios 
            WHERE id = ${detalleId} 
              AND orden_trabajo_id = ${ordenId}
          `;
          return successResponse({ message: 'Servicio eliminado' });
        }

        return errorResponse('Tipo inválido. Use: repuestos o servicios', 400);
      }

      default:
        return errorResponse('Método no permitido', 405);
    }

  } catch (error: any) {
    console.error('Error en orden-detalles:', error);
    
    if (error.message === 'NO_TOKEN') {
      return errorResponse('No se proporcionó token de autenticación', 401);
    }
    if (error.message === 'INVALID_TOKEN') {
      return errorResponse('Token de autenticación inválido', 401);
    }
    
    return errorResponse(error.message || 'Error interno del servidor', 500);
  }
};
