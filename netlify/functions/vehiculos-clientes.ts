import { Handler } from '@netlify/functions';
import { getConnection, corsHeaders, successResponse, errorResponse } from './utils/db';
import { requireAuth } from './utils/requireAuth';

/**
 * Función Netlify para gestionar vehículos de clientes
 * Endpoint: /.netlify/functions/vehiculos-clientes
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const user = requireAuth(event);
    const TALLER_ID = user.taller_id;
    const sql = getConnection();

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
          WHERE 
            c.taller_id = ${TALLER_ID}
            AND (
              vc.placa ILIKE ${'%' + search + '%'}
              OR c.nombre ILIKE ${'%' + search + '%'}
              OR vb.marca ILIKE ${'%' + search + '%'}
              OR vb.modelo ILIKE ${'%' + search + '%'}
            )
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
          WHERE c.taller_id = ${TALLER_ID}
          ORDER BY vc.placa
        `;

      }

      return successResponse(vehiculos);
    }

    // POST - Crear vehículo de cliente
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { placa, cliente_id, vehiculo_base_id, color, kilometraje, vin, notas } = body;

      if (!placa || !cliente_id || !vehiculo_base_id) {
        return errorResponse('Placa, cliente_id y vehiculo_base_id son requeridos', 400);
      }
      const clienteValido = await sql`
        SELECT id FROM clientes
        WHERE id = ${cliente_id}
          AND taller_id = ${TALLER_ID}
        LIMIT 1
      `;
      if (clienteValido.length === 0) {
        return errorResponse('Cliente no pertenece a este taller', 403);
      }
      const result = await sql`
        INSERT INTO vehiculos_clientes 
          (placa, cliente_id, vehiculo_base_id, color, kilometraje, vin, notas)
        VALUES 
          (${placa}, ${cliente_id}, ${vehiculo_base_id}, ${color}, ${kilometraje}, ${vin}, ${notas})
        RETURNING *
      `;

      return successResponse(result[0], 201);
    }

    // PUT - Actualizar vehículo de cliente
    if (event.httpMethod === 'PUT') {
      const path = event.path.split('/');
      const id = parseInt(path[path.length - 1]);

      if (!id || isNaN(id)) {
        return errorResponse('ID inválido', 400);
      }

      // Verificar que el vehículo pertenece a un cliente del taller
      const vehiculoExistente = await sql`
        SELECT vc.id
        FROM vehiculos_clientes vc
        INNER JOIN clientes c ON vc.cliente_id = c.id
        WHERE vc.id = ${id} AND c.taller_id = ${TALLER_ID}
        LIMIT 1
      `;

      if (vehiculoExistente.length === 0) {
        return errorResponse('Vehículo no encontrado o no pertenece a este taller', 404);
      }

      const body = JSON.parse(event.body || '{}');
      const { cliente_id, vehiculo_base_id, color, kilometraje, vin, notas } = body;

      // Si se actualiza el cliente, verificar que pertenece al taller
      if (cliente_id) {
        const clienteValido = await sql`
          SELECT id FROM clientes
          WHERE id = ${cliente_id} AND taller_id = ${TALLER_ID}
          LIMIT 1
        `;
        if (clienteValido.length === 0) {
          return errorResponse('Cliente no pertenece a este taller', 403);
        }
      }

      // Actualizar solo los campos proporcionados
      const updates: any = {};
      if (cliente_id !== undefined) updates.cliente_id = cliente_id;
      if (vehiculo_base_id !== undefined) updates.vehiculo_base_id = vehiculo_base_id;
      if (color !== undefined) updates.color = color;
      if (kilometraje !== undefined) updates.kilometraje = kilometraje;
      if (vin !== undefined) updates.vin = vin;
      if (notas !== undefined) updates.notas = notas;

      const result = await sql`
        UPDATE vehiculos_clientes
        SET ${sql(updates)}
        WHERE id = ${id}
        RETURNING *
      `;

      // Obtener el vehículo completo con sus relaciones
      const vehiculoCompleto = await sql`
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
        WHERE vc.id = ${id}
        LIMIT 1
      `;

      return successResponse(vehiculoCompleto[0]);
    }

    // DELETE - Eliminar vehículo de cliente
    if (event.httpMethod === 'DELETE') {
      const path = event.path.split('/');
      const id = parseInt(path[path.length - 1]);

      if (!id || isNaN(id)) {
        return errorResponse('ID inválido', 400);
      }

      // Verificar que el vehículo pertenece a un cliente del taller
      const vehiculoExistente = await sql`
        SELECT vc.id
        FROM vehiculos_clientes vc
        INNER JOIN clientes c ON vc.cliente_id = c.id
        WHERE vc.id = ${id} AND c.taller_id = ${TALLER_ID}
        LIMIT 1
      `;

      if (vehiculoExistente.length === 0) {
        return errorResponse('Vehículo no encontrado o no pertenece a este taller', 404);
      }

      await sql`
        DELETE FROM vehiculos_clientes
        WHERE id = ${id}
      `;

      return successResponse({ message: 'Vehículo eliminado exitosamente' });
    }

    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };

  } catch (error) {
    console.error('Error en vehiculos-clientes:', error);
    
    if (error instanceof Error) {
      if (error.message === 'NO_TOKEN') {
        return errorResponse('No se proporcionó token de autenticación', 401);
      }
      if (error.message === 'INVALID_TOKEN') {
        return errorResponse('Token de autenticación inválido', 401);
      }
      return errorResponse(error.message);
    }
    
    return errorResponse('Error interno del servidor');
  }
};
