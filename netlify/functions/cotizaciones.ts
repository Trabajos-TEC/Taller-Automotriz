import { Handler } from '@netlify/functions';
import { getConnection, corsHeaders, successResponse, errorResponse } from './utils/db';
import { requireAuth } from './utils/requireAuth';

/**
 * Función Netlify para gestionar cotizaciones
 * Endpoint: /.netlify/functions/cotizaciones
 * Métodos: GET, POST, PUT, DELETE
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const user = requireAuth(event);
    const TALLER_ID = user.taller_id;
    TALLER_ID; // Usado para futuras extensiones
    
    const sql = getConnection();
    const path = event.path.replace('/.netlify/functions/cotizaciones', '');
    const segments = path.split('/').filter(Boolean);
    const id = segments[0] ? parseInt(segments[0], 10) : null;

    switch (event.httpMethod) {
      case 'GET':
        if (id) {
          // Obtener una cotización específica
          const cotizacion = await sql`
            SELECT * FROM cotizaciones WHERE id = ${id}
          `;
          
          if (cotizacion.length === 0) {
            return errorResponse('Cotización no encontrada', 404);
          }
          
          return successResponse(cotizacion[0]);
        } else {
          // Obtener todas las cotizaciones con filtros opcionales
          const estado = event.queryStringParameters?.estado;
          const mecanico = event.queryStringParameters?.mecanico;
          const cliente = event.queryStringParameters?.cliente;
          
          let query = `SELECT * FROM cotizaciones WHERE 1=1`;
          const params: any[] = [];
          let paramCount = 1;

          if (estado) {
            query += ` AND estado = $${paramCount}`;
            params.push(estado);
            paramCount++;
          }

          if (mecanico) {
            query += ` AND LOWER(mecanico_orden_trabajo) LIKE $${paramCount}`;
            params.push(`%${mecanico.toLowerCase()}%`);
            paramCount++;
          }

          if (cliente) {
            query += ` AND (LOWER(cliente_nombre) LIKE $${paramCount} OR LOWER(vehiculo_placa) LIKE $${paramCount})`;
            params.push(`%${cliente.toLowerCase()}%`);
            paramCount++;
          }

          query += ` ORDER BY fecha_creacion DESC`;

          const cotizaciones = await sql(query, params);
          return successResponse(cotizaciones);
        }

      case 'POST': {
        // Crear nueva cotización
        const { 
          codigo,
          cliente_nombre,
          cliente_cedula,
          vehiculo_placa,
          descuento_mano_obra,
          subtotal_repuestos,
          subtotal_mano_obra,
          iva,
          total,
          estado,
          es_proforma,
          codigo_orden_trabajo,
          mecanico_orden_trabajo,
          repuestos,
          mano_obra
        } = JSON.parse(event.body || '{}');

        // Validaciones
        if (!codigo || !cliente_nombre || !cliente_cedula || !vehiculo_placa) {
          return errorResponse('Campos requeridos: codigo, cliente_nombre, cliente_cedula, vehiculo_placa', 400);
        }

        if (subtotal_repuestos === undefined || subtotal_mano_obra === undefined || iva === undefined || total === undefined) {
          return errorResponse('Campos numéricos requeridos: subtotal_repuestos, subtotal_mano_obra, iva, total', 400);
        }

        // Verificar que el código no exista
        const existente = await sql`
          SELECT id FROM cotizaciones WHERE codigo = ${codigo}
        `;

        if (existente.length > 0) {
          return errorResponse('Ya existe una cotización con ese código', 400);
        }

        const result = await sql`
          INSERT INTO cotizaciones (
            codigo,
            cliente_nombre,
            cliente_cedula,
            vehiculo_placa,
            descuento_mano_obra,
            subtotal_repuestos,
            subtotal_mano_obra,
            iva,
            total,
            estado,
            es_proforma,
            codigo_orden_trabajo,
            mecanico_orden_trabajo,
            repuestos,
            mano_obra
          )
          VALUES (
            ${codigo},
            ${cliente_nombre},
            ${cliente_cedula},
            ${vehiculo_placa},
            ${descuento_mano_obra || 0},
            ${subtotal_repuestos},
            ${subtotal_mano_obra},
            ${iva},
            ${total},
            ${estado || 'borrador'},
            ${es_proforma || false},
            ${codigo_orden_trabajo || null},
            ${mecanico_orden_trabajo || null},
            ${JSON.stringify(repuestos || [])},
            ${JSON.stringify(mano_obra || [])}
          )
          RETURNING *
        `;

        return successResponse(result[0], 201);
      }

      case 'PUT': {
        if (!id) {
          return errorResponse('ID de cotización requerido', 400);
        }

        const body = JSON.parse(event.body || '{}');

        // Verificar que la cotización existe
        const existente = await sql`
          SELECT id FROM cotizaciones WHERE id = ${id}
        `;

        if (existente.length === 0) {
          return errorResponse('Cotización no encontrada', 404);
        }

        // Construir UPDATE dinámicamente
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        const allowedFields = [
          'descuento_mano_obra',
          'subtotal_repuestos',
          'subtotal_mano_obra',
          'iva',
          'total',
          'repuestos',
          'mano_obra',
          'estado',
          'es_proforma',
          'codigo_orden_trabajo',
          'mecanico_orden_trabajo'
        ];

        for (const field of allowedFields) {
          if (body[field] !== undefined) {
            // Convertir arrays a JSON para campos repuestos y mano_obra
            if (field === 'repuestos' || field === 'mano_obra') {
              values.push(JSON.stringify(body[field]));
            } else {
              values.push(body[field]);
            }
            updates.push(`${field} = $${paramCount}`);
            paramCount++;
          }
        }

        if (updates.length === 0) {
          return errorResponse('No se proporcionaron campos para actualizar', 400);
        }

        values.push(id);
        const query = `
          UPDATE cotizaciones 
          SET ${updates.join(', ')}
          WHERE id = $${paramCount}
          RETURNING *
        `;

        const result = await sql(query, values);
        return successResponse(result[0]);
      }

      case 'DELETE': {
        if (!id) {
          return errorResponse('ID de cotización requerido', 400);
        }

        const result = await sql`
          DELETE FROM cotizaciones 
          WHERE id = ${id}
          RETURNING *
        `;

        if (result.length === 0) {
          return errorResponse('Cotización no encontrada', 404);
        }

        return successResponse({ id, deleted: true });
      }

      default:
        return errorResponse('Método no permitido', 405);
    }
  } catch (error) {
    console.error('Error en cotizaciones:', error);
    
    if (error instanceof Error) {
      if (error.message === 'NO_TOKEN') {
        return errorResponse('No se proporcionó token de autenticación', 401);
      }
      if (error.message === 'INVALID_TOKEN') {
        return errorResponse('Token de autenticación inválido', 401);
      }
      return errorResponse(error.message, 500);
    }
    
    return errorResponse('Error desconocido', 500);
  }
};
