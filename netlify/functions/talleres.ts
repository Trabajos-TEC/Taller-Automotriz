import { Handler } from '@netlify/functions';
import { getConnection, corsHeaders, successResponse, errorResponse } from './utils/db';

/**
 * Función Netlify para gestionar talleres
 * Endpoint: /.netlify/functions/talleres
 * Métodos: GET, POST, PUT, DELETE
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const sql = getConnection();
    const path = event.path.replace('/.netlify/functions/talleres', '');
    const segments = path.split('/').filter(Boolean);
    const id = segments[0] ? parseInt(segments[0], 10) : null;

    switch (event.httpMethod) {
      case 'GET':
        if (id) {
          // Obtener un taller por ID
          const taller = await sql`
            SELECT * FROM talleres WHERE id = ${id}
          `;
          
          if (taller.length === 0) {
            return errorResponse('Taller no encontrado', 404);
          }
          
          return successResponse(taller[0]);
        } else {
          // Obtener todos los talleres
          const talleres = await sql`
            SELECT * FROM talleres ORDER BY nombre
          `;
          return successResponse(talleres);
        }

      case 'POST': {
        // Crear un nuevo taller
        const { nombre, direccion, telefono, ruc } = JSON.parse(event.body || '{}');

        if (!nombre || !ruc) {
          return errorResponse('Nombre y RUC son requeridos', 400);
        }

        // Verificar si el RUC ya existe
        const existingRuc = await sql`
          SELECT id FROM talleres WHERE ruc = ${ruc}
        `;

        if (existingRuc.length > 0) {
          return errorResponse('Ya existe un taller con ese RUC', 400);
        }

        const nuevoTaller = await sql`
          INSERT INTO talleres (nombre, direccion, telefono, ruc)
          VALUES (${nombre}, ${direccion || null}, ${telefono || null}, ${ruc})
          RETURNING *
        `;

        return successResponse(nuevoTaller[0], 201);
      }

      case 'PUT': {
        // Actualizar un taller
        if (!id) {
          return errorResponse('ID del taller requerido', 400);
        }

        const { nombre, direccion, telefono, ruc } = JSON.parse(event.body || '{}');

        // Verificar si el taller existe
        const existingTaller = await sql`
          SELECT * FROM talleres WHERE id = ${id}
        `;

        if (existingTaller.length === 0) {
          return errorResponse('Taller no encontrado', 404);
        }

        // Si se está cambiando el RUC, verificar que no esté en uso
        if (ruc && ruc !== existingTaller[0].ruc) {
          const rucExists = await sql`
            SELECT id FROM talleres WHERE ruc = ${ruc} AND id != ${id}
          `;

          if (rucExists.length > 0) {
            return errorResponse('Ya existe un taller con ese RUC', 400);
          }
        }

        const tallerActualizado = await sql`
          UPDATE talleres
          SET 
            nombre = COALESCE(${nombre}, nombre),
            direccion = COALESCE(${direccion}, direccion),
            telefono = COALESCE(${telefono}, telefono),
            ruc = COALESCE(${ruc}, ruc)
          WHERE id = ${id}
          RETURNING *
        `;

        return successResponse(tallerActualizado[0]);
      }

      case 'DELETE': {
        // Eliminar un taller
        if (!id) {
          return errorResponse('ID del taller requerido', 400);
        }

        const tallerEliminado = await sql`
          DELETE FROM talleres WHERE id = ${id}
          RETURNING *
        `;

        if (tallerEliminado.length === 0) {
          return errorResponse('Taller no encontrado', 404);
        }

        return successResponse({ 
          message: 'Taller eliminado exitosamente',
          taller: tallerEliminado[0]
        });
      }

      default:
        return errorResponse('Método no permitido', 405);
    }
  } catch (error) {
    console.error('Error en talleres:', error);
    return errorResponse(error instanceof Error ? error : 'Error en el servidor');
  }
};
