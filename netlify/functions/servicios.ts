import { Handler } from '@netlify/functions';
import { getConnection, corsHeaders, successResponse, errorResponse } from './utils/db';

/**
 * Función Netlify para gestionar servicios de mano de obra
 * Endpoint: /.netlify/functions/servicios
 * Soporta: GET, POST, PUT, DELETE
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const sql = getConnection();
    const pathParts = event.path.split('/').filter(Boolean);
    const codigo = pathParts[pathParts.length - 1] !== 'servicios' ? pathParts[pathParts.length - 1] : null;

    // GET - Obtener servicios
    if (event.httpMethod === 'GET') {
      const search = event.queryStringParameters?.search || '';

      // GET /servicios/:codigo - Servicio específico
      if (codigo && codigo !== 'servicios') {
        const servicio = await sql`
          SELECT * FROM servicios 
          WHERE codigo = ${codigo} AND activo = true
          LIMIT 1
        `;
        
        if (servicio.length === 0) {
          return errorResponse('Servicio no encontrado', 404);
        }
        
        return successResponse(servicio[0]);
      }

      // GET /servicios - Todos los servicios
      let servicios;
      if (search) {
        servicios = await sql`
          SELECT * FROM servicios 
          WHERE activo = true
            AND (
              codigo ILIKE ${'%' + search + '%'} OR 
              nombre ILIKE ${'%' + search + '%'} OR 
              descripcion ILIKE ${'%' + search + '%'}
            )
          ORDER BY nombre
        `;
      } else {
        servicios = await sql`
          SELECT * FROM servicios 
          WHERE activo = true
          ORDER BY nombre
        `;
      }

      return successResponse(servicios);
    }

    // POST - Crear servicio
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { codigo, nombre, descripcion, precio, duracion_estimada } = body;

      if (!codigo || !nombre || precio === undefined) {
        return errorResponse('Código, nombre y precio son requeridos', 400);
      }

      // Verificar código único
      const existing = await sql`
        SELECT id FROM servicios WHERE codigo = ${codigo} LIMIT 1
      `;
      
      if (existing.length > 0) {
        return errorResponse('El código ya está registrado', 409);
      }

      const result = await sql`
        INSERT INTO servicios (codigo, nombre, descripcion, precio, duracion_estimada, activo)
        VALUES (${codigo}, ${nombre}, ${descripcion || null}, ${precio}, ${duracion_estimada || null}, true)
        RETURNING *
      `;

      return successResponse(result[0], 201);
    }

    // PUT - Actualizar servicio
    if (event.httpMethod === 'PUT' && codigo) {
      const body = JSON.parse(event.body || '{}');
      const { nombre, descripcion, precio, duracion_estimada, activo } = body;

      const result = await sql`
        UPDATE servicios
        SET nombre = COALESCE(${nombre}, nombre),
            descripcion = COALESCE(${descripcion}, descripcion),
            precio = COALESCE(${precio}, precio),
            duracion_estimada = COALESCE(${duracion_estimada}, duracion_estimada),
            activo = COALESCE(${activo}, activo)
        WHERE codigo = ${codigo}
        RETURNING *
      `;

      if (result.length === 0) {
        return errorResponse('Servicio no encontrado', 404);
      }

      return successResponse(result[0]);
    }

    // DELETE - Desactivar servicio (soft delete)
    if (event.httpMethod === 'DELETE' && codigo) {
      const result = await sql`
        UPDATE servicios
        SET activo = false
        WHERE codigo = ${codigo}
        RETURNING id
      `;

      if (result.length === 0) {
        return errorResponse('Servicio no encontrado', 404);
      }

      return successResponse({ message: 'Servicio desactivado exitosamente' });
    }

    return errorResponse('Método no permitido', 405);

  } catch (error) {
    console.error('Error en servicios:', error);
    return errorResponse(error instanceof Error ? error : 'Error interno del servidor');
  }
};
