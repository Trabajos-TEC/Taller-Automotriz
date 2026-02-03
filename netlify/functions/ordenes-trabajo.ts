import { Handler } from '@netlify/functions';
import { 
  getConnection, 
  corsHeaders, 
  successResponse, 
  errorResponse 
} from './utils/db';
import { requireAuth } from './utils/requireAuth'; // 🔐 Importar autenticación

/**
 * Función Netlify para gestionar órdenes de trabajo
 * Endpoint: /.netlify/functions/ordenes-trabajo
 * Métodos: GET, POST, PUT, DELETE
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    // 🔐 Añadir autenticación
    const user = requireAuth(event);
    const TALLER_ID = user.taller_id;

    const sql = getConnection();
    const path = event.path.replace('/.netlify/functions/ordenes-trabajo', '');
    const segments = path.split('/').filter(Boolean);
    const id = segments[0] ? parseInt(segments[0], 10) : null;
    const vehiculoId = event.queryStringParameters?.vehiculo_id 
      ? parseInt(event.queryStringParameters.vehiculo_id, 10) 
      : null;

    switch (event.httpMethod) {
      case 'GET':
        if (id) {
          // Obtener una orden específica con detalles Y FILTRO DE TALLER
          const orden = await sql`
            SELECT 
              ot.*,
              vc.placa as vehiculo_placa,
              vb.marca as vehiculo_marca,
              vb.modelo as vehiculo_modelo,
              c.nombre as cliente_nombre,
              c.cedula as cliente_cedula,
              u.nombre as mecanico_nombre,
              s.nombre as servicio_nombre
            FROM ordenes_trabajo ot
            INNER JOIN vehiculos_clientes vc ON ot.vehiculo_cliente_id = vc.id
            INNER JOIN vehiculos_base vb ON vc.vehiculo_base_id = vb.id
            INNER JOIN clientes c ON vc.cliente_id = c.id
            LEFT JOIN usuarios u ON ot.mecanico_id = u.id
            LEFT JOIN servicios s ON ot.servicio_id = s.id
            WHERE ot.id = ${id}
              AND c.taller_id = ${TALLER_ID} -- 🔐 FILTRO POR TALLER
          `;
          
          if (orden.length === 0) {
            return errorResponse('Orden de trabajo no encontrada', 404);
          }
          
          return successResponse(orden[0]);
        } else if (vehiculoId) {
          // Obtener órdenes por vehículo CON FILTRO DE TALLER
          const ordenes = await sql`
            SELECT 
              ot.*,
              vc.placa as vehiculo_placa,
              u.nombre as mecanico_nombre,
              s.nombre as servicio_nombre
            FROM ordenes_trabajo ot
            INNER JOIN vehiculos_clientes vc ON ot.vehiculo_cliente_id = vc.id
            INNER JOIN clientes c ON vc.cliente_id = c.id
            LEFT JOIN usuarios u ON ot.mecanico_id = u.id
            LEFT JOIN servicios s ON ot.servicio_id = s.id
            WHERE ot.vehiculo_cliente_id = ${vehiculoId}
              AND c.taller_id = ${TALLER_ID} -- 🔐 FILTRO POR TALLER
            ORDER BY ot.fecha_entrada DESC
          `;
          return successResponse(ordenes);
        } else {
          // Obtener todas las órdenes DEL TALLER
          const ordenes = await sql`
            SELECT 
              ot.*,
              vc.placa as vehiculo_placa,
              vb.marca as vehiculo_marca,
              vb.modelo as vehiculo_modelo,
              c.nombre as cliente_nombre,
              c.cedula as cliente_cedula,
              u.nombre as mecanico_nombre,
              s.nombre as servicio_nombre
            FROM ordenes_trabajo ot
            INNER JOIN vehiculos_clientes vc ON ot.vehiculo_cliente_id = vc.id
            INNER JOIN vehiculos_base vb ON vc.vehiculo_base_id = vb.id
            INNER JOIN clientes c ON vc.cliente_id = c.id
            LEFT JOIN usuarios u ON ot.mecanico_id = u.id
            LEFT JOIN servicios s ON ot.servicio_id = s.id
            WHERE c.taller_id = ${TALLER_ID} -- 🔐 FILTRO POR TALLER
            ORDER BY ot.fecha_entrada DESC
          `;
          return successResponse(ordenes);
        }

      case 'POST': {
        // Crear nueva orden de trabajo
        const { 
          vehiculo_cliente_id, 
          servicio_id, 
          tipo_servicio, 
          descripcion, 
          fecha_entrada,
          costo, 
          estado,
          mecanico_id,
          notas
        } = JSON.parse(event.body || '{}');

        if (!vehiculo_cliente_id || !tipo_servicio || !descripcion) {
          return errorResponse('Vehículo, tipo de servicio y descripción son requeridos', 400);
        }

        // 🔐 Verificar que el vehículo pertenece al taller del usuario
        const vehiculoValido = await sql`
          SELECT vc.id 
          FROM vehiculos_clientes vc
          INNER JOIN clientes c ON vc.cliente_id = c.id
          WHERE vc.id = ${vehiculo_cliente_id}
            AND c.taller_id = ${TALLER_ID}
        `;

        if (vehiculoValido.length === 0) {
          return errorResponse('Vehículo no encontrado o no pertenece al taller', 404);
        }

        // 🔐 Verificar que el mecánico pertenece al taller (si se asigna)
        if (mecanico_id) {
          const mecanicoValido = await sql`
            SELECT id FROM usuarios 
            WHERE id = ${mecanico_id} 
              AND taller_id = ${TALLER_ID}
          `;
          
          if (mecanicoValido.length === 0) {
            return errorResponse('Mecánico no encontrado o no pertenece al taller', 404);
          }
        }

        const nuevaOrden = await sql`
          INSERT INTO ordenes_trabajo (
            vehiculo_cliente_id, 
            servicio_id, 
            tipo_servicio, 
            descripcion, 
            fecha_entrada,
            costo, 
            estado,
            mecanico_id,
            notas
          )
          VALUES (
            ${vehiculo_cliente_id}, 
            ${servicio_id || null}, 
            ${tipo_servicio}, 
            ${descripcion}, 
            ${fecha_entrada || new Date().toISOString()},
            ${costo || 0}, 
            ${estado || 'pendiente'},
            ${mecanico_id || null},
            ${notas || null}
          )
          RETURNING *
        `;

        return successResponse(nuevaOrden[0], 201);
      }

      case 'PUT': {
        // Actualizar orden de trabajo
        if (!id) {
          return errorResponse('ID de la orden requerido', 400);
        }

        const { 
          tipo_servicio, 
          descripcion, 
          fecha_entrada,
          fecha_salida,
          costo, 
          estado,
          mecanico_id,
          servicio_id,
          notas
        } = JSON.parse(event.body || '{}');

        // 🔐 Verificar que la orden existe Y pertenece al taller
        const ordenValida = await sql`
          SELECT ot.id 
          FROM ordenes_trabajo ot
          INNER JOIN vehiculos_clientes vc ON ot.vehiculo_cliente_id = vc.id
          INNER JOIN clientes c ON vc.cliente_id = c.id
          WHERE ot.id = ${id}
            AND c.taller_id = ${TALLER_ID}
        `;

        if (ordenValida.length === 0) {
          return errorResponse('Orden de trabajo no encontrada', 404);
        }

        // 🔐 Verificar que el mecánico pertenece al taller (si se actualiza)
        if (mecanico_id !== undefined) {
          if (mecanico_id !== null) {
            const mecanicoValido = await sql`
              SELECT id FROM usuarios 
              WHERE id = ${mecanico_id} 
                AND taller_id = ${TALLER_ID}
            `;
            
            if (mecanicoValido.length === 0) {
              return errorResponse('Mecánico no encontrado o no pertenece al taller', 404);
            }
          }
        }

        // Actualizar solo los campos que vienen definidos
        const ordenActualizada = await sql`
          UPDATE ordenes_trabajo
          SET 
            tipo_servicio = COALESCE(${tipo_servicio}, tipo_servicio),
            descripcion = COALESCE(${descripcion}, descripcion),
            fecha_entrada = COALESCE(${fecha_entrada}, fecha_entrada),
            fecha_salida = COALESCE(${fecha_salida}, fecha_salida),
            costo = COALESCE(${costo}, costo),
            estado = COALESCE(${estado}, estado),
            mecanico_id = COALESCE(${mecanico_id}, mecanico_id),
            servicio_id = COALESCE(${servicio_id}, servicio_id),
            notas = COALESCE(${notas}, notas)
          WHERE id = ${id}
          RETURNING *
        `;

        return successResponse(ordenActualizada[0]);
      }

      case 'DELETE': {
        // Eliminar orden de trabajo
        if (!id) {
          return errorResponse('ID de la orden requerido', 400);
        }

        // 🔐 Verificar que la orden pertenece al taller antes de eliminar
        const ordenValida = await sql`
          SELECT ot.id 
          FROM ordenes_trabajo ot
          INNER JOIN vehiculos_clientes vc ON ot.vehiculo_cliente_id = vc.id
          INNER JOIN clientes c ON vc.cliente_id = c.id
          WHERE ot.id = ${id}
            AND c.taller_id = ${TALLER_ID}
        `;

        if (ordenValida.length === 0) {
          return errorResponse('Orden de trabajo no encontrada', 404);
        }

        const ordenEliminada = await sql`
          DELETE FROM ordenes_trabajo WHERE id = ${id}
          RETURNING *
        `;

        return successResponse({ 
          message: 'Orden de trabajo eliminada exitosamente',
          orden: ordenEliminada[0]
        });
      }

      default:
        return errorResponse('Método no permitido', 405);
    }
  } catch (error: any) {
    // 🔐 Manejar errores de autenticación
    if (error.message === 'NO_TOKEN' || error.message === 'INVALID_TOKEN') {
      return errorResponse('Token inválido o faltante', 401);
    }
    
    console.error('Error en órdenes de trabajo:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Error interno del servidor',
      500
    );
  }
};