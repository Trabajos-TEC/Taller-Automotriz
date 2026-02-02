import { Handler } from '@netlify/functions';
import { getConnection, corsHeaders, successResponse, errorResponse } from './utils/db';

/**
 * Función Netlify para gestionar citas del taller
 * Endpoint: /.netlify/functions/citas
 * Métodos: GET, POST, PUT, DELETE
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const sql = getConnection();
    const path = event.path.replace('/.netlify/functions/citas', '');
    const segments = path.split('/').filter(Boolean);
    const id = segments[0] ? parseInt(segments[0], 10) : null;

    switch (event.httpMethod) {
      case 'GET':
        if (id) {
          // Obtener una cita específica con detalles
          const cita = await sql`
            SELECT 
              c.*,
              vc.placa as vehiculo_placa,
              vb.marca as vehiculo_marca,
              vb.modelo as vehiculo_modelo,
              cl.nombre as cliente_nombre,
              cl.cedula as cliente_cedula,
              cl.correo as cliente_correo,
              cl.numero as cliente_telefono,
              u.nombre as mecanico_nombre
            FROM citas c
            INNER JOIN vehiculos_clientes vc ON c.vehiculo_cliente_id = vc.id
            INNER JOIN vehiculos_base vb ON vc.vehiculo_base_id = vb.id
            INNER JOIN clientes cl ON vc.cliente_id = cl.id
            LEFT JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.id = ${id}
          `;
          
          if (cita.length === 0) {
            return errorResponse('Cita no encontrada', 404);
          }
          
          return successResponse(cita[0]);
        } else {
          // Obtener todas las citas con información relacionada
          const estado = event.queryStringParameters?.estado;
          const fecha = event.queryStringParameters?.fecha;
          
          let query = `
            SELECT 
              c.*,
              vc.placa as vehiculo_placa,
              vb.marca as vehiculo_marca,
              vb.modelo as vehiculo_modelo,
              cl.nombre as cliente_nombre,
              cl.cedula as cliente_cedula,
              cl.correo as cliente_correo,
              u.nombre as mecanico_nombre
            FROM citas c
            INNER JOIN vehiculos_clientes vc ON c.vehiculo_cliente_id = vc.id
            INNER JOIN vehiculos_base vb ON vc.vehiculo_base_id = vb.id
            INNER JOIN clientes cl ON vc.cliente_id = cl.id
            LEFT JOIN usuarios u ON c.usuario_id = u.id
            WHERE 1=1
          `;
          
          const params: any[] = [];
          let paramCount = 1;

          if (estado) {
            query += ` AND c.estado = $${paramCount}`;
            params.push(estado);
            paramCount++;
          }

          if (fecha) {
            query += ` AND c.fecha = $${paramCount}`;
            params.push(fecha);
            paramCount++;
          }

          query += ` ORDER BY c.fecha DESC, c.hora DESC`;

          const citas = await sql(query, params);
          return successResponse(citas);
        }

      case 'POST': {
        // Crear nueva cita
        const { 
          vehiculo_cliente_id, 
          fecha, 
          hora, 
          descripcion, 
          usuario_id,
          estado
        } = JSON.parse(event.body || '{}');

        // Validaciones
        if (!vehiculo_cliente_id || !fecha || !hora || !descripcion) {
          return errorResponse('Campos requeridos: vehiculo_cliente_id, fecha, hora, descripcion', 400);
        }

        // Verificar que el vehículo existe
        const vehiculo = await sql`
          SELECT id FROM vehiculos_clientes WHERE id = ${vehiculo_cliente_id}
        `;

        if (vehiculo.length === 0) {
          return errorResponse('Vehículo no encontrado', 404);
        }

        // Verificar si el usuario existe (si se proporciona)
        if (usuario_id) {
          const usuario = await sql`
            SELECT id FROM usuarios WHERE id = ${usuario_id}
          `;
          if (usuario.length === 0) {
            return errorResponse('Usuario no encontrado', 404);
          }
        }

        // Crear la cita
        const estadoFinal = estado || 'En Espera';
        const result = await sql`
          INSERT INTO citas (
            vehiculo_cliente_id, 
            fecha, 
            hora, 
            descripcion, 
            usuario_id,
            estado
          )
          VALUES (
            ${vehiculo_cliente_id},
            ${fecha},
            ${hora},
            ${descripcion},
            ${usuario_id || null},
            ${estadoFinal}
          )
          RETURNING *
        `;

        return successResponse(result[0], 201);
      }

      case 'PUT': {
        if (!id) {
          return errorResponse('ID de cita requerido', 400);
        }

        const body = JSON.parse(event.body || '{}');
        const { 
          vehiculo_cliente_id, 
          fecha, 
          hora, 
          descripcion, 
          usuario_id,
          estado 
        } = body;

        // Verificar que la cita existe
        const citaExistente = await sql`
          SELECT id FROM citas WHERE id = ${id}
        `;

        if (citaExistente.length === 0) {
          return errorResponse('Cita no encontrada', 404);
        }

        // Construir UPDATE dinámicamente
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (vehiculo_cliente_id !== undefined) {
          // Verificar que el vehículo existe
          const vehiculo = await sql`
            SELECT id FROM vehiculos_clientes WHERE id = ${vehiculo_cliente_id}
          `;
          if (vehiculo.length === 0) {
            return errorResponse('Vehículo no encontrado', 404);
          }
          updates.push(`vehiculo_cliente_id = $${paramCount}`);
          values.push(vehiculo_cliente_id);
          paramCount++;
        }

        if (fecha !== undefined) {
          updates.push(`fecha = $${paramCount}`);
          values.push(fecha);
          paramCount++;
        }

        if (hora !== undefined) {
          updates.push(`hora = $${paramCount}`);
          values.push(hora);
          paramCount++;
        }

        if (descripcion !== undefined) {
          updates.push(`descripcion = $${paramCount}`);
          values.push(descripcion);
          paramCount++;
        }

        if (usuario_id !== undefined) {
          if (usuario_id !== null) {
            const usuario = await sql`
              SELECT id FROM usuarios WHERE id = ${usuario_id}
            `;
            if (usuario.length === 0) {
              return errorResponse('Usuario no encontrado', 404);
            }
          }
          updates.push(`usuario_id = $${paramCount}`);
          values.push(usuario_id);
          paramCount++;
        }

        if (estado !== undefined) {
          updates.push(`estado = $${paramCount}`);
          values.push(estado);
          paramCount++;
        }

        if (updates.length === 0) {
          return errorResponse('No se proporcionaron campos para actualizar', 400);
        }

        values.push(id);
        const query = `
          UPDATE citas 
          SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE id = $${paramCount}
          RETURNING *
        `;

        const result = await sql(query, values);
        return successResponse(result[0]);
      }

      case 'DELETE': {
        if (!id) {
          return errorResponse('ID de cita requerido', 400);
        }

        const result = await sql`
          DELETE FROM citas 
          WHERE id = ${id}
          RETURNING *
        `;

        if (result.length === 0) {
          return errorResponse('Cita no encontrada', 404);
        }

        return successResponse({ id, deleted: true });
      }

      default:
        return errorResponse('Método no permitido', 405);
    }
  } catch (error) {
    console.error('Error en citas:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Error desconocido',
      500
    );
  }
};
