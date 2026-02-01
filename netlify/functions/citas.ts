// netlify/functions/citas.ts
import { Handler } from '@netlify/functions';
import {
  getConnection,
  corsHeaders,
  successResponse,
  errorResponse
} from './utils/db';
import { requireAuth } from './utils/requireAuth';

/**
 * Función Netlify para gestionar citas
 * Endpoint: /.netlify/functions/citas
 * Soporta: GET, POST, PUT, PATCH, DELETE
 */
export const handler: Handler = async (event) => {
  // ✅ CORS primero
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    // 🔐 Autenticación
    const user = requireAuth(event);
    const TALLER_ID = user.taller_id;

    const sql = getConnection();
    const pathParts = event.path.split('/').filter(Boolean);
    const idParam = pathParts[pathParts.length - 1] !== 'citas' 
      ? pathParts[pathParts.length - 1] 
      : null;
    const id = idParam ? parseInt(idParam) : null;

    /* ======================= GET ======================= */
    if (event.httpMethod === 'GET') {
      const search = event.queryStringParameters?.search || '';
      const estado = event.queryStringParameters?.estado || '';
      const fecha = event.queryStringParameters?.fecha || '';
      const limit = event.queryStringParameters?.limit || '';

      // GET /citas/estadisticas/totales
      if (event.path.includes('/estadisticas/totales')) {
        const [total, enEspera, aceptadas, completadas, canceladas, hoy] = await Promise.all([
          sql`SELECT COUNT(*) as count FROM citas WHERE taller_id = ${TALLER_ID}`,
          sql`SELECT COUNT(*) as count FROM citas WHERE taller_id = ${TALLER_ID} AND estado = 'En Espera'`,
          sql`SELECT COUNT(*) as count FROM citas WHERE taller_id = ${TALLER_ID} AND estado = 'Aceptada'`,
          sql`SELECT COUNT(*) as count FROM citas WHERE taller_id = ${TALLER_ID} AND estado = 'Completada'`,
          sql`SELECT COUNT(*) as count FROM citas WHERE taller_id = ${TALLER_ID} AND estado = 'Cancelada'`,
          sql`SELECT COUNT(*) as count FROM citas WHERE taller_id = ${TALLER_ID} AND fecha = CURRENT_DATE`
        ]);

        return successResponse({
          total: parseInt(total[0].count),
          en_espera: parseInt(enEspera[0].count),
          aceptadas: parseInt(aceptadas[0].count),
          completadas: parseInt(completadas[0].count),
          canceladas: parseInt(canceladas[0].count),
          hoy: parseInt(hoy[0].count)
        });
      }

      // GET /citas/proximas
      if (event.path.includes('/proximas')) {
        const limitNum = limit ? parseInt(limit) : 10;
        const citas = await sql`
          SELECT c.*, 
                 vc.placa,
                 v.marca,
                 v.modelo,
                 cl.nombre as cliente_nombre,
                 u.nombre as mecanico_nombre
          FROM citas c
          JOIN vehiculos_clientes vc ON c.vehiculo_cliente_id = vc.id
          JOIN vehiculos v ON vc.vehiculo_id = v.id
          JOIN clientes cl ON vc.cliente_id = cl.id
          LEFT JOIN usuarios u ON c.usuario_id = u.id
          WHERE c.taller_id = ${TALLER_ID}
            AND c.fecha >= CURRENT_DATE
            AND c.estado IN ('En Espera', 'Aceptada')
          ORDER BY c.fecha, c.hora
          LIMIT ${limitNum}
        `;
        return successResponse(citas);
      }

      // GET /citas/check-disponibilidad (special case)
      if (event.path.includes('/check-disponibilidad')) {
        return errorResponse('Use POST para check-disponibilidad', 405);
      }

      // GET /citas/:id
      if (id && !isNaN(id)) {
        const cita = await sql`
          SELECT c.*, 
                 vc.placa,
                 v.marca,
                 v.modelo,
                 cl.nombre as cliente_nombre,
                 u.nombre as mecanico_nombre
          FROM citas c
          JOIN vehiculos_clientes vc ON c.vehiculo_cliente_id = vc.id
          JOIN vehiculos v ON vc.vehiculo_id = v.id
          JOIN clientes cl ON vc.cliente_id = cl.id
          LEFT JOIN usuarios u ON c.usuario_id = u.id
          WHERE c.id = ${id}
            AND c.taller_id = ${TALLER_ID}
          LIMIT 1
        `;

        if (cita.length === 0) {
          return errorResponse('Cita no encontrada', 404);
        }

        return successResponse(cita[0]);
      }

      // GET /citas/vehiculo-cliente/:id
      if (event.path.includes('/vehiculo-cliente/')) {
        const vcId = parseInt(pathParts[pathParts.length - 1]);
        if (isNaN(vcId)) {
          return errorResponse('ID inválido', 400);
        }

        const citas = await sql`
          SELECT * FROM citas 
          WHERE vehiculo_cliente_id = ${vcId}
            AND taller_id = ${TALLER_ID}
          ORDER BY fecha DESC, hora DESC
        `;
        return successResponse(citas);
      }

      // GET /citas/usuario/:id
      if (event.path.includes('/usuario/')) {
        const usuarioId = parseInt(pathParts[pathParts.length - 1]);
        if (isNaN(usuarioId)) {
          return errorResponse('ID inválido', 400);
        }

        const citas = await sql`
          SELECT * FROM citas 
          WHERE usuario_id = ${usuarioId}
            AND taller_id = ${TALLER_ID}
          ORDER BY fecha DESC, hora DESC
        `;
        return successResponse(citas);
      }

      // GET /citas/estado/:estado
      if (event.path.includes('/estado/')) {
        const estadoParam = pathParts[pathParts.length - 1];
        const citas = await sql`
          SELECT * FROM citas 
          WHERE estado = ${estadoParam}
            AND taller_id = ${TALLER_ID}
          ORDER BY fecha DESC, hora DESC
        `;
        return successResponse(citas);
      }

      // GET /citas/fecha/:fecha
      if (event.path.includes('/fecha/')) {
        const fechaParam = pathParts[pathParts.length - 1];
        const citas = await sql`
          SELECT * FROM citas 
          WHERE fecha = ${fechaParam}::DATE
            AND taller_id = ${TALLER_ID}
          ORDER BY hora
        `;
        return successResponse(citas);
      }

      // GET /citas (todos con filtros)
      let query = sql`
        SELECT c.*, 
               vc.placa,
               v.marca,
               v.modelo,
               cl.nombre as cliente_nombre,
               u.nombre as mecanico_nombre
        FROM citas c
        JOIN vehiculos_clientes vc ON c.vehiculo_cliente_id = vc.id
        JOIN vehiculos v ON vc.vehiculo_id = v.id
        JOIN clientes cl ON vc.cliente_id = cl.id
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.taller_id = ${TALLER_ID}
      `;

      if (search) {
        query = sql`${query} AND (
          vc.placa ILIKE ${'%' + search + '%'}
          OR v.marca ILIKE ${'%' + search + '%'}
          OR v.modelo ILIKE ${'%' + search + '%'}
          OR cl.nombre ILIKE ${'%' + search + '%'}
          OR u.nombre ILIKE ${'%' + search + '%'}
          OR c.descripcion ILIKE ${'%' + search + '%'}
        )`;
      }

      if (estado) {
        query = sql`${query} AND c.estado = ${estado}`;
      }

      if (fecha) {
        query = sql`${query} AND c.fecha = ${fecha}::DATE`;
      }

      query = sql`${query} ORDER BY c.fecha DESC, c.hora DESC`;

      const citas = await query;
      return successResponse(citas);
    }

    /* ======================= POST ======================= */
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');

      // POST /citas/check-disponibilidad
      if (event.path.includes('/check-disponibilidad')) {
        const { vehiculoClienteId, fecha, hora, usuarioId, excludeId } = body;
        
        if (!vehiculoClienteId || !fecha || !hora) {
          return errorResponse('Se requieren vehiculoClienteId, fecha y hora', 400);
        }

        // Check vehículo-cliente
        let citaExistenteQuery = sql`
          SELECT * FROM citas 
          WHERE vehiculo_cliente_id = ${vehiculoClienteId}
            AND fecha = ${fecha}::DATE
            AND hora = ${hora}::TIME
            AND taller_id = ${TALLER_ID}
        `;

        if (excludeId) {
          citaExistenteQuery = sql`${citaExistenteQuery} AND id != ${excludeId}`;
        }

        const citaExistente = await citaExistenteQuery;

        // Check usuario si se proporciona
        let usuarioDisponible = true;
        if (usuarioId && usuarioId > 0) {
          let usuarioQuery = sql`
            SELECT * FROM citas 
            WHERE usuario_id = ${usuarioId}
              AND fecha = ${fecha}::DATE
              AND hora = ${hora}::TIME
              AND taller_id = ${TALLER_ID}
          `;

          if (excludeId) {
            usuarioQuery = sql`${usuarioQuery} AND id != ${excludeId}`;
          }

          const usuarioCitas = await usuarioQuery;
          usuarioDisponible = usuarioCitas.length === 0;
        }

        return successResponse({
          vehiculoClienteDisponible: citaExistente.length === 0,
          usuarioDisponible,
          citaExistente: citaExistente.length > 0 ? citaExistente[0] : null
        });
      }

      // POST /citas (crear nueva)
      const { vehiculo_cliente_id, fecha, hora, descripcion, estado = 'En Espera', usuario_id } = body;

      if (!vehiculo_cliente_id || !fecha || !hora || !descripcion) {
        return errorResponse('Faltan campos requeridos', 400);
      }

      // Validar fecha futura
      const fechaCita = new Date(fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaCita < hoy) {
        return errorResponse('No se pueden agendar citas en fechas pasadas', 400);
      }

      // Check disponibilidad
      const citaExistente = await sql`
        SELECT * FROM citas 
        WHERE vehiculo_cliente_id = ${vehiculo_cliente_id}
          AND fecha = ${fecha}::DATE
          AND hora = ${hora}::TIME
          AND taller_id = ${TALLER_ID}
      `;

      if (citaExistente.length > 0) {
        return errorResponse('El vehículo ya tiene una cita en ese horario', 409);
      }

      // Crear cita
      const result = await sql`
        INSERT INTO citas (
          vehiculo_cliente_id, fecha, hora, descripcion, 
          estado, usuario_id, taller_id, created_at, updated_at
        ) VALUES (
          ${vehiculo_cliente_id}, ${fecha}::DATE, ${hora}::TIME, ${descripcion},
          ${estado}, ${usuario_id || null}, ${TALLER_ID}, NOW(), NOW()
        ) RETURNING *
      `;

      return successResponse(result[0], 201);
    }

    /* ======================= PUT ======================= */
    if (event.httpMethod === 'PUT' && id && !isNaN(id)) {
      const body = JSON.parse(event.body || '{}');
      const { vehiculo_cliente_id, fecha, hora, descripcion, usuario_id, estado } = body;

      // Verificar que la cita existe y pertenece al taller
      const citaExistente = await sql`
        SELECT * FROM citas 
        WHERE id = ${id} AND taller_id = ${TALLER_ID}
        LIMIT 1
      `;

      if (citaExistente.length === 0) {
        return errorResponse('Cita no encontrada', 404);
      }

      // Check disponibilidad si se cambian datos críticos
      if ((fecha && fecha !== citaExistente[0].fecha) || 
          (hora && hora !== citaExistente[0].hora) || 
          (vehiculo_cliente_id && vehiculo_cliente_id !== citaExistente[0].vehiculo_cliente_id)) {
        
        const disponibilidad = await sql`
          SELECT * FROM citas 
          WHERE vehiculo_cliente_id = ${vehiculo_cliente_id || citaExistente[0].vehiculo_cliente_id}
            AND fecha = ${(fecha || citaExistente[0].fecha)}::DATE
            AND hora = ${(hora || citaExistente[0].hora)}::TIME
            AND taller_id = ${TALLER_ID}
            AND id != ${id}
        `;

        if (disponibilidad.length > 0) {
          return errorResponse('Ya existe otra cita en ese horario', 409);
        }
      }

      // Actualizar
      const result = await sql`
        UPDATE citas SET
          vehiculo_cliente_id = COALESCE(${vehiculo_cliente_id}, vehiculo_cliente_id),
          fecha = COALESCE(${fecha}::DATE, fecha),
          hora = COALESCE(${hora}::TIME, hora),
          descripcion = COALESCE(${descripcion}, descripcion),
          usuario_id = COALESCE(${usuario_id}, usuario_id),
          estado = COALESCE(${estado}, estado),
          updated_at = NOW()
        WHERE id = ${id} AND taller_id = ${TALLER_ID}
        RETURNING *
      `;

      if (result.length === 0) {
        return errorResponse('Error al actualizar cita', 500);
      }

      return successResponse(result[0]);
    }

    /* ======================= PATCH ======================= */
    if (event.httpMethod === 'PATCH' && id && !isNaN(id)) {
      const body = JSON.parse(event.body || '{}');

      // PATCH /citas/:id/estado
      if (event.path.includes('/estado')) {
        const { estado } = body;
        if (!estado) {
          return errorResponse('Estado requerido', 400);
        }

        const result = await sql`
          UPDATE citas 
          SET estado = ${estado}, updated_at = NOW()
          WHERE id = ${id} AND taller_id = ${TALLER_ID}
          RETURNING *
        `;

        if (result.length === 0) {
          return errorResponse('Cita no encontrada', 404);
        }

        return successResponse(result[0]);
      }

      // PATCH /citas/:id/asignar-usuario
      if (event.path.includes('/asignar-usuario')) {
        const { usuario_id } = body;
        if (!usuario_id) {
          return errorResponse('ID de usuario requerido', 400);
        }

        // Verificar disponibilidad del usuario
        const cita = await sql`
          SELECT fecha, hora FROM citas 
          WHERE id = ${id} AND taller_id = ${TALLER_ID}
          LIMIT 1
        `;

        if (cita.length === 0) {
          return errorResponse('Cita no encontrada', 404);
        }

        const usuarioOcupado = await sql`
          SELECT * FROM citas 
          WHERE usuario_id = ${usuario_id}
            AND fecha = ${cita[0].fecha}
            AND hora = ${cita[0].hora}
            AND taller_id = ${TALLER_ID}
            AND id != ${id}
        `;

        if (usuarioOcupado.length > 0) {
          return errorResponse('El usuario ya tiene una cita en ese horario', 409);
        }

        const result = await sql`
          UPDATE citas 
          SET usuario_id = ${usuario_id}, updated_at = NOW()
          WHERE id = ${id} AND taller_id = ${TALLER_ID}
          RETURNING *
        `;

        return successResponse(result[0]);
      }

      return errorResponse('Ruta PATCH no válida', 400);
    }

    /* ======================= DELETE ======================= */
    if (event.httpMethod === 'DELETE' && id && !isNaN(id)) {
      // Verificar estado antes de eliminar
      const cita = await sql`
        SELECT estado FROM citas 
        WHERE id = ${id} AND taller_id = ${TALLER_ID}
        LIMIT 1
      `;

      if (cita.length === 0) {
        return errorResponse('Cita no encontrada', 404);
      }

      if (cita[0].estado !== 'Cancelada') {
        return errorResponse('Solo se pueden eliminar citas canceladas', 400);
      }

      const result = await sql`
        DELETE FROM citas 
        WHERE id = ${id} AND taller_id = ${TALLER_ID}
        RETURNING id
      `;

      if (result.length === 0) {
        return errorResponse('Error al eliminar cita', 500);
      }

      return successResponse({ message: 'Cita eliminada exitosamente' });
    }

    return errorResponse('Método no permitido', 405);

  } catch (err: any) {
    // 🔐 Errores de autenticación
    if (err.message === 'NO_TOKEN') {
      return errorResponse('Token requerido', 401);
    }

    if (err.message === 'INVALID_TOKEN') {
      return errorResponse('Token inválido', 401);
    }

    console.error('Error en citas:', err);
    return errorResponse('Error interno del servidor', 500);
  }
};